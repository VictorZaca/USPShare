import { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import apiClient from '../api/axios';
import { useAuth } from './AuthContext';

interface CommentLikesContextType {
  likedComments: Set<string>;
  toggleCommentLike: (commentId: string) => Promise<{ likes: number; hasLiked: boolean }>;
  hasLikedComment: (commentId: string) => boolean;
}

const CommentLikesContext = createContext<CommentLikesContextType | undefined>(undefined);

export const CommentLikesProvider = ({ children }: { children: ReactNode }) => {
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      apiClient.get<string[]>('/api/my-comment-likes')
        .then(res => setLikedComments(new Set(res.data || [])))
        .catch(err => console.error("Failed to fetch comment likes:", err));
    } else {
      setLikedComments(new Set());
    }
  }, [isAuthenticated]);

  const toggleCommentLike = useCallback(async (commentId: string) => {
    const newLikedSet = new Set(likedComments);
    if (newLikedSet.has(commentId)) {
      newLikedSet.delete(commentId);
    } else {
      newLikedSet.add(commentId);
    }
    setLikedComments(newLikedSet);

    try {
      const response = await apiClient.post(`/api/comment/${commentId}/like`);
      console.log("1. Resposta da API (/commentlike de recurso):", response.data);
      return { likes: response.data.likes, hasLiked: newLikedSet.has(commentId) };
    } catch (error) {
      setLikedComments(likedComments); 
      throw error;
    }
  }, [likedComments]);

  const hasLikedComment = (commentId: string) => likedComments.has(commentId);

  return (
    <CommentLikesContext.Provider value={{ likedComments, toggleCommentLike, hasLikedComment }}>
      {children}
    </CommentLikesContext.Provider>
  );
};

export const useCommentLikes = () => {
  const context = useContext(CommentLikesContext);
  if (!context) throw new Error("useCommentLikes must be used within a CommentLikesProvider");
  return context;
};