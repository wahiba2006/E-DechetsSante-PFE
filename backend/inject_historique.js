/**
 * SCRIPT D'INJECTION D'HISTORIQUE
 * =================================
 * Ce script génère 500 déchets médicaux réalistes dans la base de données MySQL.
 * Il simule 6 mois de travail des infirmières dans l'hôpital.
 *
 * UTILISATION: node inject_historique.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gestion_dechets_medicaux',
};

// Règles réalistes par service (identique au modèle IA)
const services = [
  { id: 1, nom: 'Urgences',     base_kg: 22, conteneur: 'Rouge' },
  { id: 2, nom: 'Chirurgie',    base_kg: 15, conteneur: 'Jaune' },
  { id: 3, nom: 'Réanimation',  base_kg: 12, conteneur: 'Rouge' },
  { id: 4, nom: 'Maternité',    base_kg: 10, conteneur: 'Jaune' },
  { id: 5, nom: 'Laboratoire',  base_kg: 8,  conteneur: 'Vert'  },
];

const types = ['DASRI - Seringues', 'DASRI - Pansements', 'Chimique - Medicaments', 'Toxique - Reactifs', 'Verre'];
const niveaux = ['Faible', 'Moyen', 'Eleve'];

// Retourne un multiplicateur de charge selon le jour de la semaine
function getJourMultiplier(jour) {
  // 0=Lundi ... 6=Dimanche
  if (jour === 0 || jour === 1) return 1.5;  // Lundi/Mardi: surcharge
  if (jour === 5 || jour === 6) return 0.75; // Weekend: moins d'activité
  return 1.0; // Milieu de semaine: normal
}

// Génère un nombre aléatoire avec un bruit gaussien léger
function bruit(val, sigma = 2.5) {
  const u1 = Math.random(), u2 = Math.random();
  const gauss = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return Math.max(0.5, parseFloat((val + gauss * sigma).toFixed(2)));
}

// Génère une date dans les 6 derniers mois
function dateAleatoire() {
  const maintenant = new Date();
  const sixMoisAgo = new Date();
  sixMoisAgo.setMonth(sixMoisAgo.getMonth() - 6);
  const timestamp = sixMoisAgo.getTime() + Math.random() * (maintenant.getTime() - sixMoisAgo.getTime());
  return new Date(timestamp);
}

function genererReference(index) {
  const ts = Date.now();
  return `HIST-${ts}-${String(index).padStart(4, '0')}`;
}

async function main() {
  console.log('🔌 Connexion à la base de données...');
  const conn = await mysql.createConnection(config);
  console.log('✅ Connecté !');

  // Récupérer l'ID de l'admin (enregistre_par obligatoire)
  const [admins] = await conn.execute("SELECT id FROM users WHERE role = 'Administrateur' LIMIT 1");
  if (admins.length === 0) {
    console.error('❌ Aucun administrateur trouvé. Veuillez créer un compte admin avant.');
    process.exit(1);
  }
  const adminId = admins[0].id;
  console.log(`👤 Enregistrements attribués à l'admin (id: ${adminId})`);

  const NB_DECHETS = 500;
  let inseres = 0;

  console.log(`\n📦 Injection de ${NB_DECHETS} déchets historiques...`);

  for (let i = 0; i < NB_DECHETS; i++) {
    const service = services[Math.floor(Math.random() * services.length)];
    const date = dateAleatoire();
    const jour = date.getDay() === 0 ? 6 : date.getDay() - 1; // Convertir JS (0=Dim) -> (0=Lundi)
    const multiplier = getJourMultiplier(jour);
    const quantite = bruit(service.base_kg * multiplier);
    const type = types[Math.floor(Math.random() * types.length)];
    const niveau = niveaux[Math.floor(Math.random() * niveaux.length)];
    const ref = genererReference(i);

    try {
      await conn.execute(
        `INSERT INTO dechets 
          (reference, type, niveau_dangerosite, couleur_conteneur, quantite_kg, statut, service_id, enregistre_par, date_production)
         VALUES (?, ?, ?, ?, ?, 'Collecte', ?, ?, ?)`,
        [ref, type, niveau, service.conteneur, quantite, service.id, adminId, date]
      );
      inseres++;
      if (inseres % 100 === 0) console.log(`  ... ${inseres}/${NB_DECHETS} insérés`);
    } catch (err) {
      // Ignorer les doublons de référence
      if (err.code !== 'ER_DUP_ENTRY') console.error('Erreur:', err.message);
    }
  }

  await conn.end();
  console.log(`\n🎉 TERMINÉ ! ${inseres} déchets historiques injectés dans MySQL.`);
  console.log('📌 Prochaine étape: Relancer "python train_model.py" dans le dossier /ai');
}

main().catch(console.error);
