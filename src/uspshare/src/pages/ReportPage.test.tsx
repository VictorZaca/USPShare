import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ReportPage from './ReportPage';
import { type ReactNode } from 'react';

jest.useFakeTimers();

const MockedThemeProvider = ({ children }: { children: ReactNode }) => {
  const theme = createTheme();
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

const renderComponent = () => {
  render(
    <MemoryRouter>
      <MockedThemeProvider>
        <ReportPage />
      </MockedThemeProvider>
    </MemoryRouter>
  );
};

describe('ReportPage', () => {
  test('should render the initial form and all its fields', () => {
    renderComponent();

    expect(screen.getByRole('heading', { name: /reportar problema/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /formulário de denúncia/i })).toBeInTheDocument();
    expect(screen.getByText(/todas as denúncias são tratadas com confidencialidade/i)).toBeInTheDocument();

    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tipo de denúncia/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descrição detalhada do problema/i)).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /confirmo que as informações/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar denúncia/i })).toBeInTheDocument();
  });

  test('should not submit the form if the terms checkbox is not checked', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.type(screen.getByLabelText(/nome completo/i), 'Usuário Preocupado');
    await user.type(screen.getByLabelText(/descrição detalhada do problema/i), 'Descrição do problema.');

    const submitButton = screen.getByRole('button', { name: /enviar denúncia/i });
    await user.click(submitButton);

    expect(screen.queryByText(/denúncia enviada com sucesso!/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
  });

  test('should submit the form and show success message when all fields are valid and terms are agreed', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderComponent();

    await user.type(screen.getByLabelText(/nome completo/i), 'Usuário Atento');
    await user.type(screen.getByLabelText(/e-mail usp/i), 'atento@usp.br');
    
    await user.click(screen.getByLabelText(/tipo de denúncia/i));
    await user.click(await screen.findByRole('option', { name: /conteúdo inadequado/i }));

    await user.click(screen.getByLabelText(/tipo de conteúdo/i));
    await user.click(await screen.findByRole('option', { name: /comentário/i }));

    await user.type(screen.getByLabelText(/descrição detalhada do problema/i), 'Este comentário é ofensivo.');

    const termsCheckbox = screen.getByRole('checkbox', { name: /confirmo que as informações/i });
    await user.click(termsCheckbox);

    const submitButton = screen.getByRole('button', { name: /enviar denúncia/i });
    await user.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(screen.getByText('Enviar Denúncia')).toBeInTheDocument(); 
    
    act(() => {
      jest.runAllTimers();
    });

    const successAlert = await screen.findByRole('alert');
    expect(successAlert).toBeInTheDocument();
    expect(screen.getByText(/denúncia enviada com sucesso!/i)).toBeInTheDocument();

    expect(screen.queryByRole('heading', { name: /formulário de denúncia/i })).not.toBeInTheDocument();
  });

  test('should have a link to the feedback page in the final alert', () => {
    renderComponent();
    
    const feedbackLink = screen.getByRole('link', { name: /página de feedback/i });
    expect(feedbackLink).toBeInTheDocument();
    expect(feedbackLink).toHaveAttribute('href', '/feedback');
  });
});