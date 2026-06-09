import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Trash2, Bell, Users, FileText,
  BrainCircuit, LogOut, ShieldCheck, FileBarChart
} from 'lucide-react';

const Sidebar = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const initials = user
    ? (user.prenom?.[0] || '') + (user.nom?.[0] || '')
    : '?';

  const navItems = [
    {
      icon: <LayoutDashboard size={18} />,
      label: 'Tableau de bord',
      path: '/dashboard',
      roles: ['Administrateur', 'Responsable_Sanitaire'],
    },
    {
      icon: <Trash2 size={18} />,
      label: 'Gestion des Déchets',
      path: '/dashboard/dechets',
      roles: ['Administrateur', 'Infirmier', 'Equipe_Collecte', 'Responsable_Sanitaire'],
    },
    {
      icon: <Bell size={18} />,
      label: 'Suivi des Alertes',
      path: '/dashboard/alertes',
      roles: ['Administrateur', 'Responsable_Sanitaire'],
    },
    {
      icon: <BrainCircuit size={18} />,
      label: 'Prédictions IA',
      path: '/dashboard/predictions',
      roles: ['Administrateur', 'Responsable_Sanitaire'],
    },
    {
      icon: <FileText size={18} />,
      label: 'Documents',
      path: '/dashboard/documents',
      roles: ['Administrateur', 'Responsable_Sanitaire', 'Equipe_Collecte'],
    },
    {
      icon: <Users size={18} />,
      label: 'Utilisateurs',
      path: '/dashboard/users',
      roles: ['Administrateur'],
    },
    {
      icon: <FileBarChart size={18} />,
      label: 'Générer Rapport',
      path: '/dashboard/rapport',
      roles: ['Administrateur', 'Responsable_Sanitaire'],
    },
  ];

  const visibleItems = navItems.filter(item =>
    item.roles.includes(user?.role)
  );

  return (
    <div className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <ShieldCheck size={22} color="#38bdf8" />
        </div>
        <div>
          <div className="sidebar-brand-text">E-DéchetsSanté</div>
          <div className="sidebar-brand-subtitle">Application Hospitalière</div>
        </div>
      </div>

      {/* User info */}
      <div className="sidebar-user">
        <div className="sidebar-user-avatar">
          {initials.toUpperCase()}
        </div>
        <div>
          <div className="sidebar-user-name">
            {user?.prenom} {user?.nom}
          </div>
          <div className="sidebar-user-role">
            {user?.role?.replace('_', ' ')}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-nav-section">Navigation</div>
        {visibleItems.map(item => (
          <button
            key={item.path}
            className={`sidebar-nav-item${location.pathname === item.path ? ' active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="sidebar-footer">
        <button className="sidebar-logout" onClick={handleLogout}>
          <LogOut size={18} />
          Déconnexion
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
