const db = require('../config/db');

class DechetRepository {
    async create(dechetData, infirmierId) {
        const { reference, type, niveau_dangerosite, couleur_conteneur, quantite_kg, service_id } = dechetData;
        const [result] = await db.query(
            `INSERT INTO dechets 
            (reference, type, niveau_dangerosite, couleur_conteneur, quantite_kg, service_id, enregistre_par, statut) 
            VALUES (?, ?, ?, ?, ?, ?, ?, 'Produit')`,
            [reference, type, niveau_dangerosite, couleur_conteneur, quantite_kg, service_id, infirmierId]
        );
        return result.insertId;
    }

    async findAll() {
        const [rows] = await db.query(`
            SELECT d.*, s.nom as service_nom, u.nom as infirmier_nom, u.prenom as infirmier_prenom 
            FROM dechets d
            LEFT JOIN services s ON d.service_id = s.id
            LEFT JOIN users u ON d.enregistre_par = u.id
            ORDER BY d.date_production DESC
        `);
        return rows;
    }

    async updateStatus(id, statut) {
        const [result] = await db.query(
            'UPDATE dechets SET statut = ? WHERE id = ?',
            [statut, id]
        );
        return result.affectedRows > 0;
    }

    async getDechetsByConteneur(service_id, couleur_conteneur) {
        const [rows] = await db.query(
            'SELECT id FROM dechets WHERE service_id = ? AND couleur_conteneur = ? AND statut IN ("Produit", "En attente de collecte", "En cours")',
            [service_id, couleur_conteneur]
        );
        return rows;
    }

    async updateStatusByConteneur(service_id, couleur_conteneur, statut) {
        const [result] = await db.query(
            'UPDATE dechets SET statut = ? WHERE service_id = ? AND couleur_conteneur = ? AND statut IN ("Produit", "En attente de collecte", "En cours")',
            [statut, service_id, couleur_conteneur]
        );
        return result.affectedRows > 0;
    }
}

module.exports = new DechetRepository();
