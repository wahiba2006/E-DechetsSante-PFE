const db = require('../config/db');

class CollecteRepository {
    async create(collecteData) {
        const { dechet_id, equipe_id } = collecteData;
        const [result] = await db.query(
            'INSERT INTO collectes (dechet_id, equipe_id, statut_confirmation) VALUES (?, ?, "Confirmee")',
            [dechet_id, equipe_id]
        );
        return result.insertId;
    }
}

module.exports = new CollecteRepository();
