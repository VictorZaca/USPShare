import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../api/axios'; // Importa nossa instância do Axios

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  login: (email: any, password: any) => Promise<any>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState(null);
  
  // Tenta carregar o usuário se um token existir no localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
        // No futuro, você faria uma chamada a um endpoint /api/profile
        // para validar o token e buscar dados atualizados do usuário.
        // Por agora, vamos assumir que o token é válido se existir.
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }
  }, []);

  const login = async (email: any, password: any) => {
    try {
      const response = await apiClient.post('/api/login', { email, password });
      
      const { token, user: userData } = response.data;
      
      // Armazenar no localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      
      return userData; // Retorna os dados para a LoginPage se necessário
    } catch (error) {
      // Propaga o erro para ser tratado na LoginPage
      const err = error as any;
      throw new Error(err.response?.data?.error || 'Erro de conexão');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};