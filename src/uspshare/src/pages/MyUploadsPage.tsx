import { useState, useEffect, useCallback } from 'react';
import { Container, Typography, Box, Grid, Button, CircularProgress, Alert, Stack, IconButton, Card, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import apiClient from '../api/axios';
import { FileCard } from '../components/file-card'; 
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import DeleteIcon from '@mui/icons-material/Delete';

interface UserUpload {
    id: string;
    title: string;
    description?: string;
    type: string;
    course: string;
    courseCode: string;
    professorName: string;
    semester: string;
    uploadDate: string;
    tags: string[];
    likes: number;
    comments: number;
    uploaderName?: string; 
    uploaderAvatar?: string; 
    professorAvatar?: string; 
}


export default function MyUploadsPage() {
  const [myUploads, setMyUploads] = useState<UserUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMyUploads = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<UserUpload[]>('/api/my-uploads');
      setMyUploads(response.data || []);
    } catch (err) {
      console.error("Failed to fetch uploads:", err);
      setError("Não foi possível carregar seus uploads.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyUploads();
  }, [fetchMyUploads]);

  const handleDelete = async (resourceId: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este material? Esta ação não pode ser desfeita.")) {
      return;
    }

    try {
      await apiClient.delete(`/api/resource/${resourceId}`);
      setMyUploads(prevUploads => prevUploads.filter(upload => upload.id !== resourceId));
    } catch (err) {
      console.error("Failed to delete resource:", err);
      setError("Falha ao excluir o material.");
    }
  };

  const renderContent = () => {
    if (loading) {
      return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
    }
    if (error) {
      return <Alert severity="error">{error}</Alert>;
    }
    if (myUploads.length === 0) {
      return (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6">Você ainda não compartilhou nenhum material.</Typography>
          <Typography color="text.secondary" sx={{ my: 2 }}>Que tal começar agora e ajudar a comunidade?</Typography>
          <Button variant="contained" component={RouterLink} to="/upload" startIcon={<FileUploadOutlinedIcon />}>
            Compartilhar meu primeiro material
          </Button>
        </Paper>
      );
    }
    return (
      <Grid container spacing={3}>
        {myUploads.map((file) => (
          <Grid size={{ xs: 12, sm: 6, md: 4}} key={file.id}>
            <Card sx={{ position: 'relative', height: '100%' }}>
              <FileCard file={file} />
              <IconButton 
                aria-label="delete" 
                onClick={() => handleDelete(file.id)}
                sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.7)' }}
              >
                <DeleteIcon />
              </IconButton>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Container sx={{ py: { xs: 4, md: 8 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold">Meus Uploads</Typography>
          <Typography color="text.secondary">Gerencie os materiais que você compartilhou.</Typography>
        </Box>
        <Button variant="contained" component={RouterLink} to="/upload" startIcon={<FileUploadOutlinedIcon />}>
          Enviar Novo
        </Button>
      </Stack>
      {renderContent()}
    </Container>
  );
}