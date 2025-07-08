import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import apiClient from '../api/axios'; 
import AdminPage from './AdminPage';
import { type ReactNode } from 'react';

jest.mock('../api/axios');

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

const mockWindowConfirm = jest.spyOn(window, 'confirm').mockImplementation(() => true);


const MockedThemeProvider = ({ children }: { children: ReactNode }) => {
  const theme = createTheme();
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

const mockData = {
  courses: [{ id: 'c1', name: 'Cálculo 1', code: 'MAT001' }],
  professors: [{ id: 'p1', name: 'Prof. Xavier', avatarUrl: '/avatar.png' }],
  tags: [{ id: 't1', name: 'P1' }],
};

describe('AdminPage', () => {

  beforeEach(() => {
    mockedApiClient.get.mockClear();
    mockedApiClient.post.mockClear();
    mockedApiClient.delete.mockClear();
    mockWindowConfirm.mockClear();
  });

  test('should show loading spinner initially, then render data', async () => {
    mockedApiClient.get.mockImplementation((url) => {
      if (url.includes('tags')) return Promise.resolve({ data: mockData.tags });
      if (url.includes('courses')) return Promise.resolve({ data: mockData.courses });
      if (url.includes('professors')) return Promise.resolve({ data: mockData.professors });
      return Promise.resolve({ data: [] });
    });

    render(
      <MockedThemeProvider>
        <AdminPage />
      </MockedThemeProvider>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    const courseName = await screen.findByText('Cálculo 1');
    expect(courseName).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();

    expect(mockedApiClient.get).toHaveBeenCalledTimes(3);
  });

  test('should allow adding a new tag', async () => {
    const user = userEvent.setup();
    mockedApiClient.get.mockResolvedValue({ data: [] });
    mockedApiClient.post.mockResolvedValue({ data: { id: 't2', name: 'Nova Tag' } });

    render(
      <MockedThemeProvider>
        <AdminPage />
      </MockedThemeProvider>
    );

    const tagsTab = await screen.findByRole('tab', { name: /tags/i });
    await user.click(tagsTab);

    const input = screen.getByLabelText('Nome da Tag');
    const addButton = screen.getByRole('button', { name: /adicionar/i });

    await user.type(input, 'Nova Tag de Teste');
    await user.click(addButton);

    await waitFor(() => {
      expect(mockedApiClient.post).toHaveBeenCalledWith('/api/admin/tags', {
        name: 'Nova Tag de Teste',
        code: '', 
      });
    });

    await waitFor(() => {
      expect(mockedApiClient.get).toHaveBeenCalledTimes(6);
    });
  });

  test('should allow deleting a course after confirmation', async () => {
    const user = userEvent.setup();
    mockedApiClient.get.mockImplementation((url) => {
        if (url.includes('courses')) return Promise.resolve({ data: mockData.courses });
        return Promise.resolve({ data: [] });
    });
    mockedApiClient.delete.mockResolvedValue({});

    render(
      <MockedThemeProvider>
        <AdminPage />
      </MockedThemeProvider>
    );

    const deleteButton = await screen.findByRole('button', { name: /delete/i });
    
    await user.click(deleteButton);
    
    expect(mockWindowConfirm).toHaveBeenCalledWith('Tem certeza que quer deletar este item?');
    
    await waitFor(() => {
      expect(mockedApiClient.delete).toHaveBeenCalledWith('/api/admin/courses/c1');
    });
  });

  test('should NOT delete a course if confirmation is cancelled', async () => {
    const user = userEvent.setup();
    mockWindowConfirm.mockReturnValueOnce(false);

    mockedApiClient.get.mockResolvedValueOnce({ data: mockData.courses });

    render(
      <MockedThemeProvider>
        <AdminPage />
      </MockedThemeProvider>
    );

    const deleteButton = await screen.findByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    expect(mockedApiClient.delete).not.toHaveBeenCalled();
  });
});