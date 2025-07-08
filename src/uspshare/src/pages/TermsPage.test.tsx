import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import TermsPage from './TermsPage';
import { type ReactNode } from 'react';


const MockedThemeProvider = ({ children }: { children: ReactNode }) => {
  const theme = createTheme();
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

const renderComponent = () => {
  render(
    <MemoryRouter>
      <MockedThemeProvider>
        <TermsPage />
      </MockedThemeProvider>
    </MemoryRouter>
  );
};

describe('TermsPage', () => {
  test('should render the main title and the last updated date', () => {
    renderComponent();

    expect(screen.getByRole('heading', { name: /termos de uso/i })).toBeInTheDocument();
    expect(screen.getByText(/última atualização: 17 de junho de 2025/i)).toBeInTheDocument();
  });

  test('should render all section headings correctly', () => {
    renderComponent();

    expect(screen.getByRole('heading', { name: /1\. introdução/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /2\. elegibilidade/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /3\. contas e registro/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /4\. conteúdo do usuário/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /5\. uso ético e conteúdo proibido/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /9\. limitação de responsabilidade/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /10\. modificações dos termos/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /12\. contato/i })).toBeInTheDocument();
  });

  test('should render specific key points from the terms', () => {
    renderComponent();

    expect(screen.getByText(/manter a segurança de sua senha/i)).toBeInTheDocument();
    
    expect(screen.getByText(/viole direitos autorais ou outras leis/i)).toBeInTheDocument();
  });

  test('should render links in the contact section with correct href attributes', () => {
    renderComponent();

    const emailLink = screen.getByRole('link', { name: /termos@uspshare.com.br/i });
    expect(emailLink).toBeInTheDocument();
    expect(emailLink).toHaveAttribute('href', 'mailto:termos@uspshare.com.br');

    const contactPageLink = screen.getByRole('link', { name: /página de contato/i });
    expect(contactPageLink).toBeInTheDocument();
    expect(contactPageLink).toHaveAttribute('href', '/contact');
  });

  test('should display the final agreement paper at the bottom', () => {
    renderComponent();
    
    const agreementText = screen.getByText(/ao utilizar o uspshare, você confirma que leu/i);
    expect(agreementText).toBeInTheDocument();
  });
});