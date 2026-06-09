import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Dechets from './pages/Dechets';
import Users from './pages/Users';
import Alertes from './pages/Alertes';
import Documents from './pages/Documents';
import Predictions from './pages/Predictions';
import Rapport from './pages/Rapport';
import './App.css';

// Composant simple pour protéger les routes
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        
        {/* Routes protégées et indépendantes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/dashboard/dechets" element={<ProtectedRoute><Dechets /></ProtectedRoute>} />
        <Route path="/dashboard/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
        <Route path="/dashboard/alertes" element={<ProtectedRoute><Alertes /></ProtectedRoute>} />
        <Route path="/dashboard/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
        <Route path="/dashboard/predictions" element={<ProtectedRoute><Predictions /></ProtectedRoute>} />
        <Route path="/dashboard/rapport" element={<ProtectedRoute><Rapport /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
