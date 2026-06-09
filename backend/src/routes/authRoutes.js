const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

// Routes publiques
router.post('/login', authController.login);

// Routes protégées (Uniquement pour l'Administrateur)
router.post('/register', protect, authorizeRoles('Administrateur'), authController.register);
router.get('/users', protect, authorizeRoles('Administrateur'), authController.getUsers);
router.put('/users/:id', protect, authorizeRoles('Administrateur'), authController.updateUser);
router.delete('/users/:id', protect, authorizeRoles('Administrateur'), authController.deleteUser);

module.exports = router;
