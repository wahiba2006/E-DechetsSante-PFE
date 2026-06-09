import { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Printer, Activity, AlertTriangle, CheckCircle, Users, Package } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const Rapport = () => {
  const [rapport, setRapport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
    fetchRapport();
  }, []);

  const fetchRapport = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/dashboard/rapport', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRapport(res.data);
    } catch (err) {
      setError("Impossible de charger le rapport.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const niveauColor = (niveau) => {
    if (niveau === 'Eleve') return '#f87171';
    if (niveau === 'Moyen') return '#fbbf24';
    return '#34d399';
  };

  if (!user) return null;

  const totalKg = rapport ? parseFloat(rapport.total_volume_kg).toFixed(1) : 0;
  const tauxCollecte = rapport
    ? Math.round((rapport.total_collectes / Math.max(1, rapport.total_dechets)) * 100)
    : 0;

  return (
    <>
      {/* CSS PRINT - Uniquement lors de l'impression */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .sidebar { display: none !important; }
          .main-content { margin-left: 0 !important; padding: 0 !important; }
          .app-wrapper { display: block !important; }
          body { background: #fff !important; color: #000 !important; }
          .print-page { 
            background: #fff !important; 
            color: #000 !important; 
            padding: 30px;
            font-family: Arial, sans-serif;
          }
          .print-card {
            border: 1px solid #ccc !important;
            background: #f9f9f9 !important;
            color: #000 !important;
            break-inside: avoid;
          }
          .print-header { border-bottom: 3px solid #0284c7 !important; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #0284c7 !important; color: #fff !important; padding: 8px; text-align: left; }
          td { padding: 8px; border-bottom: 1px solid #ddd; color: #000 !important; }
          tr:nth-child(even) td { background: #f5f5f5; }
          .kpi-value { color: #0284c7 !important; }
          .print-footer { border-top: 1px solid #ccc; margin-top: 30px; padding-top: 10px; font-size: 0.8rem; color: #666; }
        }
      `}</style>

      <div className="app-wrapper">
        <Sidebar user={user} />
        <div className="main-content animate-fade-in">

          {/* Topbar - no print */}
          <div className="topbar no-print">
            <div>
              <div className="topbar-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText color="var(--primary)" /> Rapport Mensuel
              </div>
              <div className="topbar-subtitle">Rapport complet de gestion des déchets médicaux</div>
            </div>
            <button onClick={handlePrint} className="btn-primary no-print" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Printer size={18} /> Imprimer / Exporter PDF
            </button>
          </div>

          {loading && (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
              Chargement du rapport...
            </div>
          )}
          {error && (
            <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '16px', borderRadius: '10px' }}>
              {error}
            </div>
          )}

          {rapport && (
            <div className="print-page" style={{ maxWidth: '900px', margin: '0 auto' }}>

              {/* === EN-TÊTE === */}
              <div className="print-header card card-body" style={{ marginBottom: '1.5rem', borderLeft: '5px solid var(--primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h1 style={{ fontSize: '1.6rem', color: 'var(--primary)', margin: 0 }}>
                      🏥 E-DéchetsSanté
                    </h1>
                    <h2 style={{ fontSize: '1.1rem', margin: '4px 0', fontWeight: '600' }}>
                      Rapport de Gestion des Déchets Médicaux
                    </h2>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                      Période : <strong style={{ color: 'var(--text-main)' }}>{rapport.periode}</strong>
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Généré le</div>
                    <div style={{ fontWeight: '700', fontSize: '1rem' }}>{rapport.date_generation}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Par : {user.prenom} {user.nom}
                    </div>
                  </div>
                </div>
              </div>

              {/* === KPIs GLOBAUX === */}
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', fontSize: '1rem' }}>
                <Activity size={18} color="var(--primary)" /> Indicateurs Clés de Performance (KPIs)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '1.5rem' }}>
                {[
                  { label: 'Volume Total', value: `${totalKg} kg`, icon: <Package size={20} />, color: 'var(--primary)' },
                  { label: 'Total Sacs', value: rapport.total_dechets, icon: <Package size={20} />, color: 'var(--accent)' },
                  { label: 'Collectés', value: rapport.total_collectes, icon: <CheckCircle size={20} />, color: 'var(--success)' },
                  { label: 'En Attente', value: rapport.total_en_attente, icon: <AlertTriangle size={20} />, color: 'var(--warning)' },
                  { label: 'Alertes Actives', value: rapport.alertes_actives, icon: <AlertTriangle size={20} />, color: 'var(--danger)' },
                  { label: 'Personnel Actif', value: rapport.total_utilisateurs, icon: <Users size={20} />, color: '#a78bfa' },
                  { label: 'Taux de Collecte', value: `${tauxCollecte}%`, icon: <CheckCircle size={20} />, color: tauxCollecte > 80 ? 'var(--success)' : 'var(--warning)' },
                ].map((kpi, i) => (
                  <div key={i} className="print-card card" style={{ padding: '16px', textAlign: 'center' }}>
                    <div style={{ color: kpi.color, marginBottom: '6px' }}>{kpi.icon}</div>
                    <div className="kpi-value" style={{ fontSize: '1.6rem', fontWeight: '800', color: kpi.color }}>{kpi.value}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{kpi.label}</div>
                  </div>
                ))}
              </div>

              {/* === RÉPARTITION PAR SERVICE === */}
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', fontSize: '1rem' }}>
                <Activity size={18} color="var(--primary)" /> Répartition par Service
              </h3>
              <div className="print-card card" style={{ marginBottom: '1.5rem', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--primary)', color: '#fff' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left' }}>Service</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center' }}>Nombre de Sacs</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Volume Total (kg)</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Part (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rapport.par_service.map((s, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg-card-alt)' }}>
                        <td style={{ padding: '12px 16px', fontWeight: '600' }}>{s.service}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>{s.nb_sacs}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '700', color: 'var(--primary)' }}>
                          {parseFloat(s.total_kg).toFixed(2)} kg
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--text-muted)' }}>
                          {rapport.total_volume_kg > 0 ? ((s.total_kg / rapport.total_volume_kg) * 100).toFixed(1) : 0}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* === RÉPARTITION PAR TYPE === */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', fontSize: '1rem' }}>
                    <Package size={18} color="var(--primary)" /> Par Type de Déchet
                  </h3>
                  <div className="print-card card" style={{ overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: 'var(--accent)', color: '#fff' }}>
                          <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.82rem' }}>Type</th>
                          <th style={{ padding: '10px 14px', textAlign: 'right', fontSize: '0.82rem' }}>kg</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rapport.par_type.map((t, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '10px 14px', fontSize: '0.85rem' }}>{t.type}</td>
                            <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '700', color: 'var(--accent)', fontSize: '0.85rem' }}>
                              {parseFloat(t.total_kg).toFixed(1)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', fontSize: '1rem' }}>
                    <AlertTriangle size={18} color="var(--warning)" /> Par Niveau de Danger
                  </h3>
                  <div className="print-card card" style={{ overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#b45309', color: '#fff' }}>
                          <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.82rem' }}>Niveau</th>
                          <th style={{ padding: '10px 14px', textAlign: 'center', fontSize: '0.82rem' }}>Sacs</th>
                          <th style={{ padding: '10px 14px', textAlign: 'right', fontSize: '0.82rem' }}>kg</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rapport.par_niveau.map((n, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '10px 14px', fontWeight: '700', fontSize: '0.85rem', color: niveauColor(n.niveau_dangerosite) }}>
                              {n.niveau_dangerosite}
                            </td>
                            <td style={{ padding: '10px 14px', textAlign: 'center', fontSize: '0.85rem' }}>{n.count}</td>
                            <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '700', fontSize: '0.85rem' }}>
                              {parseFloat(n.total_kg).toFixed(1)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* === ALERTES RÉCENTES === */}
              {rapport.alertes_recentes.length > 0 && (
                <>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', fontSize: '1rem' }}>
                    <AlertTriangle size={18} color="var(--danger)" /> Alertes Récentes
                  </h3>
                  <div className="print-card card" style={{ marginBottom: '1.5rem', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#b91c1c', color: '#fff' }}>
                          <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.82rem' }}>Type</th>
                          <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.82rem' }}>Message</th>
                          <th style={{ padding: '10px 14px', textAlign: 'right', fontSize: '0.82rem' }}>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rapport.alertes_recentes.map((a, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '10px 14px', fontWeight: '600', fontSize: '0.82rem', color: 'var(--danger)' }}>{a.type_alerte}</td>
                            <td style={{ padding: '10px 14px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>{a.message}</td>
                            <td style={{ padding: '10px 14px', textAlign: 'right', fontSize: '0.82rem' }}>
                              {new Date(a.date_creation).toLocaleDateString('fr-FR')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* === PIED DE PAGE === */}
              <div className="print-footer" style={{ borderTop: '1px solid var(--border)', marginTop: '2rem', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                <span>🏥 E-DéchetsSanté — Rapport Confidentiel</span>
                <span>Généré automatiquement le {rapport.date_generation}</span>
              </div>

            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Rapport;
