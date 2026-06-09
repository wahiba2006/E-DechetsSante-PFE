const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

class AuthService {
    async registerUser(userData) {
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await userRepository.findByEmail(userData.email);
        if (existingUser) {
            throw new Error('Un utilisateur avec cet email existe déjà.');
        }

        // Hacher le mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);

        // Créer l'utilisateur avec le mot de passe haché
        const newUser = { ...userData, password: hashedPassword };
        const insertId = await userRepository.create(newUser);
        
        return insertId;
    }

    async login(email, password) {
        // Chercher l'utilisateur
        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw new Error('Identifiants invalides.');
        }

        // Vérifier si le compte est actif (Soft Delete)
        if (user.is_active === 0 || user.is_active === false) {
            throw new Error('Ce compte a été désactivé par un administrateur.');
        }

        // Comparer le mot de passe
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Identifiants invalides.');
        }

        // Générer le token JWT
        const payload = {
            user: {
                id: user.id,
                role: user.role,
                service_id: user.service_id
            }
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
        
        return {
            token,
            user: {
                id: user.id,
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
                role: user.role
            }
        };
    }
    async getAllUsers() {
        return await userRepository.findAll();
    }

    async updateUser(id, userData) {
        return await userRepository.update(id, userData);
    }

    async deleteUser(id) {
        return await userRepository.delete(id);
    }
}

module.exports = new AuthService();
