import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import apiClient from '../api/axios';

// --- MELHORIA 1: Tipagem Forte para o Usuário ---
// Esta interface deve corresponder aos dados que sua API retorna para um usuário
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
  loading: boolean; // Novo estado para sabermos quando a verificação inicial está acontecendo
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Começa como true

  const refreshUser = useCallback(async () => {
    try {
      const response = await apiClient.get<User>('/api/profile');
      const profileData = response.data;
      
      // Lógica de cache-busting para o avatar
      if (profileData.avatar) {
        profileData.avatar = `${profileData.avatar}?v=${new Date().getTime()}`;
      } else {
        // Fallback para o Pravatar se não houver avatar
        profileData.avatar = `https://i.pravatar.cc/150?u=${profileData.email}`;
      }
      
      setUser(profileData);
    } catch (error) {
      console.error("Falha ao atualizar dados do usuário, fazendo logout.", error);
      logout(); // Se não conseguir buscar o perfil, o token é inválido
    }
  }, []);


  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        await refreshUser(); // Usa a nova função para buscar os dados iniciais
      }
      setLoading(false);
    };
    validateToken();
  }, [refreshUser]);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      // 1. Autentica e pega o token
      const response = await apiClient.post('/api/login', { email, password });
      const { token } = response.data;

      // 2. Configura o token para todas as futuras requisições
      localStorage.setItem('token', token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // 3. AGORA, A MÁGICA: Em vez de usar os dados básicos da resposta do login,
      // nós imediatamente chamamos refreshUser() para buscar os dados completos.
      await refreshUser();
      
      // A função refreshUser já faz o setUser, então a Navbar e o resto do app
      // serão atualizados com os dados completos, incluindo a avatarUrl.

      // Retornamos os dados básicos apenas para a LoginPage, se ela precisar.
      return response.data.user;

    } catch (error) {
      // Limpa qualquer token antigo se o login falhar
      localStorage.removeItem('token');
      delete apiClient.defaults.headers.common['Authorization'];
      
      const err = error as any;
      throw new Error(err.response?.data?.error || 'Erro de conexão');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete apiClient.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading, // Exporta o estado de loading
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook customizado para uso, agora com checagem de contexto
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};