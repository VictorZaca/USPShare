import { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, Grid, Stack } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import apiClient from '../api/axios';

import { StatsCounter } from '../components/stats-counter';
import { FeatureCard } from '../components/feature-card';

import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import UploadIcon from '@mui/icons-material/Upload';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import SearchIcon from '@mui/icons-material/Search';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';

interface Stats {
    resources: number;
    users: number;
    courses: number;
    downloads: number;
}

const features = [
  {
    icon: <UploadFileOutlinedIcon sx={{ fontSize: 40 }} />,
    title: "Compartilhamento de Arquivos",
    description: "Faça upload de provas antigas, listas, enunciados e resumos em diversos formatos para ajudar a comunidade."
  },
  {
    icon: <SearchIcon sx={{ fontSize: 40 }} />,
    title: "Busca Inteligente",
    description: "Encontre materiais por código ou nome da disciplina, com filtros por tipo, semestre, professor e tags."
  },
  {
    icon: <DescriptionOutlinedIcon sx={{ fontSize: 40 }} />,
    title: "Visualização e Download",
    description: "Visualize PDFs e imagens diretamente na plataforma ou baixe os arquivos para estudar offline com facilidade."
  },
  {
    icon: <PeopleOutlineIcon sx={{ fontSize: 40 }} />,
    title: "Sistema de Conta e Login",
    description: "Crie uma conta segura com seu e-mail USP para garantir a autenticidade e a confiança da comunidade."
  },
  {
    icon: <ForumOutlinedIcon sx={{ fontSize: 40 }} />,
    title: "Interação Social",
    description: "Comente nos materiais para tirar dúvidas, curta o conteúdo útil e responda aos seus colegas estudantes."
  },
  {
    icon: <VerifiedUserOutlinedIcon sx={{ fontSize: 40 }} />,
    title: "Moderação e Confiança",
    description: "Um sistema de reportes e moderação para garantir a qualidade e a relevância dos materiais compartilhados."
  }
];

export default function HomePage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    apiClient.get<Stats>('/api/stats')
      .then(response => setStats(response.data))
      .catch(error => console.error("Falha ao buscar estatísticas:", error));
  }, []);

  return (
    <Box>
      <Box sx={{ bgcolor: 'action.hover', py: { xs: 8, md: 12 } }}>
        <Container>
          <Grid container spacing={6} alignItems="center">
            <Grid size={{ xs: 12, md: 6}}>
              <Stack spacing={3}>
                <Typography variant="h2" component="h1" fontWeight="bold" sx={{ letterSpacing: '-.02em' }}>
                  USPShare: Compartilhe e Acesse Materiais Acadêmicos
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Uma rede colaborativa criada por e para estudantes da Universidade de São Paulo. Democratizando o acesso a provas, listas, resumos e enunciados.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button component={RouterLink} to="/explore" variant="contained" size="large" endIcon={<ArrowForwardIcon />}>
                    Explorar Materiais
                  </Button>
                  <Button component={RouterLink} to="/upload" variant="outlined" size="large" startIcon={<UploadIcon />}>
                    Compartilhar
                  </Button>
                </Stack>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 6}}>
              <Box component="img" src="../public/landing.jpg" sx={{ width: '100%', borderRadius: 3, boxShadow: 5 }} />
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box sx={{ py: 8 }}>
        <Container>
        <Grid container spacing={4}>
          <Grid size={{xs:6, md:3}}><StatsCounter icon={<ArticleOutlinedIcon color="primary" fontSize="large"/>} value={stats?.resources || 0} label="Arquivos" /></Grid>
          <Grid size={{xs:6, md:3}}><StatsCounter icon={<PeopleAltOutlinedIcon color="primary" fontSize="large"/>} value={stats?.users || 0} label="Usuários" /></Grid>
          <Grid size={{xs:6, md:3}}><StatsCounter icon={<SchoolOutlinedIcon color="primary" fontSize="large"/>} value={stats?.courses || 0} label="Cursos" /></Grid>
      </Grid>
        </Container>
      </Box>

      <Box sx={{ bgcolor: 'action.hover', py: { xs: 8, md: 12 } }}>
        <Container>
          <Stack alignItems="center" textAlign="center" spacing={2}>
            <Typography variant="h3" component="h2" fontWeight="bold">Principais Recursos</Typography>
            <Typography variant="h6" color="text.secondary" maxWidth="md">
                Tudo o que você precisa para planejar seus estudos de forma eficiente
            </Typography>
          </Stack>
          
          <Grid container spacing={4} sx={{ mt: 6 }}>
            {features.map((feature, index) => (
              <Grid size={{xs: 12, sm: 6, md: 4}} key={index}>
                <FeatureCard
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', py: { xs: 8, md: 12 } }}>
        <Container>
            <Stack alignItems="center" textAlign="center" spacing={3}>
                <Typography variant="h3" component="h2" fontWeight="bold">Junte-se à Comunidade USPShare</Typography>
                <Typography variant="h6" sx={{ maxWidth: 'md', opacity: 0.9 }}>
                    Compartilhe conhecimento, ajude outros estudantes e melhore sua experiência acadêmica.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Button component={RouterLink} to="/signup" variant="contained" size="large" sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.200' } }}>
                        Criar Conta
                    </Button>
                    <Button component={RouterLink} to="/about" variant="outlined" size="large" color="inherit">
                        Saiba Mais
                    </Button>
                </Stack>
            </Stack>
        </Container>
      </Box>
    </Box>
  );
}