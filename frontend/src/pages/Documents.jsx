import { useState, useEffect } from 'react';
import axios from 'axios';
import { FileUp, CheckCircle, ShieldAlert, FileText } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const Documents = () => {
  const [file, setFile] = useState(null);
  const [typeDoc, setTypeDoc] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [documentsList, setDocumentsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      if (parsedUser.role === 'Equipe_Collecte') setTypeDoc('Bon de prise en charge');
      if (parsedUser.role === 'Responsable_Sanitaire') setTypeDoc('Certificat de destruction');
      if (parsedUser.role === 'Administrateur') setTypeDoc('Bon de prise en charge');
    }
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/documents', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocumentsList(res.data);
    } catch (err) {
      console.error("Erreur chargement documents", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce document ?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/documents/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage("Document supprimé avec succès !");
      fetchDocuments(); // Rafraichir la liste
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la suppression.");
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Veuillez sélectionner un fichier.");
      return;
    }
    
    setError('');
    setMessage('');
    setIsLoading(true);

    const formData = new FormData();
    formData.append('document', file);
    formData.append('type_document', typeDoc);

    try {
      const response = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setMessage(`Le document (${typeDoc}) a été uploadé avec succès dans les archives !`);
      setFile(null);
      document.getElementById('fileInput').value = "";
      fetchDocuments(); // Rafraichir la liste
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de l'upload. Assurez-vous que c'est une image ou un PDF.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  const isEquipe = user.role === 'Equipe_Collecte';
  const isResponsable = user.role === 'Responsable_Sanitaire';
  const isAdmin = user.role === 'Administrateur';

  // Si l'utilisateur n'est pas autorisé du tout (ex: Infirmier)
  if (user.role === 'Infirmier') {
    return (
      <div className="app-wrapper">
        <Sidebar user={user} />
        <div className="main-content">
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', marginTop: '2rem' }}>
            <ShieldAlert size={48} color="var(--danger)" style={{ marginBottom: '1rem' }} />
            <h2>Accès Refusé</h2>
            <p>L'upload des documents est réservé à l'Équipe de collecte et au Responsable Sanitaire.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      <Sidebar user={user} />
      <div className="main-content animate-fade-in">
        
        {/* Top bar */}
        <div className="topbar">
          <div>
            <div className="topbar-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileUp color="var(--primary)" /> Archives & Documents
            </div>
            <div className="topbar-subtitle">Uploadez les bons de prise en charge et certificats de destruction</div>
          </div>
          <div className="badge badge-collecte">
            Module Traçabilité
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <FileText size={48} color="var(--text-muted)" style={{ opacity: 0.5, marginBottom: '1rem' }} />
            <h3>Transférer un document de traçabilité</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Formats acceptés : PDF, JPG, PNG.</p>
          </div>

          {message && (
            <div style={{ color: 'var(--success)', marginBottom: '1rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px', background: '#d1fae5', padding: '10px 14px', borderRadius: '8px' }}>
              <CheckCircle size={18}/> {message}
            </div>
          )}
          {error && (
            <div style={{ color: 'var(--danger)', marginBottom: '1rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px', background: '#fee2e2', padding: '10px 14px', borderRadius: '8px' }}>
              <ShieldAlert size={18}/> {error}
            </div>
          )}

          <form onSubmit={handleUpload}>
            <div className="input-group">
              <label>Type de Document</label>
              <select 
                className="input-glass"
                value={typeDoc}
                onChange={(e) => setTypeDoc(e.target.value)}
                disabled={!isAdmin} // L'admin peut choisir, les autres sont figés sur leur rôle
              >
                {(isEquipe || isAdmin) && <option value="Bon de prise en charge">Bon de prise en charge (Équipe de collecte)</option>}
                {(isResponsable || isAdmin) && <option value="Certificat de destruction">Certificat de destruction (Responsable Sanitaire)</option>}
              </select>
            </div>

            <div className="input-group" style={{ marginBottom: '2rem' }}>
              <label>Sélectionner le fichier depuis votre ordinateur</label>
              <input 
                type="file" 
                id="fileInput"
                className="input-glass" 
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                style={{ background: '#fff' }}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={isLoading}>
              {isLoading ? 'Envoi en cours...' : 'Uploader le document'}
            </button>
          </form>
        </div>

        {/* LISTE DES DOCUMENTS */}
        <div className="glass-panel" style={{ padding: '2rem', maxWidth: '800px', margin: '2rem auto' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={20} color="var(--success)" /> Archives Numériques
          </h3>
          
          {documentsList.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>Aucun document archivé pour le moment.</p>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {documentsList.map((doc) => (
                <div key={doc.id} style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                  padding: '16px', background: 'var(--bg-card-alt)', borderRadius: '12px', border: '1px solid var(--border)' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ background: 'var(--primary)20', padding: '12px', borderRadius: '8px' }}>
                      <FileText size={24} color="var(--primary)" />
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem' }}>{doc.originalname}</h4>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {doc.type_document} • Uploadé par {doc.nom} {doc.prenom} le {new Date(doc.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <a 
                      href={`http://localhost:5000${doc.path}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn-primary"
                      style={{ padding: '8px 16px', fontSize: '0.9rem', textDecoration: 'none', display: 'inline-block' }}
                    >
                      Voir
                    </a>
                    {(isAdmin || user.id === doc.uploaded_by) && (
                      <button 
                        onClick={() => handleDelete(doc.id)}
                        style={{ padding: '8px 16px', fontSize: '0.9rem', background: '#fee2e2', color: 'var(--danger)', border: '1px solid #fecaca', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Documents;
