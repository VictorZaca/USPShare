"use client"

import { useParams, Link as RouterLink, useSearchParams } from "react-router-dom"
import { useEffect, useState } from "react"
import {
  Box,
  Typography,
  Container,
  Grid,
  Paper,

  Chip,
  TextField,
  Button,
  Divider,
  Avatar,
  Alert,
  Link as MuiLink,
  CircularProgress,
  Stack,
} from "@mui/material"
import {
  ThumbUp as ThumbUpIcon,
  FileOpen as FileOpenIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  InsertDriveFile as InsertDriveFileIcon,
  Person as PersonIcon,
  CalendarMonth as CalendarMonthIcon,
  ChatBubbleOutline as CommentIcon,
} from "@mui/icons-material"
import apiClient from "../api/axios"
import { useAuth } from "../context/AuthContext"; 
import { CommentThread } from '../components/CommentThread'; // Importe o novo componente
import { LoadingButton } from "@mui/lab"


interface FileData {
  title: string;
  type: string;
  tags?: string[];
  fileUrl: string;
  likes: number;
  fileName: string;
  description?: string;
  course: string;
  courseCode: string;
  professor?: string;
  semester: string;
  uploadDate: string;
  uploaderName?: string;
}

interface CommentData {
  id: string;
  content: string;
  createdAt: string;
  authorName: string;
  authorAvatar?: string;
  replies?: CommentData[]; 
}


export default function FilePage() {
  const { id } = useParams()
  const auth = useAuth();
  const isAuthenticated = auth ? auth.isAuthenticated : false;
  
  const [comment, setComment] = useState("")
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)

  const [file, setFile] = useState<FileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [comments, setComments] = useState<CommentData[]>([]);

  const [isPostingComment, setIsPostingComment] = useState<boolean>(false);

  const [searchParams] = useSearchParams();
  const highlightedCommentId = searchParams.get("highlight");


  useEffect(() => {
    if (!id) {
      setError("ID do arquivo não encontrado na URL.");
      setLoading(false);
      return;
    }

    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [fileResponse, commentsResponse] = await Promise.all([
          apiClient.get<FileData>(`/api/resource/${id}`),
          apiClient.get<CommentData[]>(`/api/resource/${id}/comments`)
        ]);
        console.log("DADOS DOS COMENTÁRIOS RECEBIDOS:", commentsResponse.data); 
        setFile(fileResponse.data);
        setComments(commentsResponse.data || []);
      } catch (err) {
        setError("Não foi possível carregar os dados do material.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [id]); // Roda sempre que o ID na URL mudar


  const handleLike = () => {
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1))
    setLiked(!liked)
  }

  const addReplyToTree = (nodes: CommentData[], parentId: string, newReply: CommentData): CommentData[] => {
    return nodes.map(node => {
      // Caso base: encontrou o nó pai
      if (node.id === parentId) {
        // Retorna uma cópia do nó com a nova resposta adicionada
        const updatedReplies = [...(node.replies || []), newReply];
        return { ...node, replies: updatedReplies };
      }
      // Passo recursivo: se o nó tem respostas, procura nelas
      if (node.replies && node.replies.length > 0) {
        return { ...node, replies: addReplyToTree(node.replies, parentId, newReply) };
      }
      // Se não é o nó e não tem filhos, retorna o nó como está
      return node;
    });
  };

  // --- SUBSTITUA COMPLETAMENTE SUA FUNÇÃO handleComment POR ESTA ---
  const handleComment = async (content: string, parentId: string | null = null) => {
    if (!content.trim()) return;
    
    setIsPostingComment(true);

    try {
      // 1. Envia o comentário e recebe de volta o objeto completo do novo comentário
      const response = await apiClient.post(`/api/resource/${id}/comments`, { content, parentId });
      const newComment = response.data;

      // 2. Atualiza o estado local de forma "cirúrgica" e imutável
      if (parentId) {
        // É uma resposta: usa a função recursiva para encontrar o pai e adicionar o filho
        setComments(prevComments => addReplyToTree(prevComments, parentId, newComment));
      } else {
        // É um comentário principal: simplesmente adiciona no topo da lista
        setComments(prevComments => [newComment, ...prevComments]);
        setComment(""); // Limpa o campo de texto principal
      }

    } catch (err) {
      console.error("Failed to post comment:", err);
      setError("Não foi possível postar o comentário."); // Feedback para o usuário
    } finally {
      setIsPostingComment(false);
    }
  };


  if (loading) {
    return <Container sx={{ py: 8, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Container>;
  }

  if (error || !file) {
    return <Container sx={{ py: 8 }}><Alert severity="error">{error || "Material não encontrado."}</Alert></Container>;
  }

  const backendUrl = 'http://localhost:8080';


  return (
    <Container sx={{ py: 8 }}>
      <Grid container spacing={6}>
        {/* ======================================= */}
        {/* Coluna Principal: Detalhes do Arquivo */}
        {/* ======================================= */}
        <Grid size={{ xs: 12, md: 8 }}>
          {/* Título e Tags dinâmicos */}
          <Typography variant="h4" gutterBottom>{file.title}</Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
            <Chip label={file.type} variant="outlined" />
            {(file.tags || []).map((tag) => (
              <Chip key={tag} label={tag} color="primary" variant="outlined" />
            ))}
          </Box>

          {/* Placeholder de Preview com botão funcional */}
          <Paper variant="outlined" sx={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Box textAlign="center">
              <InsertDriveFileIcon sx={{ fontSize: 60, color: "gray" }} />
              <Typography variant="body2" color="textSecondary">
                Pré-visualização do arquivo
              </Typography>
              <Button 
                component="a" 
                href={backendUrl + file.fileUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                variant="outlined" 
                sx={{ mt: 2 }} 
                startIcon={<FileOpenIcon />}
              >
                Abrir Visualização
              </Button>
            </Box>
          </Paper>

          {/* Botões de Ação */}
          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <Button variant="outlined" onClick={handleLike} startIcon={<ThumbUpIcon color={liked ? "primary" : "inherit"} />}>
              Útil ({file.likes + likeCount})
            </Button>
            <Button 
              component="a" 
              href={backendUrl + file.fileUrl} 
              download={file.fileName} // Sugere o nome original do arquivo para download
              variant="outlined" 
              startIcon={<DownloadIcon />}
            >
              Download
            </Button>
            <Button variant="outlined" startIcon={<ShareIcon />}>Compartilhar</Button>
          </Box>

          {/* Descrição dinâmica */}
          <Box mt={4}>
            <Typography variant="h6">Descrição</Typography>
            <Typography color="text.secondary" mt={1}>{file.description || "Sem descrição disponível."}</Typography>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Seção de Comentários (sua lógica original mantida) */}
          <Box>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h6">Comentários</Typography>
              <Chip label={comments.length} icon={<CommentIcon fontSize="small" />} />
            </Box>

            {isAuthenticated ? (
              <Box component="form" onSubmit={(e) => { 
                e.preventDefault(); 
                // Chamamos handleComment com 'null' para indicar que é um comentário principal
                handleComment(comment, null); 
              }}  mt={2}>
                <TextField fullWidth multiline minRows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Adicione um comentário..." disabled={isPostingComment} />
                <Box display="flex" justifyContent="flex-end" mt={1}>
                  <LoadingButton type="submit" disabled={!comment.trim()} loading={isPostingComment}>
                    <span>Comentar</span>
                  </LoadingButton>
                </Box>
              </Box>
            ) : (
              <Alert severity="info" sx={{ mt: 2 }}>
                <MuiLink component={RouterLink} to="/login">Faça login</MuiLink> para deixar um comentário.
              </Alert>
            )}

            <Stack mt={3} spacing={2}>
              {comments.length > 0 ? (
                // O componente CommentThread agora recebe a função handleComment atualizada
                comments.map(c => <CommentThread key={c.id} comment={c} onReplySubmit={handleComment} highlightedId={highlightedCommentId} />)
              ) : (
                <Typography color="text.secondary" sx={{ textAlign: 'center', p: 2 }}>Seja o primeiro a comentar!</Typography>
              )}
            </Stack>
          </Box>


        </Grid>

        {/* ======================================= */}
        {/* Sidebar: Informações Adicionais       */}
        {/* ======================================= */}
        <Grid size={{ xs: 12, md: 4}}>
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography fontWeight="bold">Informações do Material</Typography>
            <Box mt={2} display="flex" flexDirection="column" gap={2}>
              {/* Todos os campos preenchidos com dados do 'file' */}
              <Box display="flex" gap={1} alignItems="center">
                <InsertDriveFileIcon fontSize="small" />
                <Typography variant="body2">{file.course} ({file.courseCode})</Typography>
              </Box>
              <Box display="flex" gap={1} alignItems="center">
                <PersonIcon fontSize="small" />
                <Typography variant="body2">{file.professor || "Não informado"}</Typography>
              </Box>
              <Box display="flex" gap={1} alignItems="center">
                <CalendarMonthIcon fontSize="small" />
                <Typography variant="body2">{file.semester}</Typography>
              </Box>
              <Box display="flex" gap={1} alignItems="center">
                <Avatar sx={{ width: 24, height: 24 }} />
                <Typography variant="body2">{file.uploaderName || "Anônimo"}</Typography>
              </Box>
              <Box display="flex" gap={1} alignItems="center">
                <CalendarMonthIcon fontSize="small" />
                <Typography variant="body2">Enviado em: {new Date(file.uploadDate).toLocaleDateString("pt-BR")}</Typography>
              </Box>
            </Box>
          </Paper>

          {/* O restante da sua sidebar original, sem alterações */}
          <Alert severity="info">
            Encontrou algum problema com este material?{' '}
            <MuiLink component={RouterLink} to="/report" underline="hover">Reportar</MuiLink>
          </Alert>

          <Paper variant="outlined" sx={{ p: 2, mt: 3 }}>
            <Typography fontWeight="bold">Materiais Relacionados</Typography>
            <Box mt={2}>
              <Typography variant="caption" color="text.secondary">A funcionalidade de materiais relacionados será implementada em breve.</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
