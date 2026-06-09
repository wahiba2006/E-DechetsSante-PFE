const db = require('./src/config/db');
const bcrypt = require('bcrypt');

async function createAdmin() {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);
        
        await db.query(
            'INSERT INTO users (nom, prenom, email, password, role) VALUES (?, ?, ?, ?, ?)',
            ['Admin', 'Principal', 'admin@hopital.com', hashedPassword, 'Administrateur']
        );
        console.log("Compte Admin créé avec succès !");
        process.exit(0);
    } catch (e) {
        console.error("Erreur:", e.message);
        process.exit(1);
    }
}
createAdmin();
