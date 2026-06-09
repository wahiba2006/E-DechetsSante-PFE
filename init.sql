-- Création de la base de données
CREATE DATABASE IF NOT EXISTS gestion_dechets_medicaux;
USE gestion_dechets_medicaux;

-- Table des services
CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertion de quelques services par défaut
INSERT INTO services (nom) VALUES ('Urgences'), ('Chirurgie'), ('Réanimation'), ('Maternité'), ('Laboratoire') ON DUPLICATE KEY UPDATE nom=nom;

-- Table des utilisateurs (avec rôles)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('Administrateur', 'Infirmier', 'Equipe_Collecte', 'Responsable_Sanitaire') NOT NULL,
    service_id INT DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL
);

-- Insertion du compte Administrateur par défaut (mot de passe: password123)
INSERT INTO users (nom, prenom, email, password, role) 
VALUES ('Admin', 'Principal', 'admin@hopital.com', '$2b$10$1JJouUUlhsuEWREns6IkoO4F.hsLDPfoi1iat7zAv1Sz0S8mM11jG', 'Administrateur') 
ON DUPLICATE KEY UPDATE email=email;

-- Table des déchets
CREATE TABLE IF NOT EXISTS dechets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reference VARCHAR(50) NOT NULL UNIQUE,
    type VARCHAR(100) NOT NULL, -- ex: DASRI, Déchets chimiques...
    niveau_dangerosite ENUM('Faible', 'Moyen', 'Eleve') NOT NULL,
    couleur_conteneur ENUM('Jaune', 'Rouge', 'Noir', 'Vert') NOT NULL,
    quantite_kg DECIMAL(10, 2) NOT NULL,
    statut ENUM('Produit', 'En attente de collecte', 'En cours', 'Collecte', 'Traite', 'Elimine') DEFAULT 'Produit',
    service_id INT NOT NULL,
    enregistre_par INT NOT NULL, -- id de l'infirmier
    date_production TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services(id),
    FOREIGN KEY (enregistre_par) REFERENCES users(id)
);

-- Table des collectes
CREATE TABLE IF NOT EXISTS collectes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dechet_id INT NOT NULL,
    equipe_id INT NOT NULL, -- id du membre de l'équipe de collecte
    date_collecte TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    statut_confirmation ENUM('En attente', 'Confirmee') DEFAULT 'Confirmee',
    FOREIGN KEY (dechet_id) REFERENCES dechets(id) ON DELETE CASCADE,
    FOREIGN KEY (equipe_id) REFERENCES users(id)
);

-- Table des alertes
CREATE TABLE IF NOT EXISTS alertes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type_alerte ENUM('Capacite', 'Delai', 'Erreur_Classification', 'Non_Conformite') NOT NULL,
    message TEXT NOT NULL,
    statut ENUM('Active', 'Resolue') DEFAULT 'Active',
    dechet_id INT DEFAULT NULL,
    service_id INT DEFAULT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dechet_id) REFERENCES dechets(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);
