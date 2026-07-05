import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="h-screen flex items-center justify-center">Chargement sécurisé...</div>;
  }

  // 1. Si l'utilisateur n'est pas connecté du tout
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Si le rôle de l'utilisateur n'est pas autorisé sur cette route
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirection en fonction du rôle
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (user.role === 'FLASHMAN') return <Navigate to="/flashman" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  // 3. Tout est OK, on affiche la page
  return children;
}