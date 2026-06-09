import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  LayoutDashboard, Trash2, Bell, Users, FileText,
  BrainCircuit, LogOut, Activity, ShieldCheck,
  AlertTriangle, CheckCircle, BarChart2, Package
} from 'lucide-react';

import Sidebar from '../components/Sidebar';

/* ===== STAT CARD ===== */
const StatCard = ({ title, value, unit, icon, color, sub, subColor }) => (
  <div className="glass-panel" style={{ padding: '24px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
      <h3 style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: '500', lineHeight: '1.3' }}>{title}</h3>
      <div style={{ background: color + '18', padding: '8px', borderRadius: '10px', flexShrink: 0 }}>
        {icon}
      </div>
    </div>
    <div style={{ fontSize: '2.2rem', fontWeight: '700', fontFamily: 'Outfit', color: color }}>
      {value} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: '400' }}>{unit}</span>
    </div>
    {sub && (
      <div style={{ marginTop: '10px', fontSize: '0.82rem', color: subColor || 'var(--text-muted)', fontWeight: '600' }}>
        {sub}
      </div>
    )}
  </div>
);

/* ===== DASHBOARD ===== */
const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
    fetchKPIs();
  }, []);

  const fetchKPIs = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/dashboard/kpis', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setKpis(res.data);
    } catch (e) {
      console.error("Erreur KPIs", e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return null;

  const produit = kpis?.dechets_par_statut?.find(s => s.statut === 'Produit')?.count || 0;
  const enAttente = kpis?.dechets_par_statut?.find(s => s.statut === 'En attente de collecte')?.count || 0;
  const enCours = kpis?.dechets_par_statut?.find(s => s.statut === 'En cours')?.count || 0;
  const collectes = kpis?.dechets_par_statut?.find(s => s.statut === 'Collecte')?.count || 0;

  return (
    <div className="app-wrapper">
      <Sidebar user={user} />

      <div className="main-content animate-fade-in">
        {/* Top bar */}
        <div className="topbar">
          <div>
            <div className="topbar-title">
              {user.role === 'Administrateur' ? 'Tableau de Bord — Vue Globale'
                : user.role === 'Responsable_Sanitaire' ? 'Tableau de Bord — Conformité Sanitaire'
                : 'Espace de Travail'}
            </div>
            <div className="topbar-subtitle">
              {user.role === 'Administrateur' ? "Statistiques globales de l'hôpital en temps réel."
                : user.role === 'Responsable_Sanitaire' ? 'Suivi de la conformité et des incidents de collecte.'
                : 'Bienvenue ! Accédez à vos modules via le menu.'}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: '#10b981', boxShadow: '0 0 6px #10b981'
            }} />
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Système opérationnel</span>
          </div>
        </div>

        {/* ===== ADMIN DASHBOARD ===== */}
        {user.role === 'Administrateur' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '2rem' }}>
              <StatCard title="Total Déchets Générés" value={loading ? '...' : kpis?.total_dechets} unit="sacs"
                icon={<Trash2 color="var(--primary)" size={20} />} color="var(--primary)"
                sub={`${parseFloat(kpis?.total_volume_kg || 0).toFixed(1)} kg au total`} />
              <StatCard title="Produits / En attente" value={loading ? '...' : (produit + enAttente)} unit="sacs"
                icon={<Package color="var(--danger)" size={20} />} color="var(--danger)"
                sub="À collecter" subColor="var(--danger)" />
              <StatCard title="Collecte En cours" value={loading ? '...' : enCours} unit="sacs"
                icon={<AlertTriangle color="var(--warning)" size={20} />} color="var(--warning)"
                sub="Équipe en mouvement" subColor="var(--warning)" />
              <StatCard title="Déjà Collectés" value={loading ? '...' : collectes} unit="sacs"
                icon={<CheckCircle color="var(--success)" size={20} />} color="var(--success)"
                sub="Traitement terminé" subColor="var(--success)" />
              <StatCard title="Total Utilisateurs" value={loading ? '...' : kpis?.total_utilisateurs} unit="comptes"
                icon={<Users color="#8b5cf6" size={20} />} color="#8b5cf6"
                sub="Infirmiers, Équipes, Admins" />
              <StatCard title="Alertes Actives" value={loading ? '...' : kpis?.alertes_actives} unit=""
                icon={<Bell color="var(--danger)" size={20} />} color="var(--danger)"
                sub="Retards > 24h non résolus" subColor="var(--danger)" />
              <StatCard title="Total Incidents" value={loading ? '...' : kpis?.total_erreurs} unit="incidents"
                icon={<AlertTriangle color="#f97316" size={20} />} color="#f97316"
                sub="Toutes alertes depuis le début" subColor="#f97316" />
            </div>

            {kpis?.dechets_par_type?.length > 0 && (
              <div className="glass-panel" style={{ padding: '24px', marginBottom: '2rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem', fontSize: '1rem' }}>
                  <BarChart2 size={20} color="var(--primary)" /> Répartition des Déchets par Type
                </h3>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {kpis.dechets_par_type.map(t => {
                    const colors = { DASRI: '#facc15', Chimique: '#f87171', Radioactif: '#c084fc', Pharmaceutique: '#34d399', Tranchant: '#60a5fa' };
                    const c = colors[t.type_dechet] || '#94a3b8';
                    return (
                      <div key={t.type_dechet} style={{ background: c + '18', border: `2px solid ${c}`, borderRadius: '12px', padding: '16px 24px', textAlign: 'center', minWidth: '130px' }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: '700', color: c }}>{t.count}</div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: '500', marginTop: '4px' }}>{t.type_dechet}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* ===== RESPONSABLE SANITAIRE ===== */}
        {user.role === 'Responsable_Sanitaire' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '2rem' }}>
              <StatCard title="Total Déchets Générés" value={loading ? '...' : kpis?.total_dechets} unit="sacs"
                icon={<Trash2 color="var(--primary)" size={20} />} color="var(--primary)"
                sub={`${parseFloat(kpis?.total_volume_kg || 0).toFixed(1)} kg au total`} />
              <StatCard title="Produits / En attente" value={loading ? '...' : (produit + enAttente)} unit="sacs"
                icon={<Package color="var(--danger)" size={20} />} color="var(--danger)"
                sub="À collecter" subColor="var(--danger)" />
              <StatCard title="Collecte En cours" value={loading ? '...' : enCours} unit="sacs"
                icon={<AlertTriangle color="var(--warning)" size={20} />} color="var(--warning)"
                sub="Équipe en mouvement" subColor="var(--warning)" />
              <StatCard title="Déjà Collectés" value={loading ? '...' : collectes} unit="sacs"
                icon={<CheckCircle color="var(--success)" size={20} />} color="var(--success)"
                sub="Traitement terminé" subColor="var(--success)" />
              <StatCard title="Alertes Actives" value={loading ? '...' : kpis?.alertes_actives} unit=""
                icon={<Bell color="var(--danger)" size={20} />} color="var(--danger)"
                sub="Retards > 24h non résolus" subColor="var(--danger)" />
              <StatCard title="Total Incidents" value={loading ? '...' : kpis?.total_erreurs} unit="incidents"
                icon={<AlertTriangle color="#f97316" size={20} />} color="#f97316"
                sub="Toutes alertes depuis le début" subColor="#f97316" />
            </div>

            {kpis?.dechets_par_type?.length > 0 && (
              <div className="glass-panel" style={{ padding: '24px', marginBottom: '2rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem', fontSize: '1rem' }}>
                  <BarChart2 size={20} color="var(--primary)" /> Répartition des Déchets par Type
                </h3>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {kpis.dechets_par_type.map(t => {
                    const colors = { DASRI: '#facc15', Chimique: '#f87171', Radioactif: '#c084fc', Pharmaceutique: '#34d399', Tranchant: '#60a5fa' };
                    const c = colors[t.type_dechet] || '#94a3b8';
                    return (
                      <div key={t.type_dechet} style={{ background: c + '18', border: `2px solid ${c}`, borderRadius: '12px', padding: '16px 24px', textAlign: 'center', minWidth: '130px' }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: '700', color: c }}>{t.count}</div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: '500', marginTop: '4px' }}>{t.type_dechet}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* ===== INFIRMIER / EQUIPE ===== */}
        {(user.role === 'Infirmier' || user.role === 'Equipe_Collecte') && (
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
              {user.role === 'Infirmier' ? '🩺' : '♻️'}
            </div>
            <h3 style={{ marginBottom: '0.5rem' }}>
              Bonjour, {user.prenom} !
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
              {user.role === 'Infirmier'
                ? 'Déclarez vos déchets médicaux via le module Gestion des Déchets.'
                : 'Gérez les collectes en cours via le module Gestion des Déchets.'}
            </p>
            <button onClick={() => navigate('/dashboard/dechets')} className="btn-primary" style={{ fontSize: '1rem', padding: '12px 28px' }}>
              <Trash2 size={18} /> Accéder aux Déchets
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
