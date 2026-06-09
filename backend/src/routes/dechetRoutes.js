const express = require('express');
const router = express.Router();
const dechetController = require('../controllers/dechetController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

// Toutes les routes des déchets nécessitent d'être connecté
router.use(protect);

// GET /api/dechets/capacite : Stats de remplissage par service et couleur de conteneur
router.get('/capacite', dechetController.getCapaciteStats);

// GET /api/dechets/services : Récupérer la liste des services
router.get('/services', dechetController.getServices);

// GET /api/dechets : Accessible par tout le monde connecté
router.get('/', dechetController.getAllDechets);

// POST /api/dechets : Accessible uniquement par l'Infirmier (et potentiellement Admin)
router.post('/', authorizeRoles('Infirmier', 'Administrateur'), dechetController.createDechet);

// PUT /api/dechets/demarrer-collecte-conteneur : Démarrer la collecte (Statut = En cours)
router.put('/demarrer-collecte-conteneur', authorizeRoles('Equipe_Collecte', 'Administrateur'), dechetController.demarrerCollecteConteneur);

// PUT /api/dechets/collecte-conteneur : Collecter tout un conteneur d'un service
router.put('/collecte-conteneur', authorizeRoles('Equipe_Collecte', 'Administrateur'), dechetController.collecteConteneur);

// PUT /api/dechets/:id/status : Accessible uniquement par l'Equipe de collecte ou Administrateur
router.put('/:id/status', authorizeRoles('Equipe_Collecte', 'Administrateur'), dechetController.updateStatus);

module.exports = router;
