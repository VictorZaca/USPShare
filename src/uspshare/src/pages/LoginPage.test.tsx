import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useAuth } from '../context/AuthContext';
import LoginPage from './LoginPage';

jest.mock('../context/AuthContext');

const mockedUseAuth = useAuth as jest.Mock;
const mockLogin = jest.fn();

const renderComponent = () => {
  render(
    <MemoryRouter initialEntries={['/login']}>
      <ThemeProvider theme={createTheme()}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/explore" element={<div>Página de Exploração</div>} />
          <Route path="/signup" element={<div>Página de Cadastro</div>} />
          <Route path="/forgot-password" element={<div>Página de Recuperação de Senha</div>} />
        </Routes>
      </ThemeProvider>
    </MemoryRouter>
  );
};

describe('LoginPage', () => {
  beforeEach(() => {
    mockedUseAuth.mockReturnValue({
      login: mockLogin,
    });
    mockLogin.mockClear();
  });

  test('should render all form fields and links', () => {
    renderComponent();

    expect(screen.getByRole('heading', { name: /entrar/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mail usp/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /lembrar de mim/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /esqueceu a senha/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /cadastre-se/i })).toBeInTheDocument();
  });

  test('should call login function and navigate to /explore on successful submission', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue(undefined);

    renderComponent();

    const emailInput = screen.getByLabelText(/e-mail usp/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitButton = screen.getByRole('button', { name: /entrar/i });

    await user.type(emailInput, 'aluno@usp.br');
    await user.type(passwordInput, 'senha123');

    await user.click(submitButton);

    expect(mockLogin).toHaveBeenCalledWith('aluno@usp.br', 'senha123');

    expect(submitButton).toHaveClass('MuiLoadingButton-loading');

    expect(await screen.findByText(/página de exploração/i)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /entrar/i })).not.toBeInTheDocument();
  });

  test('should display an error message on failed login', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Credenciais inválidas';
    mockLogin.mockRejectedValue(new Error(errorMessage));

    renderComponent();

    const emailInput = screen.getByLabelText(/e-mail usp/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitButton = screen.getByRole('button', { name: /entrar/i });

    await user.type(emailInput, 'aluno@usp.br');
    await user.type(passwordInput, 'senha_errada');
    await user.click(submitButton);

    expect(mockLogin).toHaveBeenCalledWith('aluno@usp.br', 'senha_errada');

    const errorAlert = await screen.findByRole('alert');
    expect(errorAlert).toHaveTextContent(errorMessage);

    expect(submitButton).not.toHaveClass('MuiLoadingButton-loading');
  });
});