FROM node:18-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier tout le code
COPY . .

# Exposer le port de Vite
EXPOSE 5173

# Lancer Vite avec l'option --host pour être accessible depuis l'extérieur du conteneur
CMD ["npm", "run", "dev", "--", "--host"]
