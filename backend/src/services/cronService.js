const cron = require('node-cron');
const db = require('../config/db');
const alerteRepository = require('../repositories/alerteRepository');

class CronService {
    start() {
        console.log("⏰ Cron Service démarré. Vérification des alertes activée.");

        // Cette tâche va s'exécuter tous les jours à minuit (00:00)
        // Pour les tests, on pourrait utiliser '*/5 * * * * *' (toutes les 5 secondes)
        cron.schedule('0 0 * * *', async () => {
            console.log("🔄 Exécution de la tâche Cron : Vérification des retards de collecte...");
            try {
                // Chercher les déchets 'En attente de collecte' ou 'Produit' depuis plus de 24h
                const [dechetsEnRetard] = await db.query(`
                    SELECT id, reference, service_id 
                    FROM dechets 
                    WHERE statut IN ('Produit', 'En attente de collecte') 
                    AND date_production < NOW() - INTERVAL 1 DAY
                `);

                for (const dechet of dechetsEnRetard) {
                    // Vérifier si une alerte existe déjà pour ce déchet pour éviter les doublons
                    const [existingAlert] = await db.query(`
                        SELECT id FROM alertes 
                        WHERE dechet_id = ? AND type_alerte = 'Delai' AND statut = 'Active'
                    `, [dechet.id]);

                    if (existingAlert.length === 0) {
                        // Créer l'alerte
                        await alerteRepository.create({
                            type_alerte: 'Delai',
                            message: `Le déchet ${dechet.reference} n'a pas été collecté depuis plus de 24h !`,
                            dechet_id: dechet.id,
                            service_id: dechet.service_id
                        });
                        console.log(`⚠️ Alerte générée pour le déchet ${dechet.reference}`);
                    }
                }
            } catch (error) {
                console.error("❌ Erreur lors de l'exécution du Cron:", error);
            }
        });
    }
}

module.exports = new CronService();
