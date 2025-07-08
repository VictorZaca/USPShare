import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import FeedbackPage from './FeedbackPage';
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
        <FeedbackPage />
      </MockedThemeProvider>
    </MemoryRouter>
  );
};

describe('FeedbackPage', () => {
  test('should render all form fields and static content correctly', () => {
    renderComponent();

    expect(screen.getByRole('heading', { name: /enviar feedback/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /formulário de feedback/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /outros canais de contato/i })).toBeInTheDocument();

    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mail usp/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tipo de feedback/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/seu feedback/i)).toBeInTheDocument();
    expect(screen.getByText(/como você avalia sua experiência/i)).toBeInTheDocument();

    expect(screen.queryByText(/feedback enviado com sucesso!/i)).not.toBeInTheDocument();
  });

  test('should allow user to fill and submit the form, then reset it', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderComponent();

    const nameInput = screen.getByLabelText(/nome completo/i);
    const emailInput = screen.getByLabelText(/e-mail usp/i);
    const messageInput = screen.getByLabelText(/seu feedback/i);
    const feedbackTypeSelect = screen.getByLabelText(/tipo de feedback/i);
    
    await user.type(nameInput, 'Ana Testadora');
    await user.type(emailInput, 'ana.testadora@usp.br');
    await user.type(messageInput, 'Ótima plataforma, parabéns!');

    await user.click(feedbackTypeSelect);
    await user.click(await screen.findByRole('option', { name: /elogio/i }));

    const ratingLabel = screen.getByLabelText('4 Estrelas'); 
    await user.click(ratingLabel);
    
    const submitButton = screen.getByRole('button', { name: /enviar feedback/i });
    await user.click(submitButton);

    const successAlert = await screen.findByRole('alert');
    expect(successAlert).toHaveTextContent(/feedback enviado com sucesso!/i);

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    expect(nameInput).toHaveValue('');
    expect(emailInput).toHaveValue('');
    expect(messageInput).toHaveValue('');
    expect(screen.queryByText('Elogio')).not.toBeInTheDocument();
    const checkedRating = screen.queryByRole('radio', { checked: true });
    expect(checkedRating).toBeNull();
  });

  test('should have a link to the report page', () => {
    renderComponent();
    
    const reportLink = screen.getByRole('link', { name: /página de denúncias/i });
    expect(reportLink).toBeInTheDocument();
    expect(reportLink).toHaveAttribute('href', '/report');
  });
});