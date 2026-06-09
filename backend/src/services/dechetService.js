const dechetRepository = require('../repositories/dechetRepository');
const collecteRepository = require('../repositories/collecteRepository');

class DechetService {
    async addDechet(dechetData, user) {
        // Validation basique
        if (!dechetData.type || !dechetData.quantite_kg || !dechetData.niveau_dangerosite) {
            throw new Error('Veuillez fournir les informations nécessaires (type, quantite, dangerosite).');
        }

        const serviceId = dechetData.service_id || user.service_id;
        if (!serviceId) {
            throw new Error('Le service d\'origine du déchet est requis.');
        }

        // --- LOGIQUE AUTOMATIQUE ---
        // 1. Génération de référence unique
        const randomStr = Math.floor(1000 + Math.random() * 9000);
        const referenceAuto = `REF-${new Date().getFullYear()}-${randomStr}`;

        // 2. Identification automatique de la couleur du conteneur selon le type
        let couleurAuto = "Noir"; // Par défaut (déchets assimilés aux ordures ménagères)
        const typeLower = dechetData.type.toLowerCase();
        
        if (typeLower.includes("dasri") || typeLower.includes("infectieux") || typeLower.includes("seringue")) {
            couleurAuto = "Jaune";
        } else if (typeLower.includes("chimique") || typeLower.includes("toxique") || typeLower.includes("medicament")) {
            couleurAuto = "Rouge";
        } else if (typeLower.includes("verre")) {
            couleurAuto = "Vert";
        }

        const newDechet = {
            ...dechetData,
            reference: referenceAuto,
            couleur_conteneur: couleurAuto,
            service_id: serviceId
        };

        const insertId = await dechetRepository.create(newDechet, user.id);

        // --- VÉRIFICATION CAPACITÉ PAR CONTENEUR ---
        // Capacité maximale (en kg) de chaque type de conteneur
        const CAPACITES = {
            'Jaune': 30,   // DASRI (seringues, pansements...)
            'Rouge': 20,   // Chimique / Toxique / Médicaments
            'Vert':  25,   // Verre médical
            'Noir':  50    // Déchets assimilés ordinaires
        };
        const SEUIL_POURCENTAGE = 80; // Alerte à 80% de remplissage

        const db = require('../config/db');
        const alerteRepository = require('../repositories/alerteRepository');

        // Pour chaque couleur de conteneur présente dans ce service, vérifier le remplissage
        for (const [couleur, capaciteMax] of Object.entries(CAPACITES)) {
            const [[{ total_kg }]] = await db.query(
                `SELECT COALESCE(SUM(quantite_kg), 0) as total_kg 
                 FROM dechets 
                 WHERE service_id = ? AND couleur_conteneur = ? AND statut IN ('Produit', 'En attente de collecte')`,
                [serviceId, couleur]
            );

            const pourcentage = (parseFloat(total_kg) / capaciteMax) * 100;

            if (pourcentage >= SEUIL_POURCENTAGE) {
                // Récupérer le nom du service
                const [[service]] = await db.query('SELECT nom FROM services WHERE id = ?', [serviceId]);
                const nomService = service ? service.nom : `Service #${serviceId}`;

                // Vérifier qu'une alerte Capacite n'est pas déjà Active pour ce service + cette couleur
                const [[existingAlerte]] = await db.query(
                    `SELECT id FROM alertes 
                     WHERE type_alerte = 'Capacite' AND service_id = ? AND statut = 'Active'
                     AND message LIKE ?`,
                    [serviceId, `%Conteneur ${couleur}%`]
                );

                if (!existingAlerte) {
                    await alerteRepository.create({
                        type_alerte: 'Capacite',
                        message: `🗑️ Conteneur ${couleur} du service "${nomService}" rempli à ${Math.round(pourcentage)}% (${parseFloat(total_kg).toFixed(1)} kg / ${capaciteMax} kg max). Collecte urgente requise !`,
                        service_id: serviceId,
                        dechet_id: insertId
                    });
                }
            }
        }

        return { id: insertId, couleur: couleurAuto };
    }

    async getAllDechets() {
        return await dechetRepository.findAll();
    }

    async changeDechetStatus(dechetId, newStatus, user) {
        const validStatuses = ['Produit', 'En attente de collecte', 'En cours', 'Collecte', 'Traite', 'Elimine'];
        if (!validStatuses.includes(newStatus)) {
            throw new Error('Statut invalide.');
        }

        const success = await dechetRepository.updateStatus(dechetId, newStatus);
        if (!success) {
            throw new Error('Déchet introuvable.');
        }

        // Si le nouveau statut est "Collecte", on enregistre la traçabilité dans la table 'collectes'
        if (newStatus === 'Collecte') {
            await collecteRepository.create({
                dechet_id: dechetId,
                equipe_id: user.id
            });
        }

        return true;
    }

    async demarrerCollecteConteneur(service_id, couleur_conteneur) {
        if (!service_id || !couleur_conteneur) {
            throw new Error('Service et couleur du conteneur requis.');
        }
        
        // Passer tous les déchets du conteneur "En attente de collecte" à "En cours"
        await dechetRepository.updateStatusByConteneur(service_id, couleur_conteneur, 'En cours');
        return true;
    }

    async collecteConteneur(service_id, couleur_conteneur, user) {
        if (!service_id || !couleur_conteneur) {
            throw new Error('Service et couleur du conteneur requis.');
        }

        // Récupérer tous les déchets de ce conteneur qui sont "En cours" (ou "En attente" si on saute l'étape)
        const dechets = await dechetRepository.getDechetsByConteneur(service_id, couleur_conteneur);
        
        if (dechets.length === 0) {
            throw new Error('Aucun déchet pour ce conteneur.');
        }

        // Mettre à jour le statut de tous ces déchets en "Collecte"
        await dechetRepository.updateStatusByConteneur(service_id, couleur_conteneur, 'Collecte');

        // Créer une entrée de collecte pour chaque déchet
        for (const d of dechets) {
            await collecteRepository.create({
                dechet_id: d.id,
                equipe_id: user.id
            });
        }

        // Résoudre l'alerte de capacité associée si elle existe
        const db = require('../config/db');
        await db.query(
            `UPDATE alertes SET statut = 'Resolue' 
             WHERE type_alerte = 'Capacite' AND service_id = ? AND message LIKE ? AND statut = 'Active'`,
            [service_id, `%Conteneur ${couleur_conteneur}%`]
        );

        return true;
    }
}

module.exports = new DechetService();
