import { Button, Typography, Container, Box, Grid } from "@mui/material"
import { ArrowForward, MenuBook, Article, Search, CloudUpload, Group } from "@mui/icons-material"
import { Link as RouterLink } from "react-router-dom"
import StatsCounter from "../components/stats-counter"
import FeatureCard from "../components/feature-card"
import HowItWorks from "../components/how-it-works"

export default function LandingPage() {
  return (
    <Box display="flex" flexDirection="column">
      {/* Hero Section */}
      <Box py={10} sx={{ background: (theme) => `linear-gradient(to bottom, ${theme.palette.mode === 'dark' ? '#0f172a' : '#e3f2fd'}, ${theme.palette.background.default})` }}>
        <Container>
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                USPShare: Compartilhe e Acesse Materiais Acadêmicos
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" paragraph>
                Uma rede colaborativa criada por e para estudantes da Universidade de São Paulo. Democratizando o acesso a provas, listas, resumos e enunciados.
              </Typography>
              <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} mt={2}>
                <Button variant="contained" component={RouterLink} to="/explore" endIcon={<ArrowForward />}>
                  Explorar Materiais
                </Button>
                <Button variant="outlined" component={RouterLink} to="/upload" startIcon={<CloudUpload />}>
                  Compartilhar Material
                </Button>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  width: '100%',
                  maxWidth: 500,
                  aspectRatio: '16 / 9',
                  borderRadius: 2,
                  backgroundColor: 'grey.300',
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box py={8} bgcolor="background.paper">
        <Container>
          <Grid container spacing={4} textAlign="center">
            <StatsCounter value={5000} label="Arquivos Compartilhados" />
            <StatsCounter value={3500} label="Usuários Ativos" />
            <StatsCounter value={120} label="Cursos Cobertos" />
            <StatsCounter value={25000} label="Downloads Realizados" />
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box py={10} bgcolor="grey.100">
        <Container>
          <Box textAlign="center" mb={6}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Principais Recursos
            </Typography>
            <Typography color="text.secondary">
              Tudo o que você precisa para planejar seus estudos de forma eficiente
            </Typography>
          </Box>
          <Grid container spacing={4}>
            <FeatureCard icon={<CloudUpload fontSize="large" color="primary" />} title="Compartilhamento de Arquivos" description="Faça upload de provas antigas, listas, enunciados e resumos em diversos formatos." />
            <FeatureCard icon={<Search fontSize="large" color="primary" />} title="Busca Inteligente" description="Encontre materiais por código ou nome da disciplina, com filtros adicionais." />
            <FeatureCard icon={<Article fontSize="large" color="primary" />} title="Visualização e Download" description="Visualize e baixe arquivos disponíveis para estudo com facilidade." />
            <FeatureCard icon={<Group fontSize="large" color="primary" />} title="Sistema de Conta e Login" description="Crie uma conta com e-mail USP para garantir autenticidade." />
            <FeatureCard icon={<MenuBook fontSize="large" color="primary" />} title="Interação Social" description="Comente, curta e interaja com outros estudantes sobre os materiais." />
            <FeatureCard icon={<CloudUpload fontSize="large" color="primary" />} title="Moderação Híbrida" description="Combinação de revisão automática e equipe de voluntários da USP." />
          </Grid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box py={10} bgcolor="background.paper">
        <Container>
          <Box textAlign="center" mb={6}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Como Funciona
            </Typography>
            <Typography color="text.secondary">
              Três passos simples para começar a usar o USPShare
            </Typography>
          </Box>
          <HowItWorks />
        </Container>
      </Box>

      {/* CTA Section */}
      <Box py={10} bgcolor="primary.main" color="primary.contrastText">
        <Container>
          <Box textAlign="center">
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Junte-se à Comunidade USPShare
            </Typography>
            <Typography mb={4} maxWidth="sm" mx="auto" sx={{ opacity: 0.9 }}>
              Compartilhe conhecimento, ajude outros estudantes e melhore sua experiência acadêmica
            </Typography>
            <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} justifyContent="center">
              <Button variant="contained" component={RouterLink} to="/signup" sx={{ bgcolor: 'background.paper', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }} endIcon={<ArrowForward />}>
                Criar Conta
              </Button>
              <Button variant="outlined" component={RouterLink} to="/about" sx={{ borderColor: 'common.white', color: 'common.white', '&:hover': { bgcolor: 'primary.dark' } }}>
                Saiba Mais
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}
