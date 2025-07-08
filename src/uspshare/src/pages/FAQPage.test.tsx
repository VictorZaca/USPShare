import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import FAQPage from './FAQPage';
import { type ReactNode } from 'react';

const MockedThemeProvider = ({ children }: { children: ReactNode }) => {
  const theme = createTheme();
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

const renderComponent = () => {
  render(
    <MemoryRouter>
      <MockedThemeProvider>
        <FAQPage />
      </MockedThemeProvider>
    </MemoryRouter>
  );
};


describe('FAQPage', () => {
  test('should render the initial page elements correctly', () => {
    renderComponent();

    expect(screen.getByRole('heading', { name: /perguntas frequentes/i })).toBeInTheDocument();
    expect(screen.getByText(/encontre respostas para as dúvidas mais comuns/i)).toBeInTheDocument();

    expect(screen.getByPlaceholderText(/buscar nas perguntas frequentes/i)).toBeInTheDocument();

    const geralTab = screen.getByRole('tab', { name: 'Geral' });
    expect(geralTab).toHaveAttribute('aria-selected', 'true');

    expect(screen.getByRole('heading', { name: /ainda tem dúvidas/i })).toBeInTheDocument();
  });

  test('should switch tabs and update content when a tab is clicked', async () => {
    const user = userEvent.setup();
    renderComponent();

    const arquivosTab = screen.getByRole('tab', { name: /arquivos/i });

    expect(arquivosTab).toHaveAttribute('aria-selected', 'false');

    await user.click(arquivosTab);

    expect(arquivosTab).toHaveAttribute('aria-selected', 'true');

    expect(screen.getByText(/perguntas da categoria: arquivos/i)).toBeInTheDocument();
  });

  test('should expand and collapse the accordion when clicked', async () => {
    const user = userEvent.setup();
    renderComponent();

    const accordionHeader = screen.getByText('O que é o USPShare?');
    
    const accordionContentText = /uma plataforma colaborativa criada por e para estudantes/i;

    expect(screen.queryByText(accordionContentText)).not.toBeInTheDocument();
    
    await user.click(accordionHeader);

    expect(await screen.findByText(accordionContentText)).toBeInTheDocument();

    await user.click(accordionHeader);

    await waitFor(() => {
      expect(screen.queryByText(accordionContentText)).not.toBeInTheDocument();
    });
  });

  test('should have a "Fale Conosco" button that links to the contact page', () => {
    renderComponent();
    
    const contactLink = screen.getByRole('link', { name: /fale conosco/i });

    expect(contactLink).toBeInTheDocument();

    expect(contactLink).toHaveAttribute('href', '/contact');
  });
});