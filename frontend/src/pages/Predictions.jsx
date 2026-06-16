import { useState, useEffect } from 'react';
import axios from 'axios';
import { BrainCircuit, TrendingUp, AlertTriangle } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const Predictions = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));

    const fetchPredictions = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/predict');
        setPredictions(res.data.predictions);
      } catch (err) {
        setError("Impossible de contacter le moteur IA. Vérifiez que le serveur Python (app.py) est lancé sur le port 5001.");
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, []);

  if (!user) return null;

  if (user.role === 'Infirmier' || user.role === 'Equipe_Collecte') {
    return (
      <div className="app-wrapper">
        <Sidebar user={user} />
        <div className="main-content">
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', marginTop: '2rem' }}>
            <AlertTriangle size={48} color="var(--danger)" style={{ marginBottom: '1rem' }} />
            <h2>Accès Réservé</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Les prévisions IA sont réservées à l'Administrateur et au Responsable Sanitaire.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const maxKg = predictions.length > 0 ? Math.max(...predictions.map(p => p.total_kg)) : 100;

  return (
    <div className="app-wrapper">
      <Sidebar user={user} />
      <div className="main-content animate-fade-in">

        {/* Top bar */}
        <div className="topbar">
          <div>
            <div className="topbar-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BrainCircuit size={22} color="#8b5cf6" /> Prédictions IA
            </div>
            <div className="topbar-subtitle">
              Prévisions basées sur l'historique de l'hôpital (Machine Learning)
            </div>
          </div>
          <div style={{ background: '#ede9fe', color: '#6d28d9', padding: '6px 16px', borderRadius: '100px', fontSize: '0.82rem', fontWeight: '700' }}>
            🧠 Modèle IA actif
          </div>
        </div>

        {error && (
          <div style={{
            background: '#fee2e2', border: '1px solid #fecaca',
            borderLeft: '4px solid var(--danger)',
            color: 'var(--danger)', padding: '14px 18px',
            borderRadius: '10px', marginBottom: '1.5rem', fontSize: '0.9rem'
          }}>
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
            <div style={{
              width: '40px', height: '40px', border: '3px solid #e2e8f0',
              borderTopColor: '#8b5cf6', borderRadius: '50%',
              animation: 'spin 1s linear infinite', margin: '0 auto 1rem'
            }} />
            <p style={{ color: 'var(--text-muted)' }}>Génération des prédictions en cours...</p>
          </div>
        ) : (
          predictions.length > 0 && (
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
                <TrendingUp size={20} color="#8b5cf6" />
                Prévision du volume total (kg) — 7 prochains jours
              </h3>

              {/* Bar chart */}
              <div style={{
                display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
                height: '280px', paddingBottom: '20px', borderBottom: '2px solid var(--border)', gap: '10px'
              }}>
                {predictions.map((p, index) => {
                  const heightPercent = (p.total_kg / maxKg) * 100;
                  const isHigh = p.total_kg > 80;
                  const isSelected = selectedDayIndex === index;
                  return (
                    <div 
                      key={index} 
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, cursor: 'pointer', opacity: isSelected ? 1 : 0.6 }}
                      onClick={() => setSelectedDayIndex(index)}
                    >
                      <div style={{ fontSize: '0.78rem', fontWeight: '700', marginBottom: '6px', color: isHigh ? 'var(--danger)' : 'var(--primary)' }}>
                        {p.total_kg} kg
                      </div>
                      <div style={{
                        width: '100%', maxWidth: '50px',
                        height: `${heightPercent}%`,
                        background: isHigh ? '#fee2e2' : '#ede9fe',
                        border: `2px solid ${isHigh ? 'var(--danger)' : '#8b5cf6'}`,
                        borderRadius: '8px 8px 0 0',
                        transition: 'height 1s ease'
                      }} />
                    </div>
                  );
                })}
              </div>

              {/* Jours */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', gap: '10px' }}>
                {predictions.map((p, index) => {
                  const isSelected = selectedDayIndex === index;
                  return (
                    <div 
                      key={index} 
                      onClick={() => setSelectedDayIndex(index)}
                      style={{ flex: 1, textAlign: 'center', fontSize: '0.85rem', color: isSelected ? 'var(--primary)' : 'var(--text-muted)', fontWeight: isSelected ? '800' : '500', cursor: 'pointer' }}
                    >
                      {p.jour}
                    </div>
                  );
                })}
              </div>

              {/* Détails par service */}
              <div style={{ marginTop: '2.5rem' }}>
                <h4 style={{ marginBottom: '1rem', color: 'var(--text-main)', fontSize: '0.95rem' }}>
                  Détails par service — {predictions[selectedDayIndex].jour} :
                </h4>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {Object.entries(predictions[selectedDayIndex].details).map(([service, kg]) => (
                    <div key={service} style={{
                      background: 'var(--bg-card-alt)',
                      padding: '14px 20px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)'
                    }}>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '4px' }}>{service}</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#8b5cf6' }}>
                        {kg} <span style={{ fontSize: '0.9rem', fontWeight: '400' }}>kg</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        )}
      </div>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Predictions;
