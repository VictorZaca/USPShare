import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Stack,
  Paper,
  Avatar,
} from "@mui/material";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import SearchIcon from "@mui/icons-material/Search";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import Diversity3Icon from '@mui/icons-material/Diversity3';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <Stack spacing={2} alignItems="center" textAlign="center">
    <Avatar sx={{ bgcolor: "primary.light", width: 64, height: 64 }}>
      {icon}
    </Avatar>
    <Stack>
      <Typography variant="h6" component="h3" fontWeight="bold">
        {title}
      </Typography>
      <Typography color="text.secondary">{description}</Typography>
    </Stack>
  </Stack>
);

interface StatsCounterProps {
  value: number;
  label: string;
}

const StatsCounter: React.FC<StatsCounterProps> = ({ value, label }) => (
  <Box>
    <Typography variant="h3" component="p" fontWeight="bold" color="primary">
      {value.toLocaleString("pt-BR")}+
    </Typography>
    <Typography color="text.secondary">{label}</Typography>
  </Box>
);

export default function HomePage() {
  return (
    <Box>
      <Box
        component="section"
        sx={{
          background: (theme) => `linear-gradient(180deg, ${theme.palette.primary.light} 0%, #FFFFFF 100%)`,
          py: { xs: 8, md: 12 },
        }}
      >
        <Container>
          <Grid container spacing={6} alignItems="center">
            <Grid size={{ xs: 12, lg: 6 }}>
              <Stack spacing={3}>
                <Typography
                  variant="h2"
                  component="h1"
                  fontWeight="bold"
                  sx={{ letterSpacing: "-.02em" }}
                >
                  USPShare: Compartilhe e Acesse Materiais Acadêmicos
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Uma rede colaborativa criada por e para estudantes da
                  Universidade de São Paulo. Democratizando o acesso a provas,
                  listas, resumos e enunciados.
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <Button
                    component={RouterLink}
                    to="/explore"
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                  >
                    Explorar Materiais
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/upload"
                    variant="outlined"
                    size="large"
                    endIcon={<FileUploadOutlinedIcon />}
                  >
                    Compartilhar Material
                  </Button>
                </Stack>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Paper
                elevation={6}
                sx={{
                  aspectRatio: "16 / 10",
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <Box
                  component="img"
                  src={`https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070`}
                  alt="Estudantes da USP compartilhando materiais"
                  sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box component="section" sx={{ py: 8 }}>
        <Container>
          <Grid container spacing={4} textAlign="center">
            <Grid size={{ xs: 6, md: 3 }}><StatsCounter value={5000} label="Arquivos Compartilhados" /></Grid>
            <Grid size={{ xs: 6, md: 3 }}><StatsCounter value={3500} label="Usuários Ativos" /></Grid>
            <Grid size={{ xs: 6, md: 3 }}><StatsCounter value={120} label="Cursos Cobertos" /></Grid>
            <Grid size={{ xs: 6, md: 3 }}><StatsCounter value={25000} label="Downloads Realizados" /></Grid>
          </Grid>
        </Container>
      </Box>

      <Box component="section" sx={{ bgcolor: "grey.50", py: { xs: 8, md: 12 } }}>
        <Container>
          <Stack spacing={2} alignItems="center" textAlign="center" sx={{ mb: 8 }}>
            <Typography variant="h3" component="h2" fontWeight="bold">Principais Recursos</Typography>
            <Typography variant="h6" color="text.secondary" maxWidth="md">
              Tudo o que você precisa para planejar seus estudos de forma eficiente
            </Typography>
          </Stack>
          <Grid container spacing={5}>
            <Grid size={{ xs: 12, sm: 6, md: 4}}><FeatureCard icon={<FileUploadOutlinedIcon fontSize="large" color="primary" />} title="Compartilhamento Fácil" description="Faça upload de provas antigas, listas, e resumos em diversos formatos." /></Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4}}><FeatureCard icon={<SearchIcon fontSize="large" color="primary" />} title="Busca Inteligente" description="Encontre materiais por disciplina, professor ou palavra-chave com filtros avançados." /></Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4}}><FeatureCard icon={<DescriptionOutlinedIcon fontSize="large" color="primary" />} title="Visualização e Download" description="Visualize e baixe arquivos para estudo com facilidade, a qualquer hora." /></Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4}}><FeatureCard icon={<GroupOutlinedIcon fontSize="large" color="primary" />} title="Comunidade Colaborativa" description="Comente, curta e interaja com outros estudantes sobre os materiais." /></Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4}}><FeatureCard icon={<HowToRegIcon fontSize="large" color="primary" />} title="Acesso Exclusivo USP" description="Crie sua conta com e-mail @usp.br para garantir a autenticidade e segurança." /></Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4}}><FeatureCard icon={<SecurityOutlinedIcon fontSize="large" color="primary" />} title="Moderação de Conteúdo" description="Combinação de revisão automática e equipe de voluntários para manter a qualidade." /></Grid>
          </Grid>
        </Container>
      </Box>

       <Box component="section" sx={{ py: { xs: 8, md: 12 } }}>
        <Container>
          <Stack spacing={2} alignItems="center" textAlign="center" sx={{ mb: 8 }}>
            <Typography variant="h3" component="h2" fontWeight="bold">Como Funciona</Typography>
            <Typography variant="h6" color="text.secondary" maxWidth="md">
              Três passos simples para começar a usar o USPShare
            </Typography>
          </Stack>
           <Grid container spacing={5} justifyContent="center">
               <Grid size={{ xs: 12, sm: 4 }}><FeatureCard icon={<HowToRegIcon fontSize="large" color="primary" />} title="1. Crie sua Conta" description="Cadastre-se rapidamente utilizando seu e-mail institucional da USP." /></Grid>
               <Grid size={{ xs: 12, sm: 4 }}><FeatureCard icon={<FindInPageIcon fontSize="large" color="primary" />} title="2. Encontre ou Compartilhe" description="Busque por materiais de suas disciplinas ou compartilhe os seus." /></Grid>
               <Grid size={{ xs: 12, sm: 4 }}><FeatureCard icon={<Diversity3Icon fontSize="large" color="primary" />} title="3. Colabore" description="Avalie, comente e ajude a construir uma biblioteca de conhecimento." /></Grid>
          </Grid>
        </Container>
      </Box>

      <Box component="section" sx={{ bgcolor: "primary.main", color: "primary.contrastText", py: { xs: 8, md: 12 } }}>
        <Container>
          <Stack spacing={3} alignItems="center" textAlign="center">
            <Typography variant="h3" component="h2" fontWeight="bold">
              Junte-se à Comunidade USPShare
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }} maxWidth="md">
              Compartilhe conhecimento, ajude outros estudantes e melhore sua
              experiência acadêmica.
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Button
                component={RouterLink}
                to="/signup"
                variant="contained"
                size="large"
                sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.200' } }}
              >
                Criar Conta
              </Button>
              <Button component={RouterLink} to="/about" variant="outlined" color="inherit" size="large">
                Saiba Mais
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}