import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/axios';
import ProfilePage from './ProfilePage';

jest.mock('../api/axios');
jest.mock('../context/AuthContext');

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;
const mockedUseAuth = useAuth as jest.Mock;

const mockRefreshUser = jest.fn();

const renderComponent = () => {
  render(
    <MemoryRouter>
      <ThemeProvider theme={createTheme()}>
        <ProfilePage />
      </ThemeProvider>
    </MemoryRouter>
  );
};

const mockProfile = {
  name: 'Enzo Testador',
  email: 'enzo@usp.br',
  course: 'Ciência da Computação',
  faculty: 'IME-USP',
  yearJoined: '2021',
  bio: 'Apenas um testador.',
  badges: ['Novo Membro', 'Colaborador'],
  stats: { uploads: 5, likes: 20, comments: 10, reputation: 50 },
};

const mockUploads = [{ id: 'upload1', title: 'Minha Primeira Prova', courseCode: 'MAC0110' }];

describe('ProfilePage', () => {
  beforeEach(() => {
    mockedApiClient.get.mockClear();
    mockedApiClient.put.mockClear();
    mockedApiClient.post.mockClear();
    mockRefreshUser.mockClear();
  });

  test('should show a loading spinner while the profile is loading', () => {
    mockedUseAuth.mockReturnValue({ loading: true });
    renderComponent();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('should show an error message if the profile fails to load', () => {
    mockedUseAuth.mockReturnValue({ loading: false, user: null });
    renderComponent();
    expect(screen.getByText(/perfil não pôde ser carregado/i)).toBeInTheDocument();
  });

  describe('when profile is loaded', () => {
    beforeEach(() => {
      mockedUseAuth.mockReturnValue({
        loading: false,
        user: mockProfile,
        refreshUser: mockRefreshUser,
      });
      mockedApiClient.get.mockResolvedValue({ data: mockUploads });
    });

    test('should render profile information, stats, and user uploads', async () => {
      renderComponent();

      expect(await screen.findByRole('heading', { name: /enzo testador/i })).toBeInTheDocument();
      expect(screen.getByText(/ciência da computação/i)).toBeInTheDocument();
      expect(screen.getByText(/apenas um testador/i)).toBeInTheDocument();

      expect(screen.getByText('5')).toBeInTheDocument(); 
      expect(screen.getByText('20')).toBeInTheDocument(); 

      const uploadsTab = screen.getByRole('tab', { name: /uploads/i });
      expect(uploadsTab).toHaveAttribute('aria-selected', 'true');
      expect(await screen.findByText('Minha Primeira Prova')).toBeInTheDocument();
    });

    test('should open the edit modal, allow changes, and save them', async () => {
      const user = userEvent.setup();
      mockedApiClient.put.mockResolvedValue({});
      mockedApiClient.post.mockResolvedValue({});

      renderComponent();

      await user.click(screen.getByRole('button', { name: /editar perfil/i }));
      const dialog = await screen.findByRole('dialog');
      expect(dialog).toBeInTheDocument();

      const bioInput = within(dialog).getByLabelText(/bio/i);
      const fileInput = within(dialog).getByLabelText(/trocar imagem/i).querySelector('input')!;
      
      await user.clear(bioInput);
      await user.type(bioInput, 'Um testador experiente.');

      const fakeAvatar = new File(['avatar'], 'avatar.png', { type: 'image/png' });
      await user.upload(fileInput, fakeAvatar);

      const saveButton = within(dialog).getByRole('button', { name: /salvar alterações/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockedApiClient.put).toHaveBeenCalledWith('/api/profile', expect.objectContaining({
          bio: 'Um testador experiente.'
        }));
        expect(mockedApiClient.post).toHaveBeenCalledWith('/api/profile/avatar', expect.any(FormData));
      });
      
      expect(mockRefreshUser).toHaveBeenCalledTimes(1);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    test('should switch tabs correctly', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const activityTab = await screen.findByRole('tab', { name: /atividade/i });
      await user.click(activityTab);

      expect(activityTab).toHaveAttribute('aria-selected', 'true');
      expect(await screen.findByText(/o histórico de atividades do usuário aparecerá aqui/i)).toBeInTheDocument();
    });
  });
});