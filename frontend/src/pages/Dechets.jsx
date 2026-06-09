import { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, CheckCircle, Trash2, ShieldAlert, AlertTriangle, Activity, PackagePlus, ArrowRight } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const Dechets = () => {
  const [dechets, setDechets] = useState([]);
  const [user, setUser] = useState(null);
  const [services, setServices] = useState([]);
  const [capaciteStats, setCapaciteStats] = useState([]);
  const [formData, setFormData] = useState({
    type: 'DASRI - Seringues',
    quantite_kg: '',
    niveau_dangerosite: 'Moyen',
    service_id: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
    
    fetchDechets();
    fetchServices();
    fetchCapacite();
  }, []);

  const fetchCapacite = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/dechets/capacite', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCapaciteStats(res.data);
    } catch (err) {
      console.error('Erreur capacité:', err);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/dechets/services', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setServices(res.data);
      if (res.data.length > 0) {
        setFormData(prev => ({ ...prev, service_id: res.data[0].id }));
      }
    } catch (err) {
      console.error('Erreur services:', err);
    }
  };

  const fetchDechets = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/dechets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDechets(response.data);
    } catch (err) {
      console.error("Erreur:", err);
    }
  };

  const handleAddDechet = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/api/dechets', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage(res.data.message);
      setFormData(prev => ({ type: 'DASRI - Seringues', quantite_kg: '', niveau_dangerosite: 'Moyen', service_id: prev.service_id }));
      fetchDechets();
      fetchCapacite();
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'ajout');
      setTimeout(() => setError(''), 4000);
    }
  };

  if (!user) return null;

  const isInfirmier = user.role === 'Infirmier' || user.role === 'Administrateur';
  const isCollecte = user.role === 'Equipe_Collecte' || user.role === 'Administrateur';

  return (
    <div className="app-wrapper">
      <Sidebar user={user} />
      <div className="main-content animate-fade-in" style={{ paddingBottom: '4rem' }}>

        {/* ===== TOPBAR ===== */}
        <div className="topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="topbar-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Trash2 color="var(--primary)" /> Gestion Opérationnelle
            </div>
            <div className="topbar-subtitle">Déclaration, suivi et collecte des contenants</div>
          </div>
          <div style={{ background: '#e0e7ff', color: '#3730a3', padding: '6px 16px', borderRadius: '100px', fontSize: '0.85rem', fontWeight: '700', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Activity size={16} /> Flux Actif
          </div>
        </div>

        {/* ===== JAUGES DE REMPLISSAGE (PREMIUM) ===== */}
        {capaciteStats.some(s => Object.keys(s.conteneurs).length > 0) && (
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ marginBottom: '1.2rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}>
              <Activity size={20} color="var(--primary)" /> Supervision des Conteneurs (Temps Réel)
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {capaciteStats.map((service, idx) => (
                Object.keys(service.conteneurs).length > 0 && (
                  <div key={idx} className="card" style={{ padding: '1.5rem', background: 'var(--bg-card)', borderTop: '4px solid var(--primary-light)' }}>
                    <div style={{ fontWeight: '800', fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--text-main)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>📍 {service.nom}</span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                      {Object.entries(service.conteneurs).map(([couleur, data]) => {
                        const colors = {
                          Jaune: { hex: '#facc15', light: '#fef08a' },
                          Rouge: { hex: '#ef4444', light: '#fecaca' },
                          Vert: { hex: '#10b981', light: '#a7f3d0' }
                        };
                        const c = colors[couleur] || { hex: '#94a3b8', light: '#e2e8f0' };
                        const isAlert = data.pourcentage >= 80;
                        const radius = 36;
                        const circumference = 2 * Math.PI * radius;
                        const offset = circumference - (Math.min(data.pourcentage, 100) / 100) * circumference;
                        
                        return (
                          <div key={couleur} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <div style={{ position: 'relative', width: '90px', height: '90px' }}>
                              {/* Cercle de fond */}
                              <svg width="90" height="90" style={{ transform: 'rotate(-90deg)' }}>
                                <circle
                                  cx="45" cy="45" r={radius}
                                  stroke={c.light}
                                  strokeWidth="10"
                                  fill="none"
                                />
                                {/* Cercle de progression */}
                                <circle
                                  cx="45" cy="45" r={radius}
                                  stroke={isAlert ? '#ef4444' : c.hex}
                                  strokeWidth="10"
                                  fill="none"
                                  strokeDasharray={circumference}
                                  strokeDashoffset={offset}
                                  strokeLinecap="round"
                                  style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                                />
                              </svg>
                              {/* Pourcentage au centre */}
                              <div style={{
                                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                              }}>
                                <span style={{ fontWeight: '800', fontSize: '1.1rem', color: isAlert ? 'var(--danger)' : 'var(--text-main)' }}>
                                  {Math.round(data.pourcentage)}%
                                </span>
                              </div>
                            </div>
                            
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '0.85rem' }}>
                                Bac {couleur}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                                {data.total_kg} / {data.capacite_max} kg
                              </div>
                              {isAlert && (
                                <div style={{ fontSize: '0.7rem', color: 'var(--danger)', fontWeight: '700', marginTop: '2px' }}>
                                  🚨 ALERTE
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
          
          {/* ===== FORMULAIRE D'AJOUT (INFIRMIER) ===== */}
          {isInfirmier && (
            <div className="card" style={{ background: 'var(--bg-card)', position: 'relative', overflow: 'hidden' }}>
              {/* Decoration */}
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.05, transform: 'rotate(15deg)', color: 'var(--text-muted)', pointerEvents: 'none', zIndex: 0 }}>
                <PackagePlus size={180} />
              </div>
              
              <div className="card-header" style={{ background: 'transparent', borderBottom: '1px solid var(--border)', position: 'relative', zIndex: 1 }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', fontSize: '1.2rem', margin: 0 }}>
                  <PlusCircle size={22} /> Déclarer un Nouveau Sac
                </h3>
              </div>
              
              <div className="card-body" style={{ position: 'relative', zIndex: 1 }}>
                {message && (
                  <div style={{ background: '#ecfdf5', color: '#047857', padding: '12px 16px', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', border: '1px solid #a7f3d0' }}>
                    <CheckCircle size={18} /> {message}
                  </div>
                )}
                {error && (
                  <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', border: '1px solid #fecaca' }}>
                    <ShieldAlert size={18} /> {error}
                  </div>
                )}

                <form onSubmit={handleAddDechet}>
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <div className="input-group" style={{ flex: 2 }}>
                      <label style={{ color: 'var(--text-muted)' }}>Type de Déchet</label>
                      <select className="input-glass" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                        <option value="DASRI - Seringues">DASRI - Seringues</option>
                        <option value="DASRI - Pansements">DASRI - Pansements</option>
                        <option value="Chimique - Medicaments">Chimique - Médicaments</option>
                        <option value="Toxique - Reactifs">Toxique - Réactifs de labo</option>
                        <option value="Verre">Verre Médical</option>
                      </select>
                    </div>
                    
                    <div className="input-group" style={{ flex: 1 }}>
                      <label style={{ color: 'var(--text-muted)' }}>Poids (kg)</label>
                      <input type="number" step="0.1" className="input-glass" placeholder="Ex: 2.5" value={formData.quantite_kg} onChange={(e) => setFormData({...formData, quantite_kg: e.target.value})} required style={{ fontWeight: '700', color: 'var(--primary-light)' }} />
                    </div>
                  </div>

                  <div className="input-group" style={{ marginTop: '5px' }}>
                    <label style={{ color: 'var(--text-muted)' }}>Service de provenance</label>
                    <select className="input-glass" value={formData.service_id} onChange={(e) => setFormData({...formData, service_id: e.target.value})} required>
                      {services.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
                    </select>
                  </div>

                  <div className="input-group" style={{ marginTop: '5px', marginBottom: '2rem' }}>
                    <label style={{ color: 'var(--text-muted)' }}>Niveau de Dangerosité</label>
                    <select className="input-glass" value={formData.niveau_dangerosite} onChange={(e) => setFormData({...formData, niveau_dangerosite: e.target.value})}>
                      <option value="Faible">🟢 Faible</option>
                      <option value="Moyen">🟡 Moyen</option>
                      <option value="Eleve">🔴 Élevé</option>
                    </select>
                  </div>

                  <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1.05rem', boxShadow: '0 10px 25px -5px rgba(30, 58, 138, 0.4)' }}>
                    <PlusCircle size={20} /> Valider la Déclaration
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ===== LISTE DES DÉCHETS EN ATTENTE (EQUIPE COLLECTE) ===== */}
          <div className="card" style={{ background: 'var(--bg-card)' }}>
            <div className="card-header" style={{ background: 'rgba(245, 158, 11, 0.1)', borderBottom: '1px solid var(--warning)' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--warning)', fontSize: '1.1rem', margin: 0 }}>
                <AlertTriangle size={20} /> Urgences Collecte
              </h3>
            </div>
            
            <div className="card-body" style={{ padding: '1.5rem', maxHeight: '500px', overflowY: 'auto' }}>
              {capaciteStats.filter(s => Object.values(s.conteneurs).some(c => c.pourcentage >= 80)).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                  <CheckCircle size={48} color="#10b981" style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
                  <p style={{ fontWeight: '500', fontSize: '1.05rem' }}>Tous les conteneurs sont dans les normes.</p>
                  <p style={{ fontSize: '0.85rem' }}>Aucune collecte urgente requise.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {capaciteStats.map(service => {
                    return Object.entries(service.conteneurs).map(([couleur, stats]) => {
                      if (stats.pourcentage >= 80) {
                        return (
                          <div key={`${service.id}-${couleur}`} style={{ 
                            border: `2px solid ${stats.is_en_cours ? 'var(--warning)' : 'var(--danger)'}`, 
                            borderRadius: '12px', 
                            padding: '1.2rem', 
                            background: stats.is_en_cours ? 'rgba(245, 158, 11, 0.05)' : 'rgba(239, 68, 68, 0.05)', 
                            boxShadow: stats.is_en_cours ? '0 4px 15px rgba(245, 158, 11, 0.15)' : '0 4px 15px rgba(239, 68, 68, 0.15)',
                            position: 'relative',
                            overflow: 'hidden'
                          }}>
                            {/* Accent line on left */}
                            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px', background: stats.is_en_cours ? 'var(--warning)' : 'var(--danger)' }}></div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', paddingLeft: '10px' }}>
                              <div style={{ flex: 1, minWidth: '200px' }}>
                                <div style={{ 
                                  fontWeight: '800', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px',
                                  color: stats.is_en_cours ? 'var(--warning)' : 'var(--danger)', 
                                  display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' 
                                }}>
                                  {stats.is_en_cours ? '🔄 Collecte en cours' : '🚨 Intervention requise'}
                                </div>
                                
                                <div style={{ fontSize: '1.2rem', color: 'var(--text-main)', fontWeight: '800', marginBottom: '8px' }}>
                                  Service : {service.nom}
                                </div>
                                
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <span style={{ 
                                    background: couleur === 'Jaune' ? 'rgba(250, 204, 21, 0.2)' : couleur === 'Rouge' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                                    color: couleur === 'Jaune' ? '#fde047' : couleur === 'Rouge' ? '#fca5a5' : '#86efac', 
                                    fontWeight: '700', padding: '4px 12px', borderRadius: '100px', fontSize: '0.85rem',
                                    border: `1px solid ${couleur === 'Jaune' ? '#facc15' : couleur === 'Rouge' ? '#ef4444' : '#10b981'}`
                                  }}>
                                    Bac {couleur}
                                  </span>
                                  <span style={{ color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.9rem' }}>
                                    {Math.round(stats.pourcentage)}% rempli ({stats.total_kg}kg)
                                  </span>
                                </div>
                              </div>
                              
                              {isCollecte && (
                                <div style={{ alignSelf: 'center', width: '100%' }}>
                                  {!stats.is_en_cours ? (
                                    <button onClick={async () => {
                                        try {
                                          await axios.put('http://localhost:5000/api/dechets/demarrer-collecte-conteneur', 
                                            { service_id: service.id, couleur_conteneur: couleur }, 
                                            { headers: { Authorization: `Bearer ${token}` } });
                                          fetchCapacite(); fetchDechets();
                                        } catch (err) { console.error(err); }
                                      }} 
                                      className="btn-primary" 
                                      style={{ width: '100%', background: '#f59e0b', color: '#fff', padding: '12px', fontSize: '0.95rem' }}
                                    >
                                      Prendre en charge <ArrowRight size={18} />
                                    </button>
                                  ) : (
                                    <button onClick={async () => {
                                        try {
                                          await axios.put('http://localhost:5000/api/dechets/collecte-conteneur', 
                                            { service_id: service.id, couleur_conteneur: couleur }, 
                                            { headers: { Authorization: `Bearer ${token}` } });
                                          fetchCapacite(); fetchDechets();
                                        } catch (err) { console.error(err); }
                                      }} 
                                      className="btn-primary" 
                                      style={{ width: '100%', background: '#10b981', color: '#fff', padding: '12px', fontSize: '0.95rem', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' }}
                                    >
                                      <CheckCircle size={18} /> Marquer Terminé
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    });
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: skewX(-20deg) translateX(-150%); }
          50% { transform: skewX(-20deg) translateX(150%); }
          100% { transform: skewX(-20deg) translateX(150%); }
        }
      `}</style>
    </div>
  );
};

export default Dechets;
