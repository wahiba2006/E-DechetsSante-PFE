import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
import pickle
import mysql.connector

print("--- Connexion à la Base de Données MySQL ---")
try:
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="gestion_dechets_medicaux"
    )
    cursor = conn.cursor()
    print("✅ Connecté à MySQL !")
except Exception as e:
    print(f"❌ Erreur de connexion MySQL: {e}")
    exit(1)

# Récupérer l'historique réel des déchets depuis MySQL
print("--- Lecture des données réelles depuis MySQL ---")
cursor.execute("""
    SELECT 
        s.nom AS service,
        DAYOFWEEK(d.date_production) AS jour_js,
        d.quantite_kg
    FROM dechets d
    JOIN services s ON d.service_id = s.id
    WHERE d.date_production IS NOT NULL
""")
rows = cursor.fetchall()
cursor.close()
conn.close()

if len(rows) < 50:
    print(f"⚠️  Seulement {len(rows)} enregistrements trouvés dans MySQL.")
    print("   Conseil: Lancez d'abord 'node inject_historique.js' pour injecter l'historique.")
    print("   Continuation avec les données disponibles...")

print(f"✅ {len(rows)} enregistrements chargés depuis MySQL.")

# Convertir le jour JS (1=Dimanche, 2=Lundi ... 7=Samedi) -> (0=Lundi ... 6=Dimanche)
data = []
for row in rows:
    service, jour_js, quantite_kg = row
    jour = (int(jour_js) - 2) % 7  # Convertir JS -> 0=Lundi, 6=Dimanche
    data.append([service, jour, float(quantite_kg)])

df = pd.DataFrame(data, columns=['service', 'jour_semaine', 'quantite_kg'])

print("--- Encodage et Entraînement du Modèle (RandomForest) ---")
le = LabelEncoder()
df['service_encoded'] = le.fit_transform(df['service'])

X = df[['service_encoded', 'jour_semaine']]
y = df['quantite_kg']

model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X, y)

print("--- Sauvegarde du Modèle ---")
with open('model.pkl', 'wb') as f:
    pickle.dump(model, f)

with open('encoder.pkl', 'wb') as f:
    pickle.dump(le, f)

print("✅ Modèle entraîné sur les données RÉELLES de MySQL et sauvegardé dans model.pkl !")
print(f"   Services appris: {list(le.classes_)}")
