const db = require('../config/db');

class DashboardController {
    async getKPIs(req, res) {
        try {
            // Volume total des déchets
            const [totalVolume] = await db.query('SELECT SUM(quantite_kg) as total FROM dechets');
            
            // Nombre total de déchets (sacs)
            const [totalDechets] = await db.query('SELECT COUNT(*) as count FROM dechets');

            // Déchets par statut (en attente, collectés)
            const [byStatus] = await db.query('SELECT statut, COUNT(*) as count, SUM(quantite_kg) as total_kg FROM dechets GROUP BY statut');
            
            // Déchets par type (DASRI, Chimique, etc.)
            const [byType] = await db.query('SELECT type as type_dechet, COUNT(*) as count FROM dechets GROUP BY type');

            // Alertes actives (erreurs en cours)
            const [activeAlerts] = await db.query('SELECT COUNT(*) as count FROM alertes WHERE statut = "Active"');

            // Total d'alertes générées DEPUIS LE DEBUT (le nombre d'erreurs historiques)
            const [totalAlerts] = await db.query('SELECT COUNT(*) as count FROM alertes');

            // Nombre total d'utilisateurs
            const [totalUsers] = await db.query('SELECT COUNT(*) as count FROM users');

            // Taux de collecte : % de déchets collectés à temps (en moins de 24h)
            // On calcule le nombre de collectes sans alerte associée
            const [collectesTotal] = await db.query('SELECT COUNT(*) as count FROM dechets WHERE statut = "Collecté"');
            const [collectesAvecErreur] = await db.query('SELECT COUNT(*) as count FROM alertes');
            const tauxConformite = collectesTotal[0].count > 0 
                ? Math.max(0, Math.round((1 - collectesAvecErreur[0].count / Math.max(1, totalDechets[0].count)) * 100))
                : 100;

            res.json({
                total_volume_kg: totalVolume[0].total || 0,
                total_dechets: totalDechets[0].count || 0,
                dechets_par_statut: byStatus,
                dechets_par_type: byType,
                alertes_actives: activeAlerts[0].count || 0,
                total_erreurs: totalAlerts[0].count || 0,
                total_utilisateurs: totalUsers[0].count || 0,
                taux_conformite: tauxConformite
            });

        } catch (error) {
            res.status(500).json({ error: 'Erreur lors de la récupération des statistiques.' });
        }
    }
    async getRapport(req, res) {
        try {
            const now = new Date();
            const moisActuel = now.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });

            // KPIs globaux
            const [totalVolume] = await db.query('SELECT SUM(quantite_kg) as total FROM dechets');
            const [totalDechets] = await db.query('SELECT COUNT(*) as count FROM dechets');
            const [collectes] = await db.query("SELECT COUNT(*) as count FROM dechets WHERE statut IN ('Collecte','Traite','Elimine')");
            const [enAttente] = await db.query("SELECT COUNT(*) as count FROM dechets WHERE statut IN ('Produit','En attente de collecte')");
            const [alertesActives] = await db.query("SELECT COUNT(*) as count FROM alertes WHERE statut = 'Active'");
            const [totalUsers] = await db.query('SELECT COUNT(*) as count FROM users WHERE is_active = TRUE');

            // Répartition par service
            const [parService] = await db.query(`
                SELECT s.nom AS service, COUNT(d.id) AS nb_sacs, SUM(d.quantite_kg) AS total_kg
                FROM dechets d JOIN services s ON d.service_id = s.id
                GROUP BY s.nom ORDER BY total_kg DESC
            `);

            // Répartition par type
            const [parType] = await db.query(`
                SELECT type, COUNT(*) as count, SUM(quantite_kg) as total_kg
                FROM dechets GROUP BY type ORDER BY total_kg DESC
            `);

            // Répartition par niveau de danger
            const [parNiveau] = await db.query(`
                SELECT niveau_dangerosite, COUNT(*) as count, SUM(quantite_kg) as total_kg
                FROM dechets GROUP BY niveau_dangerosite
            `);

            // Alertes récentes
            const [alertesRecentes] = await db.query(`
                SELECT type_alerte, message, date_creation FROM alertes
                ORDER BY date_creation DESC LIMIT 5
            `);

            res.json({
                periode: moisActuel,
                date_generation: now.toLocaleDateString('fr-FR'),
                total_volume_kg: totalVolume[0].total || 0,
                total_dechets: totalDechets[0].count || 0,
                total_collectes: collectes[0].count || 0,
                total_en_attente: enAttente[0].count || 0,
                alertes_actives: alertesActives[0].count || 0,
                total_utilisateurs: totalUsers[0].count || 0,
                par_service: parService,
                par_type: parType,
                par_niveau: parNiveau,
                alertes_recentes: alertesRecentes
            });
        } catch (error) {
            res.status(500).json({ error: 'Erreur lors de la génération du rapport.' });
        }
    }
}

module.exports = new DashboardController();

