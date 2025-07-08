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
import { Link as RouterLink } from 'react-router-dom';

import MenuBookIcon from '@mui/icons-material/MenuBook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import GitHubIcon from '@mui/icons-material/GitHub';

export const footerSections = [
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
                      component={link.path ? RouterLink : 'a'}
                      to={link.path}      
                      href={link.href}    
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