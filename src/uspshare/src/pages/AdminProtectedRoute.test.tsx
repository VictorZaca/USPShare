import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AdminProtectedRoute } from './AdminProtectedRoute';

jest.mock('../context/AuthContext');

const mockedUseAuth = useAuth as jest.Mock;

describe('AdminProtectedRoute', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should render a loading spinner while auth state is loading', () => {
    mockedUseAuth.mockReturnValue({
      loading: true,
      isAuthenticated: false,
      user: null,
    });

    render(
      <MemoryRouter>
        <AdminProtectedRoute>
          <h1>Página de Admin</h1>
        </AdminProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('should redirect to /explore if user is not authenticated', () => {
    mockedUseAuth.mockReturnValue({
      loading: false,
      isAuthenticated: false,
      user: null,
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <h1>Página de Admin</h1>
              </AdminProtectedRoute>
            }
          />
          <Route path="/explore" element={<h1>Página de Exploração</h1>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByRole('heading', { name: /página de admin/i })).not.toBeInTheDocument();
    
    expect(screen.getByRole('heading', { name: /página de exploração/i })).toBeInTheDocument();
  });

  test('should redirect to /explore if user is not an admin', () => {
    mockedUseAuth.mockReturnValue({
      loading: false,
      isAuthenticated: true,
      user: { name: 'Usuário Comum', role: 'user' },
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <h1>Página de Admin</h1>
              </AdminProtectedRoute>
            }
          />
          <Route path="/explore" element={<h1>Página de Exploração</h1>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByRole('heading', { name: /página de admin/i })).not.toBeInTheDocument();
    
    expect(screen.getByRole('heading', { name: /página de exploração/i })).toBeInTheDocument();
  });

  test('should render children if user is an authenticated admin', () => {
    mockedUseAuth.mockReturnValue({
      loading: false,
      isAuthenticated: true,
      user: { name: 'Administrador', role: 'admin' },
    });

    render(
      <MemoryRouter>
        <AdminProtectedRoute>
          <h1>Página de Admin Visível</h1>
        </AdminProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /página de admin visível/i })).toBeInTheDocument();
  });
});