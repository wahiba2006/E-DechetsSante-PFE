FROM python:3.10-slim

WORKDIR /app

# Copier le fichier des dépendances
COPY requirements.txt .

# Installer les dépendances
RUN pip install --no-cache-dir -r requirements.txt

# Copier tout le code (incluant le modèle .pkl)
COPY . .

# Exposer le port de Flask
EXPOSE 5001

# Lancer l'API Python
CMD ["python", "app.py"]
