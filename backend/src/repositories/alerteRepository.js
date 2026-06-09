const db = require('../config/db');

class AlerteRepository {
    async create(alerteData) {
        const { type_alerte, message, dechet_id, service_id } = alerteData;
        const [result] = await db.query(
            'INSERT INTO alertes (type_alerte, message, dechet_id, service_id, statut) VALUES (?, ?, ?, ?, "Active")',
            [type_alerte, message, dechet_id || null, service_id || null]
        );
        return result.insertId;
    }

    async findAllActive() {
        const [rows] = await db.query(`
            SELECT a.*, s.nom as service_nom, d.reference as dechet_reference 
            FROM alertes a
            LEFT JOIN services s ON a.service_id = s.id
            LEFT JOIN dechets d ON a.dechet_id = d.id
            WHERE a.statut = 'Active'
            ORDER BY a.date_creation DESC
        `);
        return rows;
    }

    async resolve(id) {
        const [result] = await db.query('UPDATE alertes SET statut = "Resolue" WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = new AlerteRepository();
