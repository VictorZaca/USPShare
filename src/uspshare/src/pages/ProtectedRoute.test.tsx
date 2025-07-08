import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem(key: string) {
      return store[key] || null;
    },
    setItem(key: string, value: string) {
      store[key] = value.toString();
    },
    removeItem(key: string) {
      delete store[key];
    },
    clear() {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

const ProtectedPage = () => <h1>Página Protegida</h1>;
const LoginPage = () => <h1>Página de Login</h1>;

const renderWithRouter = (initialRoute: string) => {
  render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route
          path="/protected"
          element={
            <ProtectedRoute>
              <ProtectedPage />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('ProtectedRoute', () => {

  beforeEach(() => {
    localStorageMock.clear();
  });

  test('should redirect to login page if user is not authenticated', () => {
    
    renderWithRouter('/protected');

    expect(screen.queryByRole('heading', { name: /página protegida/i })).not.toBeInTheDocument();

    expect(screen.getByRole('heading', { name: /página de login/i })).toBeInTheDocument();
  });

  test('should render the children component if user is authenticated', () => {
    localStorageMock.setItem('app_token', 'fake-jwt-token');

    renderWithRouter('/protected');

    expect(screen.getByRole('heading', { name: /página protegida/i })).toBeInTheDocument();
    
    expect(screen.queryByRole('heading', { name: /página de login/i })).not.toBeInTheDocument();
  });
});