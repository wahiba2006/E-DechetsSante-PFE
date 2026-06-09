FROM node:18-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier tout le code
COPY . .

# Exposer le port de l'API Node.js
EXPOSE 5000

# Lancer le serveur
CMD ["npm", "start"]
