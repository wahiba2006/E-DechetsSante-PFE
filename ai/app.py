from flask import Flask, jsonify
from flask_cors import CORS
import pickle
import numpy as np

app = Flask(__name__)
CORS(app)

# Chargement du modèle et de l'encodeur
try:
    with open('model.pkl', 'rb') as f:
        model = pickle.load(f)
    with open('encoder.pkl', 'rb') as f:
        le = pickle.load(f)
except Exception as e:
    print("Veuillez d'abord exécuter train_model.py pour générer le modèle.")
    model = None

@app.route('/api/predict', methods=['GET'])
def predict_week():
    if model is None:
        return jsonify({"error": "Modèle non initialisé"}), 500

    # Prédire les déchets pour les 7 prochains jours pour chaque service
    predictions = []
    jours_noms = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
    
    services = le.classes_
    
    for i, jour in enumerate(jours_noms):
        total_jour = 0
        details = {}
        for service in services:
            encoded_service = le.transform([service])[0]
            # Prédire (Service, Jour_Semaine)
            pred = model.predict([[encoded_service, i]])[0]
            details[service] = round(pred, 1)
            total_jour += pred
            
        predictions.append({
            "jour": jour,
            "total_kg": round(total_jour, 1),
            "details": details
        })

    return jsonify({"predictions": predictions})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
