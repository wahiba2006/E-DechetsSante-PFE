const authService = require('../services/authService');

class AuthController {
    async register(req, res) {
        try {
            const userId = await authService.registerUser(req.body);
            res.status(201).json({ message: 'Utilisateur créé avec succès', userId });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ error: 'Email et mot de passe requis.' });
            }
            
            const result = await authService.login(email, password);
            res.json(result);
        } catch (error) {
            res.status(401).json({ error: error.message });
        }
    }
    async getUsers(req, res) {
        try {
            const users = await authService.getAllUsers();
            res.json(users);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async updateUser(req, res) {
        try {
            await authService.updateUser(req.params.id, req.body);
            res.json({ message: 'Utilisateur mis à jour avec succès' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async deleteUser(req, res) {
        try {
            await authService.deleteUser(req.params.id);
            res.json({ message: 'Utilisateur supprimé avec succès' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = new AuthController();
