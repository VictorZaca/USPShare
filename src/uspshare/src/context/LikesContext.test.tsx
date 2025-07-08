import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext'; 
import { LikesProvider, useLikes } from './LikesContext';
import apiClient from '../api/axios';
import { ReactNode } from 'react';

jest.mock('../api/axios');
jest.mock('./AuthContext', () => ({
  ...jest.requireActual('./AuthContext'), 
  useAuth: jest.fn(), 
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;
const mockedUseAuth = useAuth as jest.Mock;

const createWrapper = () => {
  const AllTheProviders = ({ children }: { children: ReactNode }) => (
    <AuthProvider>
      <LikesProvider>{children}</LikesProvider>
    </AuthProvider>
  );
  return AllTheProviders;
};

describe('useLikes Hook & LikesProvider', () => {

  beforeEach(() => {
    mockedApiClient.get.mockClear();
    mockedApiClient.post.mockClear();
    mockedUseAuth.mockClear();
  });

  test('should throw an error if used outside of a LikesProvider', () => {
    const originalError = console.error;
    console.error = jest.fn();
    
    expect(() => renderHook(() => useLikes())).toThrow('useLikes must be used within a LikesProvider');
    
    console.error = originalError;
  });

  describe('when user is not authenticated', () => {
    test('should not fetch likes and have an empty set of liked resources', () => {
      mockedUseAuth.mockReturnValue({ isAuthenticated: false });
      const { result } = renderHook(() => useLikes(), { wrapper: createWrapper() });

      expect(result.current.likedResources.size).toBe(0);
      expect(mockedApiClient.get).not.toHaveBeenCalled();
    });
  });

  describe('when user is authenticated', () => {
    beforeEach(() => {
      mockedUseAuth.mockReturnValue({ isAuthenticated: true });
    });

    test('should fetch and set initial liked resources', async () => {
      const initialLikes = ['resource1', 'resource3'];
      mockedApiClient.get.mockResolvedValue({ data: initialLikes });

      const { result } = renderHook(() => useLikes(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.hasLiked('resource1')).toBe(true);
      });
      
      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/my-likes');
      expect(result.current.hasLiked('resource2')).toBe(false);
      expect(result.current.likedResources.size).toBe(2);
    });

    test('should optimistically add a like and call the API', async () => {
      mockedApiClient.get.mockResolvedValue({ data: [] });
      mockedApiClient.post.mockResolvedValue({ data: { likes: 1, hasLiked: true } });

      const { result } = renderHook(() => useLikes(), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.likedResources.size).toBe(0));

      act(() => {
        result.current.toggleLike('newResource');
      });

      expect(result.current.hasLiked('newResource')).toBe(true);

      expect(mockedApiClient.post).toHaveBeenCalledWith('/api/resource/newResource/like');
    });

    test('should revert the state if the API call fails', async () => {
      mockedApiClient.get.mockResolvedValue({ data: [] }); 
      mockedApiClient.post.mockRejectedValue(new Error('API Error')); 

      const { result } = renderHook(() => useLikes(), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.likedResources.size).toBe(0));

      await act(async () => {
        await expect(result.current.toggleLike('failedResource')).rejects.toThrow('API Error');
      });
      
      expect(result.current.hasLiked('failedResource')).toBe(false);
    });
  });
});