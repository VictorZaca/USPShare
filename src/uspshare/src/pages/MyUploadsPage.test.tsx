import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import apiClient from '../api/axios';
import MyUploadsPage from './MyUploadsPage';

jest.mock('../api/axios');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

jest.mock('../components/file-card', () => ({
  FileCard: ({ file }: { file: any }) => (
    <div data-testid={`file-card-${file.id}`}>
      <h3>{file.title}</h3>
    </div>
  ),
}));

const mockWindowConfirm = jest.spyOn(window, 'confirm');

const renderComponent = () => {
  render(
    <MemoryRouter>
      <ThemeProvider theme={createTheme()}>
        <MyUploadsPage />
      </ThemeProvider>
    </MemoryRouter>
  );
};

const mockUploads = [
  { id: 'upload1', title: 'Prova de IA' },
  { id: 'upload2', title: 'Resumo de Redes' },
];

describe('MyUploadsPage', () => {

  beforeEach(() => {
    mockedApiClient.get.mockClear();
    mockedApiClient.delete.mockClear();
    mockWindowConfirm.mockClear();
  });

  test('should show loading state and then display user uploads', async () => {
    mockedApiClient.get.mockResolvedValue({ data: mockUploads });
    renderComponent();

    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    expect(await screen.findByText('Prova de IA')).toBeInTheDocument();
    expect(screen.getByText('Resumo de Redes')).toBeInTheDocument();

    expect(mockedApiClient.get).toHaveBeenCalledWith('/api/my-uploads');
    
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  test('should display an empty state message if user has no uploads', async () => {
    mockedApiClient.get.mockResolvedValue({ data: [] });
    renderComponent();

    const emptyMessage = await screen.findByText(/você ainda não compartilhou nenhum material/i);
    expect(emptyMessage).toBeInTheDocument();

    expect(screen.getByRole('link', { name: /compartilhar meu primeiro material/i })).toBeInTheDocument();
  });

  test('should display an error message if fetching uploads fails', async () => {
    mockedApiClient.get.mockRejectedValue(new Error('API Error'));
    renderComponent();

    const errorMessage = await screen.findByRole('alert');
    expect(errorMessage).toHaveTextContent('Não foi possível carregar seus uploads.');
  });

  test('should delete an upload when user confirms', async () => {
    const user = userEvent.setup();
    mockWindowConfirm.mockReturnValue(true);
    mockedApiClient.get.mockResolvedValue({ data: mockUploads });
    mockedApiClient.delete.mockResolvedValue({}); 
    renderComponent();

    const cardToDelete = await screen.findByTestId('file-card-upload1');
    expect(cardToDelete).toBeInTheDocument();

    const deleteButton = within(cardToDelete.closest('div.MuiCard-root')!).getByRole('button', { name: /delete/i });
    
    await user.click(deleteButton);

    expect(mockWindowConfirm).toHaveBeenCalledTimes(1);
    
    expect(mockedApiClient.delete).toHaveBeenCalledWith('/api/resource/upload1');

    await waitFor(() => {
      expect(screen.queryByText('Prova de IA')).not.toBeInTheDocument();
    });
  });

  test('should not delete an upload when user cancels', async () => {
    const user = userEvent.setup();
    mockWindowConfirm.mockReturnValue(false);
    mockedApiClient.get.mockResolvedValue({ data: mockUploads });
    renderComponent();

    const cardToDelete = await screen.findByTestId('file-card-upload1');
    const deleteButton = within(cardToDelete.closest('div.MuiCard-root')!).getByRole('button', { name: /delete/i });
    
    await user.click(deleteButton);

    expect(mockWindowConfirm).toHaveBeenCalledTimes(1);
    
    expect(mockedApiClient.delete).not.toHaveBeenCalled();

    expect(screen.getByText('Prova de IA')).toBeInTheDocument();
  });
});