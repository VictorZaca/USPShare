import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import apiClient from '../api/axios';
import LandingPage from './LandingPage';

jest.mock('../api/axios');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

jest.mock('../components/stats-counter', () => ({
  StatsCounter: ({ value, label }: { value: number; label: string }) => (
    <div>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  ),
}));

jest.mock('../components/feature-card', () => ({
  FeatureCard: ({ title }: { title: string }) => <div>{title}</div>,
}));

const renderComponent = () => {
  render(
    <MemoryRouter>
      <ThemeProvider theme={createTheme()}>
        <LandingPage />
      </ThemeProvider>
    </MemoryRouter>
  );
};

describe('HomePage', () => {
  const mockStats = {
    resources: 1250,
    users: 875,
    courses: 92,
    downloads: 15000,
  };

  beforeEach(() => {
    mockedApiClient.get.mockResolvedValue({ data: mockStats });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should render all static sections and main call-to-action buttons', () => {
    renderComponent();

    expect(screen.getByRole('heading', { name: /uspShare: compartilhe e acesse/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /explorar materiais/i })).toBeInTheDocument();
    
    expect(screen.getByRole('heading', { name: /principais recursos/i })).toBeInTheDocument();
    expect(screen.getByText('Busca Inteligente')).toBeInTheDocument();
    expect(screen.getByText('Interação Social')).toBeInTheDocument();
    
    expect(screen.getByRole('heading', { name: /junte-se à comunidade uspshare/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /criar conta/i })).toBeInTheDocument();
  });

  test('should fetch stats and display them correctly', async () => {
    renderComponent();

    expect(mockedApiClient.get).toHaveBeenCalledWith('/api/stats');
    
    expect(await screen.findByText('1250')).toBeInTheDocument();
    
    expect(screen.getByText('875')).toBeInTheDocument();
    expect(screen.getByText('92')).toBeInTheDocument(); 
    
    expect(screen.getByText('Arquivos')).toBeInTheDocument();
    expect(screen.getByText('Usuários')).toBeInTheDocument();
    expect(screen.getByText('Cursos')).toBeInTheDocument();
  });

  test('should render stats as 0 if API call fails', async () => {
    mockedApiClient.get.mockRejectedValue(new Error('Network Error'));
    
    renderComponent();

    const zeroValueElements = await screen.findAllByText('0');
    
    expect(zeroValueElements.length).toBeGreaterThanOrEqual(3);
  });

  test('should have all call-to-action buttons linking to the correct pages', () => {
    renderComponent();

    const exploreButton = screen.getByRole('link', { name: /explorar materiais/i });
    const uploadButton = screen.getByRole('link', { name: /compartilhar/i });
    const createAccountButton = screen.getByRole('link', { name: /criar conta/i });
    const aboutButton = screen.getByRole('link', { name: /saiba mais/i });
    
    expect(exploreButton).toHaveAttribute('href', '/explore');
    expect(uploadButton).toHaveAttribute('href', '/upload');
    expect(createAccountButton).toHaveAttribute('href', '/signup');
    expect(aboutButton).toHaveAttribute('href', '/about');
  });
});