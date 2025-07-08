import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { useAuth } from './context/AuthContext';

jest.mock('./context/AuthContext');
const mockedUseAuth = useAuth as jest.Mock;

jest.mock('./pages/Menu', () => () => <div>Menu Mock</div>);
jest.mock('./pages/Footer', () => () => <div>Footer Mock</div>);
jest.mock('./pages/LandingPage', () => () => <div>Landing Page Mock</div>);
jest.mock('./pages/ExplorePage', () => () => <div>Explore Page Mock</div>);
jest.mock('./pages/LoginPage', () => () => <div>Login Page Mock</div>);
jest.mock('./pages/SignupPage', () => () => <div>Signup Page Mock</div>);
jest.mock('./pages/FilePage', () => () => <div>File Page Mock</div>);
jest.mock('./pages/AboutPage', () => () => <div>About Page Mock</div>);
jest.mock('./pages/AdminProtectedRoute', () => ({
  AdminProtectedRoute: ({ children }: { children: any }) => children, // Por padrão, permite a passagem
}));
jest.mock('./pages/AdminPage', () => () => <div>Admin Page Mock</div>);

const renderWithRouter = (initialRoute: string) => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <App />
    </MemoryRouter>
  );
};

describe('App Routing', () => {

  beforeEach(() => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: false, 
      loading: false,
    });
  });

  test('should render layout components (Menu, Footer) on all pages', () => {
    renderWithRouter('/');
    expect(screen.getByText('Menu Mock')).toBeInTheDocument();
    expect(screen.getByText('Footer Mock')).toBeInTheDocument();
  });

  test('should render LandingPage for the root path ("/")', () => {
    renderWithRouter('/');
    expect(screen.getByText('Landing Page Mock')).toBeInTheDocument();
  });

  test('should render ExplorePage for the "/explore" path', () => {
    renderWithRouter('/explore');
    expect(screen.getByText('Explore Page Mock')).toBeInTheDocument();
  });

  test('should render LoginPage for the "/login" path', () => {
    renderWithRouter('/login');
    expect(screen.getByText('Login Page Mock')).toBeInTheDocument();
  });

  test('should render SignupPage for the "/signup" path', () => {
    renderWithRouter('/signup');
    expect(screen.getByText('Signup Page Mock')).toBeInTheDocument();
  });

  test('should render FilePage for a dynamic "/file/:id" path', () => {
    renderWithRouter('/file/some-file-id');
    expect(screen.getByText('File Page Mock')).toBeInTheDocument();
  });

  describe('Admin Protected Route', () => {
    
    test('should redirect from /admin if user is not an admin', () => {
        jest.spyOn(require('./pages/AdminProtectedRoute'), 'AdminProtectedRoute')
          .mockImplementation(() => <div>Redirecionado para Explore</div>);

        mockedUseAuth.mockReturnValue({
            isAuthenticated: true,
            user: { role: 'user' },
            loading: false
        });

        renderWithRouter('/admin');

        expect(screen.getByText('Redirecionado para Explore')).toBeInTheDocument();
        expect(screen.queryByText('Admin Page Mock')).not.toBeInTheDocument();
    });

    test('should render AdminPage for the "/admin" path if user is an admin', () => {
         jest.spyOn(require('./pages/AdminProtectedRoute'), 'AdminProtectedRoute')
            
        mockedUseAuth.mockReturnValue({
            isAuthenticated: true,
            user: { role: 'admin' },
            loading: false
        });

        renderWithRouter('/admin');
        
        expect(screen.getByText('Admin Page Mock')).toBeInTheDocument();
    });
  });
});