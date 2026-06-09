const jwt = require('jsonwebtoken');

// Middleware pour vérifier si l'utilisateur est authentifié
const protect = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Récupérer le token depuis le header
            token = req.headers.authorization.split(' ')[1];

            // Vérifier le token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Ajouter l'utilisateur à la requête
            req.user = decoded.user;
            next();
        } catch (error) {
            res.status(401).json({ error: 'Non autorisé, token invalide' });
        }
    }

    if (!token) {
        res.status(401).json({ error: 'Non autorisé, pas de token' });
    }
};

// Middleware pour vérifier les rôles (ex: authoriseRoles('Administrateur', 'Infirmier'))
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                error: `Accès refusé pour le rôle: ${req.user.role}` 
            });
        }
        next();
    };
};

module.exports = { protect, authorizeRoles };
