"use client"

import { useParams, Link as RouterLink, useSearchParams } from "react-router-dom"
import React, { useEffect, useState } from "react"
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
  Dialog,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
} from "@mui/material"
import {
  ThumbUp as ThumbUpIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  InsertDriveFile as InsertDriveFileIcon,
  Person as PersonIcon,
  CalendarMonth as CalendarMonthIcon,
  ChatBubbleOutline as CommentIcon,
  PersonAdd as PersonAddIcon,
} from "@mui/icons-material"
import apiClient from "../api/axios"
import { useAuth } from "../context/AuthContext"; 
import { CommentThread } from '../components/CommentThread'; 
import { LoadingButton } from "@mui/lab"

import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { ShareModal } from "../components/share-modal"
import { useLikes } from "../context/LikesContext"

pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;

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
  semester: string;
  uploadDate: string;
  uploaderName?: string;
  uploaderAvatar?: string;
  professorName?: string;
  professorAvatar?: string; 
}

interface CommentData {
  id: string;
  content: string;
  createdAt: string;
  authorName: string;
  authorAvatar?: string;
  replies?: CommentData[]; 
  likes: number;
}

interface FilePreviewerProps {
  file: FileData;
  backendUrl: string;
}

interface RelatedFileData {
  id: string;
  title: string;
  type: string;
  professorName?: string;
  professorAvatar?: string;
}



const FilePreviewer = ({ file, backendUrl }: FilePreviewerProps) => {
  const fileExtension = file.fileName.split('.').pop()?.toLowerCase() || '';
  const fileFullUrl = `${backendUrl}${file.fileUrl}`;

  const [imageOpen, setImageOpen] = useState(false);
  
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
    setPageNumber(1);
  }

  const goToPrevPage = () => setPageNumber(prev => Math.max(prev - 1, 1));
  const goToNextPage = () => setPageNumber(prev => Math.min(prev + 1, numPages || 1));

  if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
    return (
      <>
        <Paper 
          variant="outlined" 
          onClick={() => setImageOpen(true)}
          sx={{ height: 400, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
        >
          <img src={fileFullUrl} alt={`Pré-visualização de ${file.title}`} style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
        </Paper>
        <Dialog open={imageOpen} onClose={() => setImageOpen(false)} maxWidth="lg">
          <img src={fileFullUrl} alt={file.title} style={{ maxWidth: '100%', maxHeight: '80vh' }} />
        </Dialog>
      </>
    );
  }
  
  if (fileExtension === 'pdf') {
    return (
      <Paper variant="outlined" sx={{ height: 500, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ flexGrow: 1, overflowY: 'auto', width: '100%', display: 'flex', justifyContent: 'center' }}>
            <Document file={fileFullUrl} onLoadSuccess={onDocumentLoadSuccess} loading={<CircularProgress />}>
                <Page pageNumber={pageNumber} />
            </Document>
        </Box>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ p: 1, borderTop: 1, borderColor: 'divider', width: '100%', justifyContent: 'center' }}>
          <Button onClick={goToPrevPage} disabled={pageNumber <= 1}>Anterior</Button>
          <Typography variant="body2">Página {pageNumber} de {numPages}</Typography>
          <Button onClick={goToNextPage} disabled={pageNumber >= (numPages || 0)}>Próxima</Button>
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper variant="outlined" sx={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: 'action.hover' }}>
      <Box textAlign="center">
        <InsertDriveFileIcon sx={{ fontSize: 60, color: "text.secondary" }} />
        <Typography variant="h6" mt={1}>Pré-visualização não disponível</Typography>
        <Typography variant="body2" color="text.secondary">
          O arquivo `{file.fileName}` não pode ser exibido no navegador.
        </Typography>
        <Button component="a" href={fileFullUrl} download={file.fileName} variant="contained" sx={{ mt: 2 }} startIcon={<DownloadIcon />}>
          Fazer Download
        </Button>
      </Box>
    </Paper>
  );
};


export default function FilePage() {
  const { id } = useParams()
  const auth = useAuth();
  const isAuthenticated = auth ? auth.isAuthenticated : false;
  
  const [comment, setComment] = useState("")

  const [file, setFile] = useState<FileData | null>(null);
  const { hasLiked, toggleLike } = useLikes(); 
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [comments, setComments] = useState<CommentData[]>([]);

  const [isPostingComment, setIsPostingComment] = useState<boolean>(false);

  const [searchParams] = useSearchParams();
  const highlightedCommentId = searchParams.get("highlight");

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const [relatedFiles, setRelatedFiles] = useState<RelatedFileData[]>([]);

  const isLikedByUser = hasLiked(id!);


  useEffect(() => {
    if (!id) {
      setError("ID do arquivo não encontrado na URL.");
      setLoading(false);
      return;
    }

    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [fileResponse, commentsResponse, relatedResponse] = await Promise.all([
          apiClient.get<FileData>(`/api/resource/${id}`),
          apiClient.get<CommentData[]>(`/api/resource/${id}/comments`),
          apiClient.get<RelatedFileData[]>(`/api/resource/${id}/related`) 
        ]);

        setFile(fileResponse.data);
        setComments(commentsResponse.data || []);
        setRelatedFiles(relatedResponse.data || []); 
      } catch (err) {
        setError("Não foi possível carregar os dados do material.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [id]); 

  useEffect(() => {
    if (file) {
        console.log("3. Estado 'file' foi atualizado. Nova contagem de likes:", file.likes);
    }
  }, [file]); 

  const handleLike = async () => {
    try {
      await toggleLike(id!);
      const response = await apiClient.get<FileData>(`/api/resource/${id}`);
      setFile(response.data);
    } catch (error) { console.error("Failed to toggle like"); }
  };



  const addReplyToTree = (nodes: CommentData[], parentId: string, newReply: CommentData): CommentData[] => {
    return nodes.map(node => {
      if (node.id === parentId) {
        const updatedReplies = [...(node.replies || []), newReply];
        return { ...node, replies: updatedReplies };
      }
      if (node.replies && node.replies.length > 0) {
        return { ...node, replies: addReplyToTree(node.replies, parentId, newReply) };
      }
      return node;
    });
  };

  const handleComment = async (content: string, parentId: string | null = null) => {
    if (!content.trim()) return;
    
    setIsPostingComment(true);

    try {
      const response = await apiClient.post(`/api/resource/${id}/comments`, { content, parentId });
      const newComment = response.data;

      if (parentId) {
        setComments(prevComments => addReplyToTree(prevComments, parentId, newComment));
      } else {
        setComments(prevComments => [newComment, ...prevComments]);
        setComment(""); 
      }

    } catch (err) {
      console.error("Failed to post comment:", err);
      setError("Não foi possível postar o comentário."); 
    } finally {
      setIsPostingComment(false);
    }
  };

  const copyLinkFallback = () => {
    navigator.clipboard.writeText(window.location.href);
    setSnackbarOpen(true);
  };
  
  const handleShare = async () => {
    const shareData = {
      title: `Material da USP: ${file?.title}`,
      text: `Confira este material de ${file?.course} no USPShare!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        console.log("Conteúdo compartilhado com sucesso!");
      } catch (err) {
        console.error("Erro no compartilhamento:", err);
      }
    } else {
      console.log("API de compartilhamento não suportada, copiando link.");
      copyLinkFallback();
    }
  };

  const handleShareToUser = async (recipientId: string) => {
    try {
      await apiClient.post(`/api/resource/${id}/share`, { recipientId });
      setSnackbar({ open: true, message: "Material compartilhado com sucesso!" });
    } catch (error) {
      console.error("Failed to share with user:", error);
      setSnackbar({ open: true, message: "Falha ao compartilhar." }); 
    }
  };

  if (loading) {
    return <Container sx={{ py: 8, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Container>;
  }

  if (error || !file) {
    return <Container sx={{ py: 8 }}><Alert severity="error">{error || "Material não encontrado."}</Alert></Container>;
  }

  const backendUrl = 'http://localhost:8080';

  const handleShareClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleShareClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <Container sx={{ py: 8 }}>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Typography variant="h4" gutterBottom>{file.title}</Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
            <Chip label={file.type} variant="outlined" />
            {(file.tags || []).map((tag) => (
              <Chip key={tag} label={tag} color="primary" variant="outlined" />
            ))}
          </Box>

          <Box sx={{ mt: 2 }}>
            <FilePreviewer file={file} backendUrl={backendUrl} />
          </Box>

          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <Button variant="outlined" onClick={handleLike} startIcon={<ThumbUpIcon color={isLikedByUser ? "primary" : "action"} />}>
              Útil ({file.likes})
            </Button>
            <Button 
              component="a" 
              href={backendUrl + file.fileUrl} 
              download={file.title} 
              variant="outlined" 
              startIcon={<DownloadIcon />}
            >
              Download
            </Button>
            <Button variant="outlined" startIcon={<ShareIcon />} onClick={handleShareClick}>
                Compartilhar
            </Button>
            <Menu anchorEl={anchorEl} open={open} onClose={handleShareClose}>
                <MenuItem onClick={() => { handleShareClose(); handleShare(); }}>
                    <ListItemIcon ><ShareIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Compartilhar (Link/Nativo)</ListItemText>
                </MenuItem>
                { isAuthenticated?
                <MenuItem onClick={() => { setIsShareModalOpen(true); handleShareClose(); }}>
                    <ListItemIcon><PersonAddIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Enviar para um usuário</ListItemText>
                </MenuItem>
                : null
                }
            </Menu>

            <Snackbar
              open={snackbarOpen}
              autoHideDuration={3000} 
              onClose={() => setSnackbarOpen(false)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
              <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
                Link copiado para a área de transferência!
              </Alert>
            </Snackbar>

          </Box>

          <Box mt={4}>
            <Typography variant="h6">Descrição</Typography>
            <Typography color="text.secondary" mt={1}>{file.description || "Sem descrição disponível."}</Typography>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Box>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h6">Comentários</Typography>
              <Chip label={comments.length} icon={<CommentIcon fontSize="small" />} />
            </Box>

            {isAuthenticated ? (
              <Box component="form" onSubmit={(e) => { 
                e.preventDefault(); 
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
                comments.map(c => <CommentThread key={c.id} comment={c} onReplySubmit={handleComment} highlightedId={highlightedCommentId} />)
              ) : (
                <Typography color="text.secondary" sx={{ textAlign: 'center', p: 2 }}>Seja o primeiro a comentar!</Typography>
              )}
            </Stack>
          </Box>


        </Grid>

        <Grid size={{ xs: 12, md: 4}}>
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography fontWeight="bold">Informações do Material</Typography>
            <Box mt={2} display="flex" flexDirection="column" gap={2}>
              <Box display="flex" gap={1} alignItems="center">
                <InsertDriveFileIcon fontSize="small" />
                <Typography variant="body2">{file.course} ({file.courseCode})</Typography>
              </Box>
              <Box display="flex" gap={1} alignItems="center">
              {file.professorAvatar ? (
                  <Avatar src={`${backendUrl}${file.professorAvatar}`} sx={{ width: 24, height: 24 }} />
                ) : (
                  <PersonIcon fontSize="small" />
                )}
                <Typography variant="body2">{ "Prof(a). " + file.professorName || "Não informado"}</Typography>
              </Box>
              <Box display="flex" gap={1} alignItems="center">
                <CalendarMonthIcon fontSize="small" />
                <Typography variant="body2">{file.semester}</Typography>
              </Box>
              <Box display="flex" gap={1} alignItems="center">
                <Avatar 
                    sx={{ width: 24, height: 24 }}
                    src={file.uploaderAvatar ? `${backendUrl}${file.uploaderAvatar}` : undefined}
                >
                    {(file.uploaderName || 'A').charAt(0)}
                </Avatar>
                <Typography variant="body2">{file.uploaderName || "Anônimo"}</Typography>
              </Box>
              <Box display="flex" gap={1} alignItems="center">
                <CalendarMonthIcon fontSize="small" />
                <Typography variant="body2">Enviado em: {new Date(file.uploadDate).toLocaleDateString("pt-BR")}</Typography>
              </Box>
            </Box>
          </Paper>

          <Alert severity="info">
            Encontrou algum problema com este material?{' '}
            <MuiLink component={RouterLink} to="/report" underline="hover">Reportar</MuiLink>
          </Alert>

          <Paper variant="outlined" sx={{ p: 2, mt: 3 }}>
            <Typography fontWeight="bold" gutterBottom>Materiais Relacionados</Typography>
            <Stack spacing={2} mt={1}>
              {relatedFiles.length > 0 ? (
                relatedFiles.map((relatedFile) => (
                  <MuiLink 
                    component={RouterLink} 
                    to={`/file/${relatedFile.id}`} 
                    key={relatedFile.id} 
                    underline="none" 
                    color="inherit" 
                    sx={{
                        display: 'block',
                        p: 1,
                        borderRadius: 1,
                        '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar 
                        variant="rounded"
                        src={relatedFile.professorAvatar ? `${backendUrl}${relatedFile.professorAvatar}` : undefined}
                      >
                        <PersonIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.4 }}>
                          {relatedFile.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {relatedFile.professorName || 'Autor não informado'} • {relatedFile.type}
                        </Typography>
                      </Box>
                    </Stack>
                  </MuiLink>
                ))
              ) : (
                <Typography variant="caption" color="text.secondary">
                  Nenhum outro material desta disciplina encontrado.
                </Typography>
              )}
            </Stack>
          </Paper>


        </Grid>
      </Grid>

      <ShareModal 
            open={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            onShare={handleShareToUser}
      />
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} />
    </Container>
  );
}
