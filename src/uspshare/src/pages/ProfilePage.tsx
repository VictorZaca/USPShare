import React, { useState, useEffect, ChangeEvent } from "react";
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
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions
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
import StarBorderIcon from '@mui/icons-material/StarBorder';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

// Ferramentas para integração com a API e Auth
import apiClient from "../api/axios"; // Nosso cliente de API configurado
import { useAuth } from "../context/AuthContext"; // Nosso hook de autenticação
import { LoadingButton } from "@mui/lab";

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

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  profile: Profile;
  onSave: (formData: Profile, avatarFile: File | null) => Promise<void>;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ open, onClose, profile, onSave }) => {
  const [formData, setFormData] = useState(profile);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData(profile); // Atualiza o form se o perfil mudar
  }, [profile]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    await onSave(formData, avatarFile);
    setIsSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Editar Perfil</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ pt: 1 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar src={avatarFile ? URL.createObjectURL(avatarFile) : `http://localhost:8080${profile.avatar}`} sx={{ width: 80, height: 80 }} />
            <Button variant="outlined" component="label">
              Trocar Imagem
              <input type="file" hidden accept="image/*" onChange={handleAvatarChange} />
            </Button>
          </Stack>
          <TextField name="name" label="Nome Completo" value={formData.name} onChange={handleChange} />
          <TextField name="course" label="Curso" value={formData.course} onChange={handleChange} />
          <TextField name="faculty" label="Instituto/Faculdade" value={formData.faculty} onChange={handleChange} />
          <TextField name="bio" label="Bio" multiline rows={3} value={formData.bio} onChange={handleChange} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: '0 24px 16px' }}>
        <Button onClick={onClose}>Cancelar</Button>
        <LoadingButton onClick={handleSaveChanges} variant="contained" loading={isSaving}>
          Salvar Alterações
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};


// --- Componente Principal da Página de Perfil ---

export default function ProfilePage() {
  const [tabValue, setTabValue] = useState("uploads");
  const [isEditModalOpen, setEditModalOpen] = useState(false);

  // --- MUDANÇA PRINCIPAL: Usamos o 'user' e 'refreshUser' diretamente do contexto ---
  // Renomeamos 'user' para 'profile' para manter a consistência do JSX.
  const { user: profile, refreshUser, loading: authLoading } = useAuth();
  
  // O estado de 'uploads' continua local, pois pertence apenas a esta página.
  const [uploads, setUploads] = useState<FileData[]>([]);
  const [loadingUploads, setLoadingUploads] = useState(true);

  // --- MUDANÇA NO useEffect: Ele agora só busca os uploads ---
  // A busca do perfil é gerenciada pelo AuthContext.
  useEffect(() => {
    // Só busca os uploads se o perfil já foi carregado pelo contexto
    if (profile) {
      const fetchUserUploads = async () => {
        try {
          setLoadingUploads(true);
          const response = await apiClient.get<FileData[]>('/api/my-uploads');
          setUploads(response.data || []);
        } catch (error) { 
          console.error("Failed to fetch uploads:", error); 
        } finally { 
          setLoadingUploads(false); 
        }
      };
      fetchUserUploads();
    }
  }, [profile]); 

  const handleTabChange = (event: any, newValue: React.SetStateAction<string>) => {
    setTabValue(newValue);
  };

  const handleSaveProfile = async (updatedData: Partial<Profile>, avatarFile: File | null) => {
    try {
      // 1. Envia as atualizações para o backend (texto e/ou imagem)
      await apiClient.put('/api/profile', updatedData);
      
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        await apiClient.post('/api/profile/avatar', formData);
      }
      
      // 2. A MÁGICA: Pede ao AuthContext para buscar os dados mais recentes para TODA a aplicação.
      await refreshUser();

    } catch (error) {
      console.error("Failed to save profile:", error);
      // Você pode adicionar um alerta de erro para o usuário aqui
    }
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
  if (authLoading) {
    return <Container sx={{ py: 8, display: 'flex', justifyContent: 'center' }}><CircularProgress size={60} /></Container>;
  }

  if (!profile) {
    return <Container sx={{ py: 8 }}><Typography>Perfil não pôde ser carregado.</Typography></Container>;
  }

  const badgeIcons: Record<string, React.ReactElement> = {
    "Novo Membro": <StarBorderIcon fontSize="small" />,
    "Colaborador": <CloudUploadIcon fontSize="small" />,
    "Mestre dos Uploads": <CloudUploadIcon fontSize="small" />, // poderia ser outro ícone
  };

  // Renderização principal com os dados reais
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
      {/* Cabeçalho do Perfil */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={4} alignItems="flex-start">
        <Avatar src={`http://localhost:8080${profile.avatar}`} alt={profile.name} sx={{ width: 96, height: 96, border: '3px solid', borderColor: 'primary.light' }} />
        <Stack spacing={2} sx={{ flexGrow: 1 }}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="center" spacing={2}>
            <Typography variant="h4" fontWeight="bold">{profile.name}</Typography>
            <Button variant="outlined" startIcon={<EditIcon />} sx={{ width: { xs: '100%', sm: 'auto' } }} onClick={() => setEditModalOpen(true)}>Editar Perfil</Button>
          </Stack>
          <Box color="text.secondary">
            <Typography variant="body1">{profile.course} • {profile.faculty}</Typography>
            <Typography variant="body2">Ingressante {profile.yearJoined}</Typography>
          </Box>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {profile.badges?.map((badge) => (
              <Chip key={badge} icon={badgeIcons[badge] || <EmojiEventsOutlinedIcon />} label={badge} variant="outlined" color="primary" size="small" />
            ))}
          </Stack>
          <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>"{profile.bio}"</Typography>
        </Stack>
      </Stack>

      {/* Estatísticas do Usuário */}
      <Grid container spacing={2} sx={{ mt: 4 }}>
        <Grid size={{ xs: 6, sm: 3}}><StatCard icon={<FileUploadOutlinedIcon color="primary" />} value={profile.stats?.uploads ?? 0} label="Materiais Compartilhados" /></Grid>
        <Grid size={{ xs: 6, sm: 3}}><StatCard icon={<ThumbUpOutlinedIcon color="primary" />} value={profile.stats?.likes ?? 0} label="Curtidas Recebidas" /></Grid>
        <Grid size={{ xs: 6, sm: 3}}><StatCard icon={<ChatBubbleOutlineOutlinedIcon color="primary" />} value={profile.stats?.comments?? 0} label="Comentários" /></Grid>
        <Grid size={{ xs: 6, sm: 3}}><StatCard icon={<EmojiEventsOutlinedIcon color="primary" />} value={profile.stats?.reputation?? 0} label="Pontos de Reputação" /></Grid>
      </Grid>

      {/* Abas de Conteúdo do Perfil */}
      <Box sx={{ mt: 6 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
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

      {profile && (
        <EditProfileModal
          open={isEditModalOpen}
          onClose={() => setEditModalOpen(false)}
          profile={profile}
          onSave={handleSaveProfile}
        />
      )}
    </Container>
  );
}