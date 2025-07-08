import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import apiClient from '../api/axios';
import UploadPage from './UploadPage';

jest.mock('../api/axios');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

const renderComponent = () => {
  render(
    <MemoryRouter initialEntries={['/upload']}>
      <ThemeProvider theme={createTheme()}>
        <Routes>
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/file/:id" element={<div>Página do Arquivo Criado</div>} />
        </Routes>
      </ThemeProvider>
    </MemoryRouter>
  );
};

const mockOptions = {
  courses: [{ code: 'MAC0110', name: 'Introdução à Computação' }],
  professors: [{ id: 'p1', name: 'Prof. Teste' }],
  tags: [{ id: 't1', name: 'P1' }],
};

describe('UploadPage', () => {
  beforeEach(() => {
    mockedApiClient.get.mockImplementation((url) => {
      if (url.endsWith('/courses')) return Promise.resolve({ data: mockOptions.courses });
      if (url.endsWith('/professors')) return Promise.resolve({ data: mockOptions.professors });
      if (url.endsWith('/tags')) return Promise.resolve({ data: mockOptions.tags });
      return Promise.resolve({ data: [] });
    });
    mockedApiClient.post.mockClear();
  });

  test('should render the form and fetch options for autocomplete fields', async () => {
    renderComponent();
    
    expect(screen.getByRole('heading', { name: /compartilhar material/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/título do material/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/data/courses');
      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/data/professors');
      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/data/tags');
    });
  });

  test('should show an error if required fields are missing on submit', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const submitButton = screen.getByRole('button', { name: /enviar material/i });
    await user.click(submitButton);

    expect(await screen.findByRole('alert')).toHaveTextContent('Os campos com * são obrigatórios.');
  });
  
  test('should allow full form completion, submit data as FormData, and redirect on success', async () => {
    const user = userEvent.setup();
    mockedApiClient.post.mockResolvedValue({ data: { id: 'new-file-123' } });

    renderComponent();

    await waitFor(() => expect(mockedApiClient.get).toHaveBeenCalledTimes(3));

    const fakeFile = new File(['conteudo'], 'prova.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByLabelText(/arraste e solte/i).querySelector('input')!;
    await user.upload(fileInput, fakeFile);

    expect(await screen.findByText('prova.pdf')).toBeInTheDocument();

    await user.type(screen.getByLabelText(/título do material/i), 'Minha Prova de Teste');
    
    await user.click(screen.getByLabelText('Disciplina*'));
    await user.click(await screen.findByRole('option', { name: /introdução à computação/i }));

    await user.click(screen.getByLabelText('Tipo de Material'));
    await user.click(await screen.findByRole('option', { name: /prova/i }));

    const submitButton = screen.getByRole('button', { name: /enviar material/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockedApiClient.post).toHaveBeenCalledWith('/api/upload', expect.any(FormData));
    });
    
    const formData = mockedApiClient.post.mock.calls[0][1] as FormData;
    expect(formData.get('title')).toBe('Minha Prova de Teste');
    expect(formData.get('file')).toBe(fakeFile);

    expect(await screen.findByText(/página do arquivo criado/i)).toBeInTheDocument();
  });
});