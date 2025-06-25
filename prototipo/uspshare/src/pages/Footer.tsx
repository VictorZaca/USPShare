// src/components/Footer.js


import {
  Box,
  Container,
  Grid,
  Typography,
  Link as MuiLink,
  IconButton,
  Divider,
  Stack
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom'; // Import do Link do React Router

// Ícones do Material-UI
import MenuBookIcon from '@mui/icons-material/MenuBook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import GitHubIcon from '@mui/icons-material/GitHub';

// Dados para os links para facilitar a manutenção
const footerSections = [
  {
    title: 'Navegação',
    links: [
      { label: 'Página Inicial', path: '/' },
      { label: 'Explorar Materiais', path: '/explore' },
      { label: 'Compartilhar Material', path: '/upload' },
      { label: 'Sobre o USPShare', path: '/about' },
    ],
  },
  {
    title: 'Recursos',
    links: [
      { label: 'Perguntas Frequentes', path: '/faq' },
      { label: 'Guia de Uso', path: '/guide' },
      { label: 'Termos de Uso', path: '/terms' },
      { label: 'Política de Privacidade', path: '/privacy' },
    ],
  },
  {
    title: 'Contato',
    links: [
      { label: 'Fale Conosco', path: '/contact' },
      { label: 'Reportar Problema', path: '/report' },
      { label: 'Enviar Feedback', path: '/feedback' },
      // Link externo usa tag 'a' normal, então não precisa de 'path'
      { label: 'contato@uspshare.com.br', href: 'mailto:contato@uspshare.com.br' },
    ],
  },
];

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        borderTop: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Container sx={{ py: 6 }}>
        <Grid container spacing={5}>
          {/* Coluna 1: Logo, Descrição e Redes Sociais */}
          <Grid size={{ xs: 12, md: 4, lg: 4 }}>
            <Stack spacing={2}>
              <MuiLink
                component={RouterLink}
                to="/"
                underline="none"
                color="inherit"
                sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}
              >
                <MenuBookIcon sx={{ fontSize: '28px' }} />
                <Typography variant="h5" component="span" fontWeight="bold">
                  USPShare
                </Typography>
              </MuiLink>
              <Typography variant="body2" color="text.secondary">
                Uma plataforma colaborativa para compartilhamento de materiais acadêmicos entre estudantes da Universidade de São Paulo.
              </Typography>
              <Stack direction="row" spacing={1}>
                {/* Links de redes sociais são externos, então usam a tag 'a' */}
                <IconButton component="a" href="https://twitter.com" target="_blank" aria-label="Twitter" color="inherit">
                  <TwitterIcon />
                </IconButton>
                <IconButton component="a" href="https://instagram.com" target="_blank" aria-label="Instagram" color="inherit">
                  <InstagramIcon />
                </IconButton>
                <IconButton component="a" href="https://github.com" target="_blank" aria-label="GitHub" color="inherit">
                  <GitHubIcon />
                </IconButton>
              </Stack>
            </Stack>
          </Grid>

          {/* Colunas 2, 3 e 4: Links de Navegação */}
          {footerSections.map((section) => (
            <Grid size={{ xs: 12, sm: 4, md: 2.6, lg: 2.6}} key={section.title}>
              <Stack spacing={2}>
                <Typography variant="subtitle1" fontWeight="medium" component="h3">
                  {section.title}
                </Typography>
                <Stack spacing={1}>
                  {section.links.map((link) => (
                    <MuiLink
                      key={link.label}
                      // Se o link tiver 'path', usa o RouterLink. Se tiver 'href', usa uma tag 'a'.
                      component={link.path ? RouterLink : 'a'}
                      to={link.path}      // Para React Router
                      href={link.href}    // Para links padrão <a>
                      variant="body2"
                      underline="hover"
                      color="text.secondary"
                      sx={{ transition: 'color 0.2s', '&:hover': { color: 'text.primary' } }}
                    >
                      {link.label}
                    </MuiLink>
                  ))}
                </Stack>
              </Stack>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            &copy; {new Date().getFullYear()} USPShare. Todos os direitos reservados.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Desenvolvido por e para estudantes da USP.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}