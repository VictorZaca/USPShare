import { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import apiClient from '../api/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  name: string;
  email: string;
  initial: string;
  avatarUrl?: string;
  avatar?: string;
  course?: string;
  faculty?: string;
  yearJoined?: string;
  bio?: string;
  badges?: string[];
  stats?: {
    uploads: number;
    likes: number;
    comments: number;
    reputation: number;
  };
  role?: 'user' | 'admin'; 
}


interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean; 
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    try {
      const response = await apiClient.get<User>('/api/profile');
      const profileData = response.data;
      
      if (profileData.avatar) {
        profileData.avatar = `${profileData.avatar}?v=${new Date().getTime()}`;
      } else {
        profileData.avatar = `https://i.pravatar.cc/150?u=${profileData.email}`;
      }
      
      setUser(profileData);
    } catch (error) {
      console.error("Falha ao atualizar dados do usuário, fazendo logout.", error);
      logout(); 
    }
  }, []);


  useEffect(() => {
    const validateToken = async () => {
      const token = AsyncStorage.getItem('token');
      if (token) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        await refreshUser(); 
      }
      setLoading(false);
    };
    validateToken();
  }, [refreshUser]);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const response = await apiClient.post('/api/login', { email, password });
      const { token } = response.data;

      AsyncStorage.setItem('token', token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      await refreshUser();
      
      return response.data.user;

    } catch (error) {
      AsyncStorage.removeItem('token');
      delete apiClient.defaults.headers.common['Authorization'];
      
      const err = error as any;
      throw new Error(err.response?.data?.error || 'Erro de conexão');
    }
  };

  const logout = () => {
    setUser(null);
    AsyncStorage.removeItem('token');
    AsyncStorage.removeItem('user');
    delete apiClient.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading, 
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};