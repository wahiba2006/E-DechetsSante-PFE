const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Initialisation de l'application
const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Pour parser le body en JSON

// Route de test
app.get('/api/test', (req, res) => {
    res.json({ message: 'Serveur opérationnel !' });
});

// Importation des routes et services
const authRoutes = require('./routes/authRoutes');
const dechetRoutes = require('./routes/dechetRoutes');
const apiRoutes = require('./routes/apiRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const cronService = require('./services/cronService');

app.use('/api/auth', authRoutes);
app.use('/api/dechets', dechetRoutes);
app.use('/api', apiRoutes);
app.use('/api/upload', uploadRoutes);

// Rendre le dossier uploads accessible publiquement (pour afficher les images/pdf)
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Démarrer le service Cron
cronService.start();

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});
