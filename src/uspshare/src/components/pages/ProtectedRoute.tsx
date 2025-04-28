// ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';

// Simulação de autenticação (poderia ser Context API, Redux, etc.)
function isAuthenticated() {
//   return localStorage.getItem('token') !== null;
    // return false; // Simulação de não autenticado
  return true; // Simulação de autenticado
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) {
    // Usuário não está autenticado, redireciona para login
    return <Navigate to="/login" replace />;
  }

  // Usuário autenticado, permite acesso
  return children;
}

export default ProtectedRoute;