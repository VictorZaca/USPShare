import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Footer, { footerSections } from './Footer';


const renderComponent = () => {
  render(
    <MemoryRouter>
      <ThemeProvider theme={createTheme()}>
        <Footer />
      </ThemeProvider>
    </MemoryRouter>
  );
};

describe('Footer', () => {
  test('should render the main branding and description', () => {
    renderComponent();

    const brandLink = screen.getByRole('link', { name: /uspshare/i });
    expect(brandLink).toBeInTheDocument();
    expect(brandLink).toHaveAttribute('href', '/');

    expect(screen.getByText(/plataforma colaborativa para compartilhamento/i)).toBeInTheDocument();
  });

  test('should render all social media links correctly', () => {
    renderComponent();

    const twitterLink = screen.getByLabelText('Twitter');
    const instagramLink = screen.getByLabelText('Instagram');
    const githubLink = screen.getByLabelText('GitHub');

    expect(twitterLink).toBeInTheDocument();
    expect(twitterLink).toHaveAttribute('href', 'https://twitter.com');
    expect(twitterLink).toHaveAttribute('target', '_blank');

    expect(instagramLink).toBeInTheDocument();
    expect(instagramLink).toHaveAttribute('href', 'https://instagram.com');
    expect(instagramLink).toHaveAttribute('target', '_blank');
    
    expect(githubLink).toBeInTheDocument();
    expect(githubLink).toHaveAttribute('href', 'https://github.com');
    expect(githubLink).toHaveAttribute('target', '_blank');
  });

  test('should render all navigation, resource, and contact links correctly', () => {
    renderComponent();

    footerSections.forEach(section => {
      // Verifica se o título de cada seção está na tela
      expect(screen.getByRole('heading', { name: section.title })).toBeInTheDocument();

      section.links.forEach(link => {
        // Encontra o link pelo seu texto
        const linkElement = screen.getByRole('link', { name: link.label });
        expect(linkElement).toBeInTheDocument();

        // Verifica se o `href` do link está correto.
        // O `path` é para o RouterLink (interno), e o `href` é para o `<a>` (externo).
        const expectedHref = link.path || link.href;
        expect(linkElement).toHaveAttribute('href', expectedHref);
      });
    });
  });

  test('should display the correct copyright year', () => {
    renderComponent();

    // Pega o ano atual, da mesma forma que o componente faz.
    const currentYear = new Date().getFullYear();

    // Encontra o texto de copyright e verifica se ele contém o ano atual.
    const copyrightText = screen.getByText(/uspShare. todos os direitos reservados/i);
    expect(copyrightText).toBeInTheDocument();
    expect(copyrightText).toHaveTextContent(currentYear.toString());
  });
});