import React, { useState, useEffect, useRef, FC, SyntheticEvent } from 'react';
import { Paper, Stack, Avatar, Box, Typography, Button, TextField, Collapse } from '@mui/material';
import { useAuth } from '../context/AuthContext';

// A interface permanece a mesma, ela está correta.
interface Comment {
  id: string;
  authorName: string;
  createdAt: string;
  content: string;
  replies?: Comment[];
}

interface CommentThreadProps {
  comment: Comment;
  onReplySubmit: (content: string, parentId: string) => void;
  highlightedId: string | null;
}

export const CommentThread: FC<CommentThreadProps> = ({ comment, onReplySubmit, highlightedId }) => {
  const [showReply, setShowReply] = useState<boolean>(false);
  const [replyContent, setReplyContent] = useState<string>("");
  const { isAuthenticated } = useAuth() || { isAuthenticated: false };

  const commentRef = useRef<HTMLDivElement>(null);
  const [isHighlighted, setIsHighlighted] = useState<boolean>(false);

  // A lógica de destaque e scroll permanece a mesma, ela está correta.
  useEffect(() => {
    const isTargetComment = comment.id === highlightedId;
    if (isTargetComment) {
      const scrollTimer = setTimeout(() => {
        commentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);

      setIsHighlighted(true);
      const highlightTimer = setTimeout(() => setIsHighlighted(false), 2500);

      return () => {
        clearTimeout(scrollTimer);
        clearTimeout(highlightTimer);
      };
    }
  }, [highlightedId, comment.id]);


  const handleReply = (e: SyntheticEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    
    onReplySubmit(replyContent, comment.id);
    
    setReplyContent("");
    setShowReply(false);
  };

  // --- LOG DE DEBUG PARA ESTE COMPONENTE ---
  // Este log nos dirá exatamente o que cada instância do componente está recebendo.
  // console.log(`Renderizando CommentThread para: ${comment.authorName} (${comment.id}). Respostas recebidas:`, comment.replies?.length || 0);


  return (
    <Box ref={commentRef} id={comment.id}>
      <Paper 
        variant="outlined" 
        sx={{ 
          p: 2,
          transition: 'background-color 0.5s ease-in-out',
          backgroundColor: isHighlighted ? 'action.focus' : 'transparent',
        }}
      >
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Avatar sx={{ width: 32, height: 32 }} />
          <Box flexGrow={1}>
            <Typography component="span" variant="subtitle2" sx={{ mr: 1 }}>{comment.authorName}</Typography>
            <Typography component="span" variant="caption" color="text.secondary">
              {new Date(comment.createdAt).toLocaleString("pt-BR")}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1.5 }}>{comment.content}</Typography>
          </Box>
        </Stack>

        {isAuthenticated && (
          <Box textAlign="right" sx={{ mt: -1 }}>
             <Button size="small" onClick={() => setShowReply(!showReply)}>
              {showReply ? 'Cancelar' : 'Responder'}
            </Button>
          </Box>
        )}

        <Collapse in={showReply} timeout="auto" unmountOnExit>
          <Box component="form" onSubmit={handleReply} mt={1}>
            <TextField fullWidth size="small" value={replyContent} onChange={(e) => setReplyContent(e.target.value)} placeholder={`Respondendo a ${comment.authorName}...`} />
            <Box textAlign="right">
              <Button type="submit" size="small" sx={{ mt: 1 }} disabled={!replyContent.trim()}>Enviar Resposta</Button>
            </Box>
          </Box>
        </Collapse>
      </Paper>

      {/* A Lógica de Recursão - Verifique se está exatamente assim */}
      {comment.replies && comment.replies.length > 0 && (
        <Box sx={{ pt: 2, pl: { xs: 2, sm: 4 }, borderLeft: '1px solid', borderColor: 'divider' }}>
          <Stack spacing={2}>
            {comment.replies.map((reply) => (
              <CommentThread
                key={reply.id}
                comment={reply}
                onReplySubmit={onReplySubmit}
                highlightedId={highlightedId}
              />
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
};