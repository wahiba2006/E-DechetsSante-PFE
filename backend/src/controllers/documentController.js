const db = require('../config/db');

exports.getDocuments = async (req, res) => {
    try {
        const query = `
            SELECT d.*, u.nom, u.prenom 
            FROM documents d
            JOIN users u ON d.uploaded_by = u.id
            ORDER BY d.created_at DESC
        `;
        const [docs] = await db.query(query);
        res.json(docs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const [docs] = await db.query('SELECT * FROM documents WHERE id = ?', [id]);
        
        if (docs.length === 0) {
            return res.status(404).json({ message: "Document introuvable" });
        }

        const doc = docs[0];

        // Seul l'admin ou le créateur peut supprimer
        if (req.user.role !== 'Administrateur' && req.user.id !== doc.uploaded_by) {
            return res.status(403).json({ message: "Non autorisé à supprimer ce document" });
        }

        // 1. Supprimer le fichier du disque dur (si on veut être propre)
        const fs = require('fs');
        const path = require('path');
        // Le chemin est stocké sous forme "/uploads/filename", donc on récupère le nom
        const filename = doc.path.split('/uploads/')[1];
        if (filename) {
            const fullPath = path.join(__dirname, '../../uploads', filename);
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
            }
        }

        // 2. Supprimer de la Base de Données
        await db.query('DELETE FROM documents WHERE id = ?', [id]);

        res.json({ message: "Document supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
