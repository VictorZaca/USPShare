import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import apiClient from '../api/axios';
import ExplorePage from './ExplorePage';
import { type ReactNode } from 'react';

jest.mock('../api/axios');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

jest.mock('../components/subject-detail', () => ({
  SubjectDetail: () => <div>Detalhes da Matéria</div>,
}));

const MockedThemeProvider = ({ children }: { children: ReactNode }) => {
  const theme = createTheme();
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

const mockApiResponse = {
  resources: [
    { courseCode: 'MAC0110', course: 'Introdução à Computação', type: 'prova', tags: ['P1'], semester: '2024-1', professor: 'Prof. A', likes: 10, uploadDate: '2024-06-15T10:00:00Z' },
    { courseCode: 'MAC0110', course: 'Introdução à Computação', type: 'lista', tags: [], semester: '2023-2', professor: 'Prof. B', likes: 5, uploadDate: '2023-11-20T10:00:00Z' },
    { courseCode: 'MAT0112', course: 'Cálculo II', type: 'resumo', tags: ['P2', 'Final'], semester: '2024-1', professor: 'Prof. C', likes: 25, uploadDate: '2024-07-01T15:00:00Z' },
  ],
  tags: [{ _id: 't1', name: 'P1' }, { _id: 't2', name: 'P2' }],
  professors: [{ _id: 'p1', name: 'Prof. C', avatarUrl: '/prof-c.png' }],
};

describe('ExplorePage', () => {

  beforeEach(() => {
    mockedApiClient.get.mockImplementation((url) => {
      if (url.endsWith('/resources')) return Promise.resolve({ data: mockApiResponse.resources });
      if (url.endsWith('/tags')) return Promise.resolve({ data: mockApiResponse.tags });
      if (url.endsWith('/professors')) return Promise.resolve({ data: mockApiResponse.professors });
      return Promise.resolve({ data: [] });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should render initial list of subjects grouped and sorted correctly', async () => {
    render(
      <MockedThemeProvider>
        <ExplorePage />
      </MockedThemeProvider>
    );

    expect(await screen.findByText(/MAC0110 - Introdução à Computação/i)).toBeInTheDocument();
    expect(await screen.findByText(/MAT0112 - Cálculo II/i)).toBeInTheDocument();

    expect(mockedApiClient.get).toHaveBeenCalledTimes(3);
  });

  test('should filter subjects based on search query', async () => {
    const user = userEvent.setup();
    render(
      <MockedThemeProvider>
        <ExplorePage />
      </MockedThemeProvider>
    );

    await screen.findByText(/MAC0110/);
    
    const searchInput = screen.getByPlaceholderText(/buscar por disciplina ou código/i);
    await user.type(searchInput, 'Cálculo');

    expect(screen.getByText(/MAT0112 - Cálculo II/i)).toBeInTheDocument();
    expect(screen.queryByText(/MAC0110 - Introdução à Computação/i)).not.toBeInTheDocument();
  });

  test('should filter subjects by file type', async () => {
    const user = userEvent.setup();
    render(
      <MockedThemeProvider>
        <ExplorePage />
      </MockedThemeProvider>
    );
    await screen.findByText(/MAC0110/);

    await user.click(screen.getByLabelText(/tipo de material/i));
    await user.click(await screen.findByRole('option', { name: /provas/i }));

    expect(screen.getByText(/MAC0110 - Introdução à Computação/i)).toBeInTheDocument();
    expect(screen.queryByText(/MAT0112 - Cálculo II/i)).not.toBeInTheDocument();
  });

  test('should filter using the advanced filter drawer and clear it', async () => {
    const user = userEvent.setup();
    render(
      <MockedThemeProvider>
        <ExplorePage />
      </MockedThemeProvider>
    );
    await screen.findByText(/MAC0110/);

    await user.click(screen.getByRole('button', { name: /filtros/i }));

    const tagCheckbox = await screen.findByLabelText('P2');
    await user.click(tagCheckbox);

    await waitFor(() => {
      expect(screen.queryByText(/MAC0110 - Introdução à Computação/i)).not.toBeInTheDocument();
    });
    expect(screen.getByText(/MAT0112 - Cálculo II/i)).toBeInTheDocument();

    const chip = screen.getByRole('button', { name: /p2/i });
    expect(chip).toBeInTheDocument();

    await user.click(within(chip).getByTestId('CancelIcon'));

    expect(await screen.findByText(/MAC0110 - Introdução à Computação/i)).toBeInTheDocument();
    expect(screen.getByText(/MAT0112 - Cálculo II/i)).toBeInTheDocument();
  });

  test('should sort subjects by most recent', async () => {
    const user = userEvent.setup();
    render(
      <MockedThemeProvider>
        <ExplorePage />
      </MockedThemeProvider>
    );
    await screen.findByText(/MAC0110/);

    const recentTab = screen.getByRole('tab', { name: /mais recentes/i });
    await user.click(recentTab);

    const subjectHeaders = await screen.findAllByRole('button', { name: /mac|mat/i });

    expect(subjectHeaders[0]).toHaveTextContent('MAT0112 - Cálculo II');
    expect(subjectHeaders[1]).toHaveTextContent('MAC0110 - Introdução à Computação');
  });

  test('should display "no results" message when filters match nothing', async () => {
    const user = userEvent.setup();
    render(
      <MockedThemeProvider>
        <ExplorePage />
      </MockedThemeProvider>
    );
    await screen.findByText(/MAC0110/);

    const searchInput = screen.getByPlaceholderText(/buscar por disciplina ou código/i);
    await user.type(searchInput, 'Física Quântica');

    expect(await screen.findByText(/nenhuma disciplina encontrada/i)).toBeInTheDocument();
  });
});