import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContactPage from './ContactPage';
import { ThemeProvider, createTheme } from '@mui/material/styles';

jest.useFakeTimers();

const MockedThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const theme = createTheme();
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

describe('ContactPage', () => {
  test('should render the contact form and contact information correctly', () => {
    render(
      <MockedThemeProvider>
        <ContactPage />
      </MockedThemeProvider>
    );

    expect(screen.getByRole('heading', { name: /fale conosco/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /informações de contato/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /envie sua mensagem/i })).toBeInTheDocument();

    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/assunto/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar mensagem/i })).toBeInTheDocument();
  });

  test('should allow user to fill out and submit the form, showing a success message', async () => {
    const user = userEvent.setup({
      advanceTimers: jest.advanceTimersByTime,
    });
    
    render(
      <MockedThemeProvider>
        <ContactPage />
      </MockedThemeProvider>
    );

    await user.type(screen.getByLabelText(/nome completo/i), 'Usuário de Teste');
    await user.type(screen.getByLabelText(/e-mail/i), 'teste@email.com');
    await user.type(screen.getByLabelText(/mensagem/i), 'Esta é uma mensagem de teste.');
    
    await user.click(screen.getByLabelText(/assunto/i));
    await user.click(screen.getByRole('option', { name: /dúvida/i }));

    const submitButton = screen.getByRole('button', { name: /enviar mensagem/i });
    await user.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(screen.getByRole('button', { name: /enviando.../i })).toBeInTheDocument();

    act(() => {
      jest.runAllTimers();
    });

    expect(screen.getByText(/mensagem enviada com sucesso!/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/nome completo/i)).not.toBeInTheDocument();

    act(() => {
      jest.runAllTimers();
    });

    expect(screen.queryByText(/mensagem enviada com sucesso!/i)).not.toBeInTheDocument();
    
    const nameInput = screen.getByLabelText(/nome completo/i) as HTMLInputElement;
    expect(nameInput).toBeInTheDocument();
    expect(nameInput.value).toBe(''); 
  });
});