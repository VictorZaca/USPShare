import React from 'react';
import { Container, Box, Typography, Button, Grid, Paper, List, ListItem } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import UploadIcon from '@mui/icons-material/Upload';

export default function LandingPage() {
  return (
    <>
      {/* Hero Section */}
      <Box sx={{ py: 8, background: theme => theme.palette.background.default }}>
        <Container>
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                USPShare: Compartilhe e Acesse Materiais Acadêmicos
              </Typography>
              <Typography variant="h6" color="textSecondary" paragraph>
                Uma rede colaborativa criada por e para estudantes da Universidade de São Paulo.
                Democratizando o acesso a provas, listas, resumos e enunciados.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button variant="contained" endIcon={<ArrowForwardIcon />} component="a" href="/explore">
                  Explorar Materiais
                </Button>
                <Button variant="outlined" startIcon={<UploadIcon />} component="a" href="/upload">
                  Compartilhar Material
                </Button>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper elevation={4} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <Box component="img" src="/placeholder.svg" alt="Estudantes USP" width="100%" height="auto" />
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: 6, background: theme => theme.palette.grey[100] }}>
        <Container>
          <Grid container spacing={4} textAlign="center">
            {[
              { label: 'Arquivos Compartilhados', value: '5,000+' },
              { label: 'Usuários Ativos', value: '3,500+' },
              { label: 'Cursos Cobertos', value: '120+' },
              { label: 'Downloads', value: '25,000+' }
            ].map((stat) => (
                <Grid size={{ xs: 6, md: 3 }} key={stat.label}>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {stat.value}
                </Typography>
                <Typography variant="subtitle1" color="textSecondary">
                  {stat.label}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 8 }}>
        <Container>
          <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
            Principais Recursos
          </Typography>
          <Typography variant="body1" align="center" color="textSecondary" paragraph>
            Tudo o que você precisa para planejar seus estudos de forma eficiente
          </Typography>
          <Grid container spacing={4} sx={{ mt: 4 }}>
            {[
              { icon: <UploadIcon fontSize="large" color="primary" />, title: 'Compartilhamento de Arquivos', description: 'Faça upload de provas antigas, listas, enunciados e resumos.' },
              { icon: <ArrowForwardIcon fontSize="large" color="primary" />, title: 'Busca Inteligente', description: 'Encontre materiais por disciplina, professor ou código.' },
              { icon: <UploadIcon fontSize="large" color="primary" />, title: 'Visualização e Download', description: 'Visualize e baixe arquivos com facilidade.' },
              { icon: <ArrowForwardIcon fontSize="large" color="primary" />, title: 'Sistema de Conta e Login', description: 'Registre-se com e-mail USP para acesso completo.' },
            ].map(feature => (
                <Grid size={{ xs: 12, md: 6, lg: 3 }} key={feature.title}>
                <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
                  {feature.icon}
                  <Typography variant="h6" sx={{ mt: 1, fontWeight: 'medium' }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {feature.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box sx={{ py: 8, background: theme => theme.palette.grey[50] }}>
        <Container>
          <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
            Como Funciona
          </Typography>
          <Typography variant="body1" align="center" color="textSecondary" paragraph>
            Três passos simples para começar a usar o USPShare
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            {[
              { title: '1. Crie sua conta', description: 'Registre-se usando seu e-mail USP.' },
              { title: '2. Explore materiais', description: 'Busque provas, listas e resumos.' },
              { title: '3. Compartilhe conhecimento', description: 'Contribua com seus próprios materiais.' }
            ].map(step => (
                <Grid size={{ xs: 12, md: 4 }} key={step.title}>
                <Paper elevation={1} sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="h6" fontWeight="medium">
                    {step.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {step.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Call to Action Section */}
      <Box sx={{ py: 8, background: theme => theme.palette.primary.main, color: '#fff' }}>
        <Container sx={{ textAlign: 'center' }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Junte-se à Comunidade USPShare
          </Typography>
          <Typography variant="body1" paragraph>
            Compartilhe conhecimento, ajude outros estudantes e melhore sua experiência acadêmica
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button variant="contained" color="secondary" component={RouterLink} to="/login">
              Criar Conta
            </Button>
            <Button variant="outlined" component={RouterLink} to="/about" sx={{ borderColor: '#fff', color: '#fff' }}>
              Saiba Mais
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box component="footer" sx={{ py: 6, background: theme => theme.palette.background.paper }}>
        <Container>
          <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="h6" gutterBottom>USPShare</Typography>
              <Typography variant="body2" color="textSecondary">
                Uma plataforma colaborativa para compartilhamento de materiais acadêmicos.
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="subtitle1" gutterBottom>Navegação</Typography>
              <List>
                {['Página Inicial','Explorar','Compartilhar','Sobre'].map(text => (
                  <ListItem key={text} disablePadding>
                    <Button component={RouterLink} to={text==='Página Inicial'?'/':'/'+text.toLowerCase()} sx={{ justifyContent: 'flex-start' }}>
                      {text}
                    </Button>
                  </ListItem>
                ))}
              </List>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="subtitle1" gutterBottom>Recursos</Typography>
              <List>
                {['FAQ','Guia','Termos','Privacidade'].map(text => (
                  <ListItem key={text} disablePadding>
                    <Button component={RouterLink} to={'/'+text.toLowerCase()} sx={{ justifyContent: 'flex-start' }}>
                      {text}
                    </Button>
                  </ListItem>
                ))}
              </List>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="subtitle1" gutterBottom>Contato</Typography>
              <Typography variant="body2" color="textSecondary">
                contato@uspshare.com.br
              </Typography>
            </Grid>
          </Grid>
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="caption" color="textSecondary">
              © 2025 USPShare. Desenvolvido por estudantes da USP.
            </Typography>
          </Box>
        </Container>
      </Box>
    </>
  );
}