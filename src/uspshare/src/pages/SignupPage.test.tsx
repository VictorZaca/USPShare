import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import apiClient from '../api/axios';
import SignupPage from './SignupPage';

jest.mock('../api/axios');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

jest.useFakeTimers();

const renderComponent = () => {
  render(
    <MemoryRouter initialEntries={['/signup']}>
      <ThemeProvider theme={createTheme()}>
        <Routes>
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<div>Página de Login</div>} />
        </Routes>
      </ThemeProvider>
    </MemoryRouter>
  );
};

describe('SignupPage', () => {
  
  beforeEach(() => {
    mockedApiClient.post.mockClear();
  });

  describe('Form Validation', () => {
    test('should show an error if passwords do not match', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.type(screen.getByLabelText('Senha'), 'password123');
      await user.type(screen.getByLabelText('Confirmar Senha'), 'password456');
      await user.click(screen.getByRole('button', { name: /criar conta/i }));

      expect(await screen.findByRole('alert')).toHaveTextContent('As senhas não coincidem.');
    });

    test('should show an error if email is not a valid @usp.br email', async () => {
        const user = userEvent.setup();
        renderComponent();
  
        await user.type(screen.getByLabelText(/e-mail usp/i), 'aluno@gmail.com');
        await user.click(screen.getByRole('button', { name: /criar conta/i }));
  
        expect(await screen.findByRole('alert')).toHaveTextContent('Por favor, utilize um e-mail USP válido (@usp.br).');
    });

    test('should show an error if terms are not agreed to', async () => {
        const user = userEvent.setup();
        renderComponent();
        
        await user.type(screen.getByLabelText('Nome Completo'), 'Usuário Teste');
        await user.type(screen.getByLabelText(/e-mail usp/i), 'teste@usp.br');
        await user.type(screen.getByLabelText('Senha'), 'senhaforte123');
        await user.type(screen.getByLabelText('Confirmar Senha'), 'senhaforte123');

        await user.click(screen.getByRole('button', { name: /criar conta/i }));
  
        expect(await screen.findByRole('alert')).toHaveTextContent('Você precisa concordar com os termos de uso.');
    });
  });

  test('should display password strength as user types', async () => {
    const user = userEvent.setup();
    renderComponent();

    const passwordInput = screen.getByLabelText('Senha');
    
    await user.type(passwordInput, 'fraca');
    expect(await screen.findByText('Fraca')).toBeInTheDocument();
    
    await user.type(passwordInput, 'Forte123');
    expect(await screen.findByText('Boa')).toBeInTheDocument();
    
    await user.type(passwordInput, '!');
    expect(await screen.findByText('Forte')).toBeInTheDocument();
  });

  test('should handle successful signup, show success message, and redirect to login', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    mockedApiClient.post.mockResolvedValue({ data: { message: 'Usuário criado com sucesso' } });

    renderComponent();

    await user.type(screen.getByLabelText('Nome Completo'), 'Usuário de Sucesso');
    await user.type(screen.getByLabelText(/e-mail usp/i), 'sucesso@usp.br');
    await user.type(screen.getByLabelText('Senha'), 'Senhaforte!123');
    await user.type(screen.getByLabelText('Confirmar Senha'), 'Senhaforte!123');
    await user.click(screen.getByRole('checkbox', { name: /eu concordo com os termos de uso/i }));

    const submitButton = screen.getByRole('button', { name: /criar conta/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockedApiClient.post).toHaveBeenCalledWith('/api/signup', {
        name: 'Usuário de Sucesso',
        email: 'sucesso@usp.br',
        password: 'Senhaforte!123',
      });
    });

    expect(await screen.findByRole('heading', { name: /cadastro realizado com sucesso!/i })).toBeInTheDocument();
    expect(screen.getByText(/redirecionando para a página de login/i)).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(await screen.findByText('Página de Login')).toBeInTheDocument();
  });

  test('should display an API error message on failed signup', async () => {
    const user = userEvent.setup();
    mockedApiClient.post.mockRejectedValue({
        response: { data: { error: 'Este e-mail já está em uso.' } }
    });

    renderComponent();

    await user.type(screen.getByLabelText('Nome Completo'), 'Usuário Duplicado');
    await user.type(screen.getByLabelText(/e-mail usp/i), 'duplicado@usp.br');
    await user.type(screen.getByLabelText('Senha'), 'senha123');
    await user.type(screen.getByLabelText('Confirmar Senha'), 'senha123');
    await user.click(screen.getByRole('checkbox'));

    await user.click(screen.getByRole('button', { name: /criar conta/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Este e-mail já está em uso.');
  });
});