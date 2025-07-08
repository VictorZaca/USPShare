import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useAuth } from '../context/AuthContext';
import { ColorModeContext } from '../App';
import apiClient from '../api/axios';
import Navbar from './Menu';

jest.mock('../api/axios');
jest.mock('../context/AuthContext');

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;
const mockedUseAuth = useAuth as jest.Mock;
const mockLogout = jest.fn();
const mockToggleColorMode = jest.fn();

const renderComponent = () => {
  render(
    <MemoryRouter>
      <ColorModeContext.Provider value={{ toggleColorMode: mockToggleColorMode }}>
        <ThemeProvider theme={createTheme()}>
          <Navbar />
        </ThemeProvider>
      </ColorModeContext.Provider>
    </MemoryRouter>
  );
};

describe('Navbar', () => {

  beforeEach(() => {
    mockedApiClient.get.mockClear();
    mockedApiClient.post.mockClear();
    mockLogout.mockClear();
    mockToggleColorMode.mockClear();
  });

  describe('when user is not authenticated', () => {
    beforeEach(() => {
      mockedUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
        logout: mockLogout,
      });
    });

    test('should display main navigation links and a login button', () => {
      renderComponent();

      expect(screen.getByRole('link', { name: /explorar/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /compartilhar/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /mais/i })).toBeInTheDocument();
      
      expect(screen.getByRole('link', { name: /entrar/i })).toBeInTheDocument();
      
      expect(screen.queryByRole('button', { name: /notifications/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /open user menu/i })).not.toBeInTheDocument();
    });
  });

  describe('when user is authenticated', () => {
    const mockUser = { name: 'Zoe', email: 'zoe@usp.br', initial: 'Z', avatar: '/avatar.png' };
    const mockNotifications = [
      { id: 'n1', resourceId: 'r1', commentId: 'c1', actorName: 'Victor', message: 'comentou no seu post.', isRead: false, createdAt: new Date().toISOString() },
      { id: 'n2', resourceId: 'r2', actorName: 'Enzo', message: 'curtiu seu material.', isRead: true, createdAt: new Date().toISOString() },
    ];

    beforeEach(() => {
      jest.useFakeTimers(); 
      
      mockedUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: mockUser,
        logout: mockLogout,
      });

      mockedApiClient.get.mockResolvedValue({ data: mockNotifications });
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('should display user avatar, notifications, and fetch notifications on mount', async () => {
      renderComponent();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/notifications');

      expect(await screen.findByRole('button', { name: mockUser.name })).toBeInTheDocument();
      
      const notificationsBadge = await screen.findByText('1');
      expect(notificationsBadge).toBeInTheDocument();

      expect(screen.queryByRole('link', { name: /entrar/i })).not.toBeInTheDocument();
    });

    test('should open user menu, display user info, and handle logout', async () => {
      const user = userEvent.setup();
      renderComponent();

      const avatarButton = await screen.findByRole('button', { name: mockUser.name });
      await user.click(avatarButton);

      expect(await screen.findByText(mockUser.name)).toBeInTheDocument();
      expect(screen.getByText(mockUser.email)).toBeInTheDocument();
      
      const logoutButton = screen.getByRole('menuitem', { name: /sair/i });
      await user.click(logoutButton);
      
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    test('should open notifications menu and handle notification click', async () => {
        const user = userEvent.setup();
        mockedApiClient.post.mockResolvedValue({}); 
        renderComponent();
        
        const notificationsButton = await screen.findByRole('button', { name: /notifications/i });
        await user.click(notificationsButton);

        const unreadNotification = await screen.findByText(/victor comentou no seu post/i);
        expect(unreadNotification).toBeInTheDocument();

        await user.click(unreadNotification);
        
        await waitFor(() => {
            expect(mockedApiClient.post).toHaveBeenCalledWith('/api/notifications/n1/read');
        });
    });

    test('should refetch notifications after interval', async () => {
        renderComponent();
        
        expect(await screen.findByRole('button', { name: mockUser.name })).toBeInTheDocument();
        expect(mockedApiClient.get).toHaveBeenCalledTimes(1);
        
        act(() => {
            jest.advanceTimersByTime(60000);
        });

        await waitFor(() => {
            expect(mockedApiClient.get).toHaveBeenCalledTimes(2);
        });
    });
  });
});