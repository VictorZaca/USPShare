import '@testing-library/jest-dom';
import { type ReactNode } from 'react'; 
import { render, screen } from '@testing-library/react';
import AboutPage from './AboutPage';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const MockedThemeProvider = ({ children }: { children: ReactNode }) => {
  const theme = createTheme();
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};


describe('AboutPage', () => {

  beforeEach(() => {
    render(
      <MockedThemeProvider>
        <AboutPage />
      </MockedThemeProvider>
    );
  });

  it('should render the main heading and subheading', () => {
    const mainHeading = screen.getByRole('heading', { name: /sobre o uspshare/i });
    const subheading = screen.getByText(/conheça nossa missão, visão e como estamos transformando/i);

    expect(mainHeading).toBeInTheDocument();
    expect(subheading).toBeInTheDocument();
  });

  it('should render the "Nossa Missão" section with its content', () => {
    const missionHeading = screen.getByRole('heading', { name: /nossa missão/i });
    const missionText = screen.getByText(/democratizar o acesso a materiais acadêmicos/i);

    expect(missionHeading).toBeInTheDocument();
    expect(missionText).toBeInTheDocument();
  });

  it('should display the history section with key statistics', () => {
    expect(screen.getByRole('heading', { name: /nossa história/i })).toBeInTheDocument();
    
    expect(screen.getByText('2025')).toBeInTheDocument();
    expect(screen.getByText('Ano de fundação')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Fundadores')).toBeInTheDocument();
  });

  it('should render the "Nossos Valores" section with all three values', () => {
    expect(screen.getByRole('heading', { name: /nossos valores/i })).toBeInTheDocument();

    expect(screen.getByText('Colaboração')).toBeInTheDocument();
    expect(screen.getByText('Integridade')).toBeInTheDocument();
    expect(screen.getByText('Qualidade')).toBeInTheDocument();
  });
  
  it('should render the "Principais Recursos" section', () => {
    expect(screen.getByRole('heading', { name: /principais recursos/i })).toBeInTheDocument();

    expect(screen.getByText('Compartilhamento de Arquivos')).toBeInTheDocument();
    expect(screen.getByText('Busca Inteligente')).toBeInTheDocument();
  });

  it('should display the team members', () => {
    expect(screen.getByRole('heading', { name: /nossa equipe/i })).toBeInTheDocument();

    const enzoName = screen.getByText('Enzo Spinella');
    const victorName = screen.getByText('Victor Zacarias');

    expect(enzoName).toBeInTheDocument();
    expect(victorName).toBeInTheDocument();
  });

  it('should render the "Junte-se a Nós" section with a correct mailto link', () => {
    expect(screen.getByRole('heading', { name: /junte-se a nós/i })).toBeInTheDocument();

    const contactLink = screen.getByRole('link', { name: /voluntarios@uspshare.com.br/i });
    
    expect(contactLink).toBeInTheDocument();
    expect(contactLink).toHaveAttribute('href', 'mailto:voluntarios@uspshare.com.br');
  });
});