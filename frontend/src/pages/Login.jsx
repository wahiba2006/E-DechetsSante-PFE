import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff, ShieldCheck, Trash2, Box, Archive, Recycle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      if (response.data.user.role === 'Infirmier' || response.data.user.role === 'Equipe_Collecte') {
        navigate('/dashboard/dechets');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur de connexion. Vérifiez vos identifiants.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#f8fafc',
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* ===== LEFT PANEL : Corporate Medical Branding ===== */}
      <div style={{
        flex: '1',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '3rem',
        overflow: 'hidden'
      }}>
        {/* Subtle Background Icons Pattern */}
        <div style={{ position: 'absolute', top: '10%', left: '10%', opacity: 0.05 }}>
          <Trash2 size={150} color="#fff" />
        </div>
        <div style={{ position: 'absolute', bottom: '15%', right: '10%', opacity: 0.05 }}>
          <Recycle size={200} color="#fff" />
        </div>
        <div style={{ position: 'absolute', top: '40%', right: '20%', opacity: 0.05 }}>
          <Archive size={120} color="#fff" />
        </div>
        <div style={{ position: 'absolute', bottom: '30%', left: '15%', opacity: 0.05 }}>
          <Box size={100} color="#fff" />
        </div>

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            backdropFilter: 'blur(10px)',
            borderRadius: '50%', 
            width: '80px', 
            height: '80px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 2rem auto',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <ShieldCheck size={40} color="#38bdf8" />
          </div>
          
          <h1 style={{ color: '#fff', fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-1px', marginBottom: '1rem' }}>
            E-DéchetsSanté
          </h1>
          
          <div style={{ height: '3px', width: '40px', background: '#38bdf8', margin: '0 auto 1.5rem auto', borderRadius: '3px' }}></div>
          
          <p style={{ color: '#cbd5e1', fontSize: '1.1rem', lineHeight: '1.6', fontWeight: '400' }}>
            Application clinique sécurisée pour le traçage et la gestion des déchets médicaux hospitaliers.
          </p>

          <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8' }}></span>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }}></span>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }}></span>
          </div>
        </div>
      </div>

      {/* ===== RIGHT PANEL : Minimalist Login Form ===== */}
      <div style={{
        flex: '1',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '4rem',
        background: '#ffffff',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.03)',
        zIndex: 10
      }}>
        <div style={{ width: '100%', maxWidth: '380px', margin: '0 auto' }}>
          
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.5rem' }}>
              Accès Portail
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
              Identifiez-vous avec votre compte professionnel de santé.
            </p>
          </div>

          {error && (
            <div style={{
              background: '#fef2f2', borderLeft: '4px solid #ef4444',
              padding: '12px 16px', borderRadius: '4px',
              fontSize: '0.9rem', color: '#b91c1c', marginBottom: '1.5rem',
              fontWeight: '500'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} autoComplete="off">
            {/* Email Field */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Email Professionnel
              </label>
              <input
                type="email"
                value={email}
                autoComplete="off"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ex: utilisateur@hopital.com"
                required
                onInvalid={(e) => e.target.setCustomValidity('Veuillez saisir votre email professionnel.')}
                onInput={(e) => e.target.setCustomValidity('')}
                style={{
                  width: '100%', padding: '14px 16px', boxSizing: 'border-box',
                  border: '1px solid #e2e8f0', borderRadius: '8px',
                  fontSize: '1rem', color: '#0f172a', background: '#f8fafc',
                  outline: 'none', transition: 'all 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'; }}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Mot de passe
                </label>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  autoComplete="off"
                  data-lpignore="true"
                  data-form-type="other"
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  required
                  onInvalid={(e) => e.target.setCustomValidity('Veuillez saisir votre mot de passe.')}
                  onInput={(e) => e.target.setCustomValidity('')}
                  style={{
                    width: '100%', padding: '14px 44px 14px 16px', boxSizing: 'border-box',
                    border: '1px solid #e2e8f0', borderRadius: '8px',
                    fontSize: '1rem', color: '#0f172a', background: '#f8fafc',
                    outline: 'none', transition: 'all 0.2s',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8',
                    display: 'flex', alignItems: 'center', padding: '0'
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%', padding: '14px',
                background: isLoading ? '#94a3b8' : '#1e3a8a',
                color: '#fff', border: 'none', borderRadius: '8px',
                fontSize: '1rem', fontWeight: '600', cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px'
              }}
              onMouseOver={e => !isLoading && (e.target.style.backgroundColor = '#1e40af')}
              onMouseOut={e => !isLoading && (e.target.style.backgroundColor = '#1e3a8a')}
            >
              {isLoading ? (
                <>
                  <div style={{
                    width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite'
                  }} />
                  Authentification...
                </>
              ) : 'Se connecter'}
            </button>
          </form>

          {/* Footer Note */}
          <div style={{ marginTop: '3rem', textAlign: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.5' }}>
              Système certifié Lean Healthcare. L'accès est strictement réservé au personnel autorisé de l'établissement.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Login;
