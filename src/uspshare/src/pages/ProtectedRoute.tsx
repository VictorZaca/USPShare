import { Navigate } from 'react-router-dom';

function isAuthenticated() {
  return localStorage.getItem('app_token') !== null;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;