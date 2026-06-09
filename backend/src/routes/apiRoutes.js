const express = require('express');
const router = express.Router();
const alerteController = require('../controllers/alerteController');
const dashboardController = require('../controllers/dashboardController');
const documentController = require('../controllers/documentController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

// === ROUTES ALERTES ===
// Tout utilisateur connecté peut voir les alertes actives
router.get('/alertes', protect, alerteController.getActiveAlertes);
// Seul un Administrateur ou Responsable Sanitaire peut résoudre une alerte
router.put('/alertes/:id/resolve', protect, authorizeRoles('Administrateur', 'Responsable_Sanitaire'), alerteController.resolveAlerte);

// Note: La création d'alerte (POST) est normalement automatique, mais on expose la route pour tester
router.post('/alertes', protect, alerteController.create);

// === ROUTES DASHBOARD ===
// Statistiques globales pour l'administrateur
router.get('/dashboard/kpis', protect, dashboardController.getKPIs);
// Rapport complet pour export PDF
router.get('/dashboard/rapport', protect, authorizeRoles('Administrateur', 'Responsable_Sanitaire'), dashboardController.getRapport);

// === ROUTES DOCUMENTS ===
router.get('/documents', protect, documentController.getDocuments);
router.delete('/documents/:id', protect, documentController.deleteDocument);

module.exports = router;
