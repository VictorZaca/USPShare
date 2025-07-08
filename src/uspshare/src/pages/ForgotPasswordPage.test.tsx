import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ForgotPasswordPage from './ForgotPasswordPage';
import { type ReactNode } from 'react';

jest.useFakeTimers();

const MockedThemeProvider = ({ children }: { children: ReactNode }) => {
  const theme = createTheme();
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

const renderComponent = () => {
  render(
    <MemoryRouter>
      <ThemeProvider theme={createTheme()}>
        <Routes>
          <Route path="/" element={<ForgotPasswordPage />} />
          <Route path="/login" element={<div>Página de Login</div>} />
        </Routes>
      </ThemeProvider>
    </MemoryRouter>
  );
};

describe('ForgotPasswordPage', () => {
  test('should render initial form correctly', () => {
    renderComponent();

    expect(screen.getByRole('heading', { name: /esqueceu sua senha/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mail usp/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar instruções/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /voltar para o login/i })).toBeInTheDocument();
  });

  test('should show an error if the email is not a valid @usp.br email', async () => {
    const user = userEvent.setup();
    renderComponent();

    const emailInput = screen.getByLabelText(/e-mail usp/i);
    const submitButton = screen.getByRole('button', { name: /enviar instruções/i });

    await user.type(emailInput, 'aluno@gmail.com');

    expect(screen.getByText(/por favor, utilize um e-mail usp válido/i)).toBeInTheDocument();

    await user.click(submitButton);

    const errorAlert = await screen.findByRole('alert');
    expect(errorAlert).toHaveTextContent(/por favor, utilize um e-mail usp válido/i);
  });
  
  test('should show an error if email is empty on submission', async () => {
    const user = userEvent.setup();
    renderComponent();

    const submitButton = screen.getByRole('button', { name: /enviar instruções/i });
    await user.click(submitButton);

    const errorAlert = await screen.findByRole('alert');
    expect(errorAlert).toHaveTextContent(/por favor, informe seu e-mail usp/i);
  });


  test('should show loading state and then success message on valid submission', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderComponent();

    const emailInput = screen.getByLabelText(/e-mail usp/i);
    const submitButton = screen.getByRole('button', { name: /enviar instruções/i });

    await user.type(emailInput, 'aluno.valido@usp.br');
    
    await user.click(submitButton);
    
    expect(screen.getByRole('button', { name: /enviando.../i })).toBeDisabled();
    expect(screen.getByTestId('CircularProgress-root')).toBeInTheDocument(); // MUI adiciona data-testid por padrão
    
    act(() => {
      jest.runAllTimers();
    });

    expect(await screen.findByRole('heading', { name: /e-mail enviado!/i })).toBeInTheDocument();
    
    expect(screen.getByText(/enviamos instruções para aluno.valido@usp.br/i)).toBeInTheDocument();

    expect(screen.queryByLabelText(/e-mail usp/i)).not.toBeInTheDocument();
  });
  
  test('should link back to the login page', () => {
    renderComponent();
    
    const loginLink = screen.getByRole('link', { name: /voltar para o login/i });
    expect(loginLink).toHaveAttribute('href', '/login');
  });
});