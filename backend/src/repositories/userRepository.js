const db = require('../config/db');

class UserRepository {
    async findAll() {
        const [rows] = await db.query('SELECT id, nom, prenom, email, role, created_at FROM users WHERE is_active = TRUE');
        return rows;
    }

    async findByEmail(email) {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    }

    async findById(id) {
        const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
        return rows[0];
    }

    async create(userData) {
        const { nom, prenom, email, password, role, service_id } = userData;
        const [result] = await db.query(
            'INSERT INTO users (nom, prenom, email, password, role, service_id) VALUES (?, ?, ?, ?, ?, ?)',
            [nom, prenom, email, password, role, service_id || null]
        );
        return result.insertId;
    }

    async update(id, userData) {
        const { nom, prenom, email, role } = userData;
        await db.query(
            'UPDATE users SET nom = ?, prenom = ?, email = ?, role = ? WHERE id = ?',
            [nom, prenom, email, role, id]
        );
        return true;
    }

    async delete(id) {
        await db.query('UPDATE users SET is_active = FALSE WHERE id = ?', [id]);
        return true;
    }
}

module.exports = new UserRepository();
