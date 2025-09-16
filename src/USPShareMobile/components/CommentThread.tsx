import React, { useState, useEffect, useRef, FC, SyntheticEvent } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, Alert, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useCommentLikes } from '../context/CommentLikesContext';

// --- Interfaces de Tipos ---
interface Comment {
  id: string;
  authorName: string;
  createdAt: string;
  content: string;
  replies?: Comment[];
  authorAvatar?: string;
  likes: number;
}

interface CommentThreadProps {
  comment: Comment;
  onReplySubmit: (content: string, parentId: string) => void;
  highlightedId: string | null;
}

// --- Componente Principal ---
export const CommentThread: FC<CommentThreadProps> = ({ comment, onReplySubmit, highlightedId }) => {
  const [showReply, setShowReply] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const { isAuthenticated } = useAuth();
  const { hasLikedComment, toggleCommentLike } = useCommentLikes();

  const [localLikeCount, setLocalLikeCount] = useState(comment.likes || 0);
  const isLikedByUser = hasLikedComment(comment.id);

  // Lógica para a animação de destaque
  const highlightAnim = useRef(new Animated.Value(0)).current;
  const isTargetComment = comment.id === highlightedId;

  useEffect(() => {
    if (isTargetComment) {
      // Inicia a animação: vai de 0 a 1 em 500ms
      Animated.timing(highlightAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false, // backgroundColor não é suportado pelo driver nativo
      }).start(() => {
        // Após a animação, volta de 1 a 0 em 1500ms
        Animated.timing(highlightAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: false,
        }).start();
      });
    }
  }, [isTargetComment, highlightAnim]);

  // Interpola o valor da animação (0 a 1) em uma cor
  const animatedBackgroundColor = highlightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#ffffff', '#e3f2fd'], // De branco para um azul claro (cor de foco)
  });

  const handleLikeClick = async () => {
    try {
      const { likes } = await toggleCommentLike(comment.id);
      setLocalLikeCount(likes);
    } catch (err) {
      Alert.alert("Erro", "Não foi possível registrar a curtida.");
    }
  };

  const handleReplySubmit = () => {
    if (!replyContent.trim()) return;
    onReplySubmit(replyContent, comment.id);
    setReplyContent("");
    setShowReply(false);
  };

  const backendUrl = 'http://192.168.15.14:8080'; // Lembre-se de usar seu IP local

  return (
    <View>
      <Animated.View style={[styles.commentContainer, { backgroundColor: animatedBackgroundColor }]}>
        <View style={styles.header}>
          <Image
            source={{ uri: comment.authorAvatar ? `${backendUrl}${comment.authorAvatar}` : undefined }}
            style={styles.avatar}
          />
          <View style={styles.headerText}>
            <Text style={styles.authorName}>{comment.authorName}</Text>
            <Text style={styles.dateText}>{new Date(comment.createdAt).toLocaleString("pt-BR")}</Text>
          </View>
        </View>

        <Text style={styles.contentText}>{comment.content}</Text>

        {isAuthenticated && (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleLikeClick}>
              <Ionicons name={isLikedByUser ? "heart" : "heart-outline"} size={16} color={isLikedByUser ? '#d32f2f' : '#555'} />
              <Text style={styles.actionText}>{localLikeCount > 0 ? localLikeCount : ''}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => setShowReply(!showReply)}>
              <Ionicons name="chatbubble-outline" size={16} color="#555" />
              <Text style={styles.actionText}>{showReply ? 'Cancelar' : 'Responder'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {showReply && (
          <View style={styles.replyForm}>
            <TextInput
              style={styles.replyInput}
              value={replyContent}
              onChangeText={setReplyContent}
              placeholder={`Respondendo a ${comment.authorName}...`}
              multiline
            />
            <TouchableOpacity 
              style={[styles.replyButton, !replyContent.trim() && styles.replyButtonDisabled]} 
              onPress={handleReplySubmit}
              disabled={!replyContent.trim()}
            >
              <Text style={styles.replyButtonText}>Enviar</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>

      {/* A Lógica de Recursão, agora para o ambiente nativo */}
      {comment.replies && comment.replies.length > 0 && (
        <View style={styles.repliesContainer}>
          {comment.replies.map((reply) => (
            <CommentThread
              key={reply.id}
              comment={reply}
              onReplySubmit={onReplySubmit}
              highlightedId={highlightedId}
            />
          ))}
        </View>
      )}
    </View>
  );
};

// --- ESTILIZAÇÃO NATIVA ---
const styles = StyleSheet.create({
  commentContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
    backgroundColor: '#eee',
  },
  headerText: {
    flex: 1,
  },
  authorName: {
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 12,
    color: '#888',
  },
  contentText: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    marginLeft: 4,
    color: '#555',
    fontSize: 12,
    fontWeight: '600',
  },
  replyForm: {
    marginTop: 12,
  },
  replyInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 10,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  replyButton: {
    backgroundColor: '#1976d2',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  replyButtonDisabled: {
    backgroundColor: '#ccc',
  },
  replyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  repliesContainer: {
    marginTop: 12,
    marginLeft: 24,
    paddingLeft: 12,
    borderLeftWidth: 1,
    borderLeftColor: '#eee',
  },
});