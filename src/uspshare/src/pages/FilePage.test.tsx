import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import apiClient from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLikes } from '../context/LikesContext';
import FilePage from './FilePage';

jest.mock('../api/axios');
jest.mock('../context/AuthContext');
jest.mock('../context/LikesContext');

jest.mock('../components/CommentThread', () => ({
  CommentThread: ({ comment }: { comment: any }) => <div>Comentário: {comment.content}</div>,
}));
jest.mock('../components/share-modal', () => ({
  ShareModal: ({ open }: { open: boolean }) => (open ? <div>Modal de Compartilhamento</div> : null),
}));
jest.mock('react-pdf', () => ({
  Document: ({ children }: { children: any }) => <div>{children}</div>,
  Page: () => <div>Página do PDF</div>,
  pdfjs: { GlobalWorkerOptions: { workerSrc: '' } },
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;
const mockedUseAuth = useAuth as jest.Mock;
const mockedUseLikes = useLikes as jest.Mock;

Object.defineProperty(navigator, 'clipboard', {
  value: { writeText: jest.fn().mockResolvedValue(undefined) },
  writable: true,
});

const mockData = {
  file: {
    id: 'file1',
    title: 'Prova de Cálculo I',
    type: 'prova',
    tags: ['P1'],
    fileUrl: '/uploads/calculo_p1.pdf',
    likes: 42,
    fileName: 'calculo_p1.pdf',
    description: 'Primeira prova de Cálculo I de 2024.',
    course: 'Cálculo I',
    courseCode: 'MAT0111',
    semester: '2024-1',
    uploadDate: '2024-05-20T14:00:00Z',
    uploaderName: 'João da Silva',
  },
  comments: [{ id: 'c1', content: 'Muito útil, obrigado!', authorName: 'Maria', likes: 5 }],
  related: [{ id: 'file2', title: 'Lista 1 de Cálculo I', type: 'lista' }],
};

const renderComponent = (initialRoute: string) => {
  render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <ThemeProvider theme={createTheme()}>
        <Routes>
          <Route path="/file/:id" element={<FilePage />} />
          <Route path="/login" element={<div>Página de Login</div>} />
        </Routes>
      </ThemeProvider>
    </MemoryRouter>
  );
};

describe('FilePage', () => {

  beforeEach(() => {
    mockedApiClient.get.mockImplementation((url) => {
      if (url.includes('/comments')) return Promise.resolve({ data: mockData.comments });
      if (url.includes('/related')) return Promise.resolve({ data: mockData.related });
      return Promise.resolve({ data: mockData.file });
    });
    mockedApiClient.post.mockResolvedValue({ data: { id: 'c2', content: 'Novo comentário!', authorName: 'Eu' } });
    
    mockedUseAuth.mockReturnValue({ isAuthenticated: true });
    mockedUseLikes.mockReturnValue({ hasLiked: () => false, toggleLike: jest.fn().mockResolvedValue(undefined) });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should render loading state initially and then display file data', async () => {
    renderComponent('/file/file1');

    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    expect(await screen.findByRole('heading', { name: /prova de cálculo i/i })).toBeInTheDocument();
    expect(screen.getByText('P1')).toBeInTheDocument();
    expect(screen.getByText(/primeira prova de cálculo i/i)).toBeInTheDocument();
    expect(screen.getByText(/comentário: muito útil, obrigado!/i)).toBeInTheDocument();
    expect(screen.getByText(/lista 1 de cálculo i/i)).toBeInTheDocument();

    expect(mockedApiClient.get).toHaveBeenCalledTimes(3);
  });

  test('should show login alert and hide comment form for unauthenticated users', async () => {
    mockedUseAuth.mockReturnValue({ isAuthenticated: false });
    renderComponent('/file/file1');

    expect(await screen.findByText(/faça login/i)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/adicione um comentário/i)).not.toBeInTheDocument();
  });

  test('should allow authenticated users to post a comment', async () => {
    const user = userEvent.setup();
    renderComponent('/file/file1');
    
    const commentInput = await screen.findByPlaceholderText(/adicione um comentário/i);
    const submitButton = screen.getByRole('button', { name: /comentar/i });

    await user.type(commentInput, 'Ótimo material!');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockedApiClient.post).toHaveBeenCalledWith('/api/resource/file1/comments', {
        content: 'Ótimo material!',
        parentId: null,
      });
    });

    expect(await screen.findByText(/comentário: novo comentário!/i)).toBeInTheDocument();
  });

  test('should call toggleLike and refetch file data when like button is clicked', async () => {
    const user = userEvent.setup();
    const mockToggleLike = jest.fn().mockResolvedValue(undefined);
    mockedUseLikes.mockReturnValue({ hasLiked: () => false, toggleLike: mockToggleLike });
    
    renderComponent('/file/file1');
    
    const likeButton = await screen.findByRole('button', { name: /útil/i });
    expect(likeButton).toHaveTextContent('Útil (42)');

    mockedApiClient.get.mockClear();
    
    await user.click(likeButton);

    expect(mockToggleLike).toHaveBeenCalledWith('file1');

    await waitFor(() => {
        expect(mockedApiClient.get).toHaveBeenCalledWith('/api/resource/file1');
    });
  });

  test('should copy link to clipboard when native share is not available', async () => {
    const user = userEvent.setup();
    Object.defineProperty(navigator, 'share', { value: undefined, writable: true });
    
    renderComponent('/file/file1');

    const shareButton = await screen.findByRole('button', { name: /compartilhar/i });
    await user.click(shareButton);

    const shareLinkButton = await screen.findByRole('menuitem', { name: /compartilhar \(link\/nativo\)/i });
    await user.click(shareLinkButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(window.location.href);
    
    expect(await screen.findByText(/link copiado/i)).toBeInTheDocument();
  });
});