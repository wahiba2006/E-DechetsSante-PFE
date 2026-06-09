const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const { protect } = require('../middlewares/authMiddleware');
const db = require('../config/db');

// Route d'upload : POST /api/upload
// On attend un fichier nommé "document" dans le form-data
// Route d'upload : POST /api/upload
// On attend un fichier nommé "document" dans le form-data
router.post('/', protect, upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Veuillez uploader un fichier valide.' });
        }

        const type_document = req.body.type_document || 'Autre';
        const uploaded_by = req.user.id;
        const path = `/uploads/${req.file.filename}`;
        
        // Enregistrer en base de données
        await db.query(
            'INSERT INTO documents (filename, originalname, type_document, path, uploaded_by) VALUES (?, ?, ?, ?, ?)',
            [req.file.filename, req.file.originalname, type_document, path, uploaded_by]
        );

        // Succès de l'upload
        res.status(201).json({
            message: 'Fichier uploadé et sauvegardé avec succès',
            file: {
                filename: req.file.filename,
                path: path,
                size: req.file.size
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
