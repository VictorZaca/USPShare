import { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import apiClient from '../api/axios';
import { useAuth } from './AuthContext';

interface LikesContextType {
  likedResources: Set<string>;
  toggleLike: (resourceId: string) => Promise<{ likes: number; hasLiked: boolean }>;
  hasLiked: (resourceId: string) => boolean;
}

const LikesContext = createContext<LikesContextType | undefined>(undefined);

export const LikesProvider = ({ children }: { children: ReactNode }) => {
  const [likedResources, setLikedResources] = useState<Set<string>>(new Set());
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      setLikedResources(new Set());
      return;
    }

    const fetchMyLikes = async () => {
      try {
        console.log("Buscando likes iniciais do usuário...");
        const response = await apiClient.get<string[]>('/api/my-likes');
        
        setLikedResources(new Set(response.data || []));
        console.log("Likes sincronizados:", response.data);
      } catch (error) {
        console.error("Falha ao buscar os likes do usuário:", error);
        setLikedResources(new Set());
      }
    };

    fetchMyLikes();
  }, [isAuthenticated]); 

  const toggleLike = useCallback(async (resourceId: string) => {
    const currentlyLiked = likedResources.has(resourceId);
    const newLikedSet = new Set(likedResources);
    if (currentlyLiked) {
      newLikedSet.delete(resourceId);
    } else {
      newLikedSet.add(resourceId);
    }
    setLikedResources(newLikedSet);

    try {
      const response = await apiClient.post(`/api/resource/${resourceId}/like`);
      console.log("1. Resposta da API (/like de recurso):", response.data);
      return response.data; 
    } catch (error) {
      setLikedResources(likedResources);
      throw error;
    }
  }, [likedResources]);

  const hasLiked = (resourceId: string) => likedResources.has(resourceId);

  return (
    <LikesContext.Provider value={{ likedResources, toggleLike, hasLiked }}>
      {children}
    </LikesContext.Provider>
  );
};

export const useLikes = () => {
  const context = useContext(LikesContext);
  if (!context) throw new Error("useLikes must be used within a LikesProvider");
  return context;
};