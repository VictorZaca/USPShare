import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import PrivacyPage from './PrivacyPage';
import { type ReactNode } from 'react';

const MockedThemeProvider = ({ children }: { children: ReactNode }) => {
  const theme = createTheme();
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

const renderComponent = () => {
  render(
    <MemoryRouter>
      <MockedThemeProvider>
        <PrivacyPage />
      </MockedThemeProvider>
    </MemoryRouter>
  );
};

describe('PrivacyPage', () => {
  test('should render the main title and the last updated date', () => {
    renderComponent();

    expect(screen.getByRole('heading', { name: /política de privacidade/i })).toBeInTheDocument();
    expect(screen.getByText(/última atualização: 17 de junho de 2025/i)).toBeInTheDocument();
  });

  test('should render all section headings', () => {
    renderComponent();

    expect(screen.getByRole('heading', { name: /1\. introdução/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /2\. informações que coletamos/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /3\. como utilizamos suas informações/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /4\. compartilhamento de informações/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /5\. segurança dos dados/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /6\. seus direitos e escolhas/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /9\. alterações nesta política de privacidade/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /10\. contato/i })).toBeInTheDocument();
  });

  test('should render specific content points like list items', () => {
    renderComponent();

    expect(screen.getByText('E-mail institucional da USP (@usp.br)')).toBeInTheDocument();
    expect(screen.getByText('Verificar sua identidade como membro da comunidade USP')).toBeInTheDocument();
  });

  test('should render all links with correct href attributes', () => {
    renderComponent();

    const contactPageLink = screen.getByRole('link', { name: /página de contato/i });
    expect(contactPageLink).toBeInTheDocument();
    expect(contactPageLink).toHaveAttribute('href', '/contact');

    const emailLink = screen.getByRole('link', { name: /privacidade@uspshare\.com\.br/i });
    expect(emailLink).toBeInTheDocument();
    expect(emailLink).toHaveAttribute('href', 'mailto:privacidade@uspshare.com.br');
  });

  test('should display the final confirmation paper at the bottom', () => {
    renderComponent();
    
    const confirmationText = screen.getByText(/ao utilizar o uspshare, você confirma que leu/i);
    expect(confirmationText).toBeInTheDocument();
  });
});