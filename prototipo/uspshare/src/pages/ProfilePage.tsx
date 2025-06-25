import React, { useState, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Avatar,
  Button,
  Chip,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Stack,
  Paper,
  CircularProgress,
  Alert
} from "@mui/material";

// Ícones do Material-UI
import EditIcon from "@mui/icons-material/Edit";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import BookmarkBorderOutlinedIcon from "@mui/icons-material/BookmarkBorderOutlined";
import HistoryIcon from "@mui/icons-material/History";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";


// Ferramentas para integração com a API e Auth
import apiClient from "../api/axios"; // Nosso cliente de API configurado
import { useAuth } from "../context/AuthContext"; // Nosso hook de autenticação

// --- Componentes de Apoio (Placeholders) ---

// Componente para exibir um card de arquivo
interface FileData {
  id: string;
  title?: string;
  fileName?: string;
  courseCode: string;
}

interface FileCardProps {
  file: FileData;
}

const FileCard: React.FC<FileCardProps> = ({ file }) => (
  <Card variant="outlined" sx={{ height: '100%' }}>
    <CardContent>
      <Typography variant="h6" gutterBottom noWrap>{file.title || file.fileName}</Typography>
      <Typography variant="body2" color="text.secondary">{file.courseCode}</Typography>
      <Button size="small" sx={{ mt: 2 }}>Ver Material</Button>
    </CardContent>
  </Card>
);

// Componente para a aba "Atividade"
const ProfileActivity = () => (
  <Paper sx={{ p: 4, textAlign: 'center' }}>
    <HistoryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
    <Typography variant="h6">Atividade Recente</Typography>
    <Typography color="text.secondary">O histórico de atividades do usuário aparecerá aqui.</Typography>
  </Paper>
);

// Componente para a aba "Configurações"
interface Profile {
  name: string;
  avatar: string;
  course: string;
  faculty: string;
  yearJoined: string | number;
  badges: string[];
  stats: {
    uploads: number;
    likes: number;
    comments: number;
    reputation: number;
  };
  bio: string;
}

const ProfileSettings = ({ user }: { user: Profile }) => (
  <Paper sx={{ p: 4, textAlign: 'center' }}>
    <SettingsOutlinedIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
    <Typography variant="h6">Configurações da Conta</Typography>
    <Typography color="text.secondary">Opções para gerenciar o perfil de {user.name} aparecerão aqui.</Typography>
  </Paper>
);

// Componente helper para os painéis das abas
function TabPanel(props: { [x: string]: any; children: any; value: any; index: any; }) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 4 }}>{children}</Box>}
    </div>
  );
}

// --- Componente Principal da Página de Perfil ---

export default function ProfilePage() {
  const [tabValue, setTabValue] = useState("uploads");

  // Estados para os dados da API, loading e erros
  const [profile, setProfile] = useState<Profile | null>(null);
  const [uploads, setUploads] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const authContext = useAuth();
  const isAuthenticated = authContext ? authContext.isAuthenticated : false;

  // Efeito para buscar os dados quando o componente é montado
  useEffect(() => {
    const fetchProfileData = async () => {
      // Se o usuário não estiver logado, não há perfil para buscar
      if (!isAuthenticated) {
        setError("Você precisa estar logado para ver um perfil.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // Faz as chamadas para os endpoints do perfil e dos uploads em paralelo
        const [profileResponse, uploadsResponse] = await Promise.all([
          apiClient.get('/api/profile'),
          apiClient.get('/api/my-uploads')
        ]);
        setProfile(profileResponse.data);
        setUploads(uploadsResponse.data || []); // Garante que uploads seja um array
      } catch (err) {
        setError("Não foi possível carregar os dados do perfil. Tente novamente mais tarde.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [isAuthenticated]); // Roda sempre que o estado de autenticação mudar

  const handleTabChange = (_event: any, newValue: React.SetStateAction<string>) => {
    setTabValue(newValue);
  };

  const StatCard = ({ icon, value, label }: { icon: React.ReactNode; value: number; label: string; }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack spacing={1} alignItems="center" textAlign="center">
          {icon}
          <Typography variant="h5" fontWeight="bold">{value}</Typography>
          <Typography variant="caption" color="text.secondary">{label}</Typography>
        </Stack>
      </CardContent>
    </Card>
  );

  // Renderização condicional para os estados de loading e erro
  if (loading) {
    return <Container sx={{ py: 8, display: 'flex', justifyContent: 'center' }}><CircularProgress size={60} /></Container>;
  }

  if (error) {
    return <Container sx={{ py: 8 }}><Alert severity="error">{error}</Alert></Container>;
  }

  if (!profile) {
    return <Container sx={{ py: 8 }}><Typography>Perfil não pôde ser carregado.</Typography></Container>;
  }

  // Renderização principal com os dados reais
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
      {/* Cabeçalho do Perfil */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={4} alignItems="flex-start">
        <Avatar src={profile.avatar} alt={profile.name} sx={{ width: 96, height: 96, border: '3px solid', borderColor: 'primary.light' }} />
        <Stack spacing={2} sx={{ flexGrow: 1 }}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="center" spacing={2}>
            <Typography variant="h4" fontWeight="bold">{profile.name}</Typography>
            <Button variant="outlined" startIcon={<EditIcon />} sx={{ width: { xs: '100%', sm: 'auto' } }}>Editar Perfil</Button>
          </Stack>
          <Box color="text.secondary">
            <Typography variant="body1">{profile.course} • {profile.faculty}</Typography>
            <Typography variant="body2">Ingressante {profile.yearJoined}</Typography>
          </Box>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {profile.badges.map((badge) => (
              <Chip key={badge} icon={<EmojiEventsOutlinedIcon />} label={badge} variant="outlined" color="primary" size="small" />
            ))}
          </Stack>
          <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>"{profile.bio}"</Typography>
        </Stack>
      </Stack>

      {/* Estatísticas do Usuário */}
      <Grid container spacing={2} sx={{ mt: 4 }}>
        <Grid size={{ xs: 6, sm: 3}}><StatCard icon={<FileUploadOutlinedIcon color="primary" />} value={profile.stats.uploads} label="Materiais Compartilhados" /></Grid>
        <Grid size={{ xs: 6, sm: 3}}><StatCard icon={<ThumbUpOutlinedIcon color="primary" />} value={profile.stats.likes} label="Curtidas Recebidas" /></Grid>
        <Grid size={{ xs: 6, sm: 3}}><StatCard icon={<ChatBubbleOutlineOutlinedIcon color="primary" />} value={profile.stats.comments} label="Comentários" /></Grid>
        <Grid size={{ xs: 6, sm: 3}}><StatCard icon={<EmojiEventsOutlinedIcon color="primary" />} value={profile.stats.reputation} label="Pontos de Reputação" /></Grid>
      </Grid>

      {/* Abas de Conteúdo do Perfil */}
      <Box sx={{ mt: 6 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto" centered>
          <Tab icon={<DescriptionOutlinedIcon />} iconPosition="start" label="Uploads" value="uploads" />
          <Tab icon={<BookmarkBorderOutlinedIcon />} iconPosition="start" label="Salvos" value="saved" />
          <Tab icon={<HistoryIcon />} iconPosition="start" label="Atividade" value="activity" />
          <Tab icon={<SettingsOutlinedIcon />} iconPosition="start" label="Configurações" value="settings" />
        </Tabs>

        <TabPanel value={tabValue} index="uploads">
          <Stack spacing={4}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Meus Materiais Compartilhados</Typography>
              <Button variant="contained" startIcon={<FileUploadOutlinedIcon />} component={RouterLink} to="/upload">Compartilhar Novo</Button>
            </Stack>
            <Grid container spacing={3}>
              {uploads.length > 0 ? (
                uploads.map((file) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={file.id}><FileCard file={file} /></Grid>
                ))
              ) : (
                <Grid size={{ xs: 12 }}><Typography sx={{ textAlign: 'center', p: 4 }}>Você ainda não compartilhou nenhum material.</Typography></Grid>
              )}
            </Grid>
          </Stack>
        </TabPanel>

        <TabPanel value={tabValue} index="saved">
           <Typography sx={{ textAlign: 'center', p: 4 }}>A funcionalidade de materiais salvos será implementada em breve.</Typography>
        </TabPanel>

        <TabPanel value={tabValue} index="activity"><ProfileActivity /></TabPanel>

        <TabPanel value={tabValue} index="settings"><ProfileSettings user={profile} /></TabPanel>
      </Box>
    </Container>
  );
}