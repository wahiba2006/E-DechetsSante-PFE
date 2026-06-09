import { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, Users as UsersIcon, ShieldAlert, CheckCircle, Edit, Trash2, X } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState(null);
  
  // Creation state
  const [formData, setFormData] = useState({
    nom: '', prenom: '', email: '', password: '', role: 'Infirmier'
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Modal & Edit state
  const [selectedUser, setSelectedUser] = useState(null);
  const [editFormData, setEditFormData] = useState({ nom: '', prenom: '', email: '', role: '' });
  const [isEditMode, setIsEditMode] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalError, setModalError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (err) {
      console.error("Erreur lors de la récupération des utilisateurs", err);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setMessage(''); setError('');
    try {
      await axios.post('http://localhost:5000/api/auth/register', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage(`Le compte pour ${formData.prenom} a été créé avec succès !`);
      setFormData({ nom: '', prenom: '', email: '', password: '', role: 'Infirmier' });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la création du compte');
    }
  };

  const openUserModal = (u) => {
    setSelectedUser(u);
    setEditFormData({ nom: u.nom, prenom: u.prenom, email: u.email, role: u.role });
    setIsEditMode(false);
    setModalMessage('');
    setModalError('');
  };

  const closeUserModal = () => {
    setSelectedUser(null);
    setIsEditMode(false);
  };

  const handleDeleteUser = async () => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${selectedUser.prenom} ?`)) return;
    
    setModalMessage(''); setModalError('');
    try {
      await axios.delete(`http://localhost:5000/api/auth/users/${selectedUser.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setModalMessage('Utilisateur supprimé avec succès !');
      setTimeout(() => {
        closeUserModal();
        fetchUsers();
      }, 1500);
    } catch (err) {
      setModalError(err.response?.data?.error || 'Erreur lors de la suppression');
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setModalMessage(''); setModalError('');
    try {
      await axios.put(`http://localhost:5000/api/auth/users/${selectedUser.id}`, editFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setModalMessage('Informations mises à jour avec succès !');
      setTimeout(() => {
        setIsEditMode(false);
        fetchUsers();
        // Mettre à jour l'utilisateur sélectionné pour la vue détaillée
        setSelectedUser({ ...selectedUser, ...editFormData });
      }, 1500);
    } catch (err) {
      setModalError(err.response?.data?.error || 'Erreur lors de la mise à jour');
    }
  };

  if (!user) return null;

  const roleColors = {
    Administrateur: { bg: '#fee2e2', color: '#b91c1c' },
    Infirmier: { bg: '#dbeafe', color: '#1e40af' },
    Equipe_Collecte: { bg: '#fef3c7', color: '#b45309' },
    Responsable_Sanitaire: { bg: '#d1fae5', color: '#047857' },
  };

  return (
    <div className="app-wrapper">
      <Sidebar user={user} />
      <div className="main-content animate-fade-in" style={{ position: 'relative' }}>

        {/* Modal User Details / Edit */}
        {selectedUser && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}>
            <div className="card" style={{ width: '100%', maxWidth: '500px', background: 'var(--bg-main)' }}>
              <div className="card-header" style={{ justifyContent: 'space-between' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {isEditMode ? <Edit size={20} color="var(--primary)" /> : <UsersIcon size={20} color="var(--primary)" />}
                  {isEditMode ? 'Modifier Utilisateur' : 'Détails Utilisateur'}
                </h3>
                <button onClick={closeUserModal} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={24} />
                </button>
              </div>

              <div className="card-body">
                {modalMessage && (
                  <div style={{ color: '#047857', marginBottom: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', background: '#d1fae5', padding: '12px 16px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                    <CheckCircle size={18} /> {modalMessage}
                  </div>
                )}
                {modalError && (
                  <div style={{ color: '#b91c1c', marginBottom: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', background: '#fee2e2', padding: '12px 16px', borderRadius: '8px', border: '1px solid #fecaca' }}>
                    <ShieldAlert size={18} /> {modalError}
                  </div>
                )}

                {!isEditMode ? (
                  // VIEW MODE
                  <div>
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                      <div style={{
                        width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 10px',
                        background: roleColors[selectedUser.role]?.bg || '#e2e8f0', 
                        color: roleColors[selectedUser.role]?.color || '#475569',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: '700', fontSize: '2rem'
                      }}>
                        {(selectedUser.prenom?.[0] || '') + (selectedUser.nom?.[0] || '')}
                      </div>
                      <h2 style={{ margin: 0, fontSize: '1.4rem' }}>{selectedUser.prenom} {selectedUser.nom}</h2>
                      <div style={{ color: 'var(--text-muted)', marginTop: '4px' }}>{selectedUser.email}</div>
                      <div className="badge" style={{ marginTop: '12px', background: roleColors[selectedUser.role]?.bg, color: roleColors[selectedUser.role]?.color, fontSize: '0.85rem' }}>
                        {selectedUser.role.replace('_', ' ')}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
                      <button onClick={() => setIsEditMode(true)} className="btn-primary" style={{ flex: 1 }}>
                        <Edit size={18} /> Modifier
                      </button>
                      <button onClick={handleDeleteUser} className="btn-danger" style={{ flex: 1 }}>
                        <Trash2 size={18} /> Supprimer
                      </button>
                    </div>
                  </div>
                ) : (
                  // EDIT MODE
                  <form onSubmit={handleUpdateUser}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div className="input-group" style={{ flex: 1 }}>
                        <label>Nom</label>
                        <input type="text" className="input-glass" value={editFormData.nom}
                          onChange={(e) => setEditFormData({...editFormData, nom: e.target.value})} required />
                      </div>
                      <div className="input-group" style={{ flex: 1 }}>
                        <label>Prénom</label>
                        <input type="text" className="input-glass" value={editFormData.prenom}
                          onChange={(e) => setEditFormData({...editFormData, prenom: e.target.value})} required />
                      </div>
                    </div>
                    <div className="input-group">
                      <label>Email Professionnel</label>
                      <input type="email" className="input-glass" value={editFormData.email}
                        onChange={(e) => setEditFormData({...editFormData, email: e.target.value})} required />
                    </div>
                    <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                      <label>Rôle</label>
                      <select className="input-glass" value={editFormData.role}
                        onChange={(e) => setEditFormData({...editFormData, role: e.target.value})}>
                        <option value="Infirmier">Infirmier</option>
                        <option value="Equipe_Collecte">Équipe de Collecte</option>
                        <option value="Responsable_Sanitaire">Responsable Sanitaire</option>
                        <option value="Administrateur">Administrateur</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button type="button" onClick={() => setIsEditMode(false)} className="btn-primary" style={{ flex: 1, background: 'var(--bg-card-alt)', color: 'var(--text-main)' }}>
                        Annuler
                      </button>
                      <button type="submit" className="btn-primary" style={{ flex: 1, background: 'var(--success)' }}>
                        <CheckCircle size={18} /> Enregistrer
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Top bar */}
        <div className="topbar">
          <div>
            <div className="topbar-title">Gestion des Utilisateurs</div>
            <div className="topbar-subtitle">Création et annuaire du personnel hospitalier</div>
          </div>
          <div style={{ background: '#dbeafe', color: '#1e40af', padding: '6px 16px', borderRadius: '100px', fontSize: '0.82rem', fontWeight: '700' }}>
            👤 {users.length} compte(s)
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>

          {/* Formulaire de création */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', color: 'var(--primary)', fontSize: '1rem' }}>
              <UserPlus size={20} /> Créer un nouveau compte
            </h3>

            {message && (
              <div style={{ color: '#047857', marginBottom: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', background: '#d1fae5', padding: '12px 16px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                <CheckCircle size={18} /> {message}
              </div>
            )}
            {error && (
              <div style={{ color: '#b91c1c', marginBottom: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', background: '#fee2e2', padding: '12px 16px', borderRadius: '8px', border: '1px solid #fecaca' }}>
                <ShieldAlert size={18} /> {error}
              </div>
            )}

            <form onSubmit={handleAddUser}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Nom</label>
                  <input type="text" className="input-glass" value={formData.nom}
                    onChange={(e) => setFormData({...formData, nom: e.target.value})} required />
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Prénom</label>
                  <input type="text" className="input-glass" value={formData.prenom}
                    onChange={(e) => setFormData({...formData, prenom: e.target.value})} required />
                </div>
              </div>

              <div className="input-group">
                <label>Email Professionnel</label>
                <input type="email" className="input-glass" value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})} required />
              </div>

              <div className="input-group">
                <label>Mot de passe temporaire</label>
                <input type="text" className="input-glass" value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})} required />
              </div>

              <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                <label>Rôle dans l'hôpital</label>
                <select className="input-glass" value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}>
                  <option value="Infirmier">Infirmier</option>
                  <option value="Equipe_Collecte">Équipe de Collecte</option>
                  <option value="Responsable_Sanitaire">Responsable Sanitaire</option>
                  <option value="Administrateur">Administrateur</option>
                </select>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                Enregistrer l'utilisateur
              </button>
            </form>
          </div>

          {/* Liste des utilisateurs */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', fontSize: '1rem' }}>
              <UsersIcon size={20} color="var(--primary)" /> Annuaire du personnel (Cliquez pour modifier)
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '480px', overflowY: 'auto', paddingRight: '5px' }}>
              {users.map(u => {
                const rc = roleColors[u.role] || { bg: '#e2e8f0', color: '#475569' };
                return (
                  <div key={u.id} onClick={() => openUserModal(u)} style={{
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    background: 'var(--bg-card-alt)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'var(--primary-light)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: rc.bg, color: rc.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: '700', fontSize: '0.85rem', flexShrink: 0
                      }}>
                        {(u.prenom?.[0] || '') + (u.nom?.[0] || '')}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{u.nom} {u.prenom}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</div>
                      </div>
                    </div>
                    <div className="badge" style={{ background: rc.bg, color: rc.color }}>
                      {u.role.replace('_', ' ')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Users;
