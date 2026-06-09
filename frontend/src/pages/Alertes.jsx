import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const Alertes = () => {
  const [alertes, setAlertes] = useState([]);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  
  const token = localStorage.getItem('token');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
    fetchAlertes();
  }, []);

  const fetchAlertes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/alertes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlertes(response.data);
    } catch (err) {
      console.error("Erreur lors de la récupération des alertes", err);
    }
  };

  const handleResolve = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/alertes/${id}/resolve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Alerte marquée comme résolue avec succès.');
      fetchAlertes();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert("Erreur lors de la résolution de l'alerte.");
    }
  };

  if (!user) return null;

  const canResolve = user.role === 'Responsable_Sanitaire' || user.role === 'Administrateur';

  return (
    <div className="app-wrapper">
      <Sidebar user={user} />
      <div className="main-content animate-fade-in">

        {/* Top bar */}
        <div className="topbar">
          <div>
            <div className="topbar-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Bell size={22} color="var(--danger)" /> Suivi des Alertes
            </div>
            <div className="topbar-subtitle">Retards de collecte détectés (+ de 24h)</div>
          </div>
          <div style={{
            background: alertes.length === 0 ? '#d1fae5' : '#fee2e2',
            color: alertes.length === 0 ? '#047857' : '#b91c1c',
            padding: '6px 16px',
            borderRadius: '100px',
            fontSize: '0.82rem',
            fontWeight: '700'
          }}>
            {alertes.length === 0 ? '✅ Aucune alerte' : `🚨 ${alertes.length} alerte(s) active(s)`}
          </div>
        </div>

        {message && (
          <div style={{
            background: '#d1fae5', color: '#047857', borderLeft: '4px solid #10b981',
            padding: '12px 16px', borderRadius: '8px', marginBottom: '1.5rem',
            display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '500'
          }}>
            <CheckCircle size={18} /> {message}
          </div>
        )}

        <div className="glass-panel" style={{ padding: '2rem' }}>
          {alertes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
              <CheckCircle size={56} color="var(--success)" style={{ opacity: 0.4, marginBottom: '1.5rem' }} />
              <h3 style={{ marginBottom: '0.5rem' }}>Aucune alerte active</h3>
              <p style={{ fontSize: '0.9rem' }}>
                Tous les déchets ont été collectés dans les délais (moins de 24h).
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {alertes.map(alerte => (
                <div key={alerte.id} style={{
                  borderLeft: '4px solid var(--danger)',
                  background: '#fff5f5',
                  border: '1px solid #fecaca',
                  borderLeftWidth: '4px',
                  borderLeftColor: 'var(--danger)',
                  padding: '16px 20px',
                  borderRadius: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)', fontWeight: '700', marginBottom: '6px' }}>
                      <AlertTriangle size={16} /> {alerte.type_alerte}
                    </div>
                    <div style={{ fontWeight: '500', color: 'var(--text-main)', marginBottom: '6px' }}>
                      {alerte.message}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Clock size={13} /> Détectée le : {new Date(alerte.created_at).toLocaleString('fr-FR')}
                    </div>
                  </div>

                  {canResolve && (
                    <button
                      onClick={() => handleResolve(alerte.id)}
                      className="btn-primary"
                      style={{ background: 'var(--success)', whiteSpace: 'nowrap', flexShrink: 0 }}
                    >
                      <CheckCircle size={16} /> Résoudre
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Alertes;
