const dechetService = require('../services/dechetService');

class DechetController {
    async getCapaciteStats(req, res) {
        try {
            const db = require('../config/db');
            const CAPACITES = { 'Jaune': 30, 'Rouge': 20, 'Vert': 25, 'Noir': 50 };

            const [rows] = await db.query(`
                SELECT s.id as service_id, s.nom as service_nom, 
                       d.couleur_conteneur, COALESCE(SUM(d.quantite_kg), 0) as total_kg,
                       MAX(CASE WHEN d.statut = 'En cours' THEN 1 ELSE 0 END) as is_en_cours
                FROM services s
                LEFT JOIN dechets d ON d.service_id = s.id 
                    AND d.couleur_conteneur IS NOT NULL
                    AND d.statut IN ('Produit', 'En attente de collecte', 'En cours')
                GROUP BY s.id, s.nom, d.couleur_conteneur
                ORDER BY s.nom, d.couleur_conteneur
            `);

            // Structurer les données par service
            const services = {};
            rows.forEach(row => {
                if (!services[row.service_id]) {
                    services[row.service_id] = { id: row.service_id, nom: row.service_nom, conteneurs: {} };
                }
                if (row.couleur_conteneur) {
                    const pct = Math.min(100, Math.round((parseFloat(row.total_kg) / CAPACITES[row.couleur_conteneur]) * 100));
                    services[row.service_id].conteneurs[row.couleur_conteneur] = {
                        total_kg: parseFloat(row.total_kg).toFixed(1),
                        capacite_max: CAPACITES[row.couleur_conteneur],
                        pourcentage: pct,
                        is_en_cours: row.is_en_cours === 1
                    };
                }
            });

            res.json(Object.values(services));
        } catch (error) {
            res.status(500).json({ error: 'Erreur capacité.' });
        }
    }

    async demarrerCollecteConteneur(req, res) {
        try {
            const { service_id, couleur_conteneur } = req.body;
            await dechetService.demarrerCollecteConteneur(service_id, couleur_conteneur);
            res.json({ message: 'Collecte démarrée avec succès.' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getServices(req, res) {
        try {
            const db = require('../config/db');
            const [services] = await db.query('SELECT id, nom FROM services ORDER BY nom');
            res.json(services);
        } catch (error) {
            res.status(500).json({ error: 'Erreur lors de la récupération des services.' });
        }
    }

    async createDechet(req, res) {
        try {
            // L'utilisateur est injecté par le middleware 'protect'
            const result = await dechetService.addDechet(req.body, req.user);
            res.status(201).json({ 
                message: `Déchet enregistré avec succès ! Veuillez le jeter dans la Poubelle ${result.couleur}.`, 
                dechetId: result.id,
                couleur: result.couleur
            });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getAllDechets(req, res) {
        try {
            const dechets = await dechetService.getAllDechets();
            res.json(dechets);
        } catch (error) {
            res.status(500).json({ error: 'Erreur lors de la récupération des déchets.' });
        }
    }

    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { statut } = req.body;
            
            // On passe req.user pour savoir qui a effectué l'action
            await dechetService.changeDechetStatus(id, statut, req.user);
            res.json({ message: 'Statut du déchet mis à jour avec succès.' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async collecteConteneur(req, res) {
        try {
            const { service_id, couleur_conteneur } = req.body;
            await dechetService.collecteConteneur(service_id, couleur_conteneur, req.user);
            res.json({ message: 'Conteneur collecté avec succès.' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = new DechetController();
