import { Box, Typography, Grid, Avatar } from "@mui/material"
import {
  PersonAddAlt1 as UserCheckIcon,
  Search as SearchIcon,
  CloudUpload as FileUpIcon,
  ArrowForward as ArrowRightIcon,
} from "@mui/icons-material"

export default function HowItWorks() {
  return (
    <Grid container spacing={4} mt={1}>
      <Grid size={ { xs: 12, md: 4 } }>
        <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
          <Avatar sx={{ bgcolor: "blue.100", color: "blue.600", width: 64, height: 64, mb: 2 }}>
            <UserCheckIcon fontSize="large" />
          </Avatar>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            1. Crie sua conta
          </Typography>
          <Typography color="text.secondary">
            Registre-se usando seu e-mail USP para ter acesso completo à plataforma.
          </Typography>
        </Box>
      </Grid>

      <Grid size={{ xs: 12, md: 4}} position="relative">
        <Box display={{ xs: "none", md: "block" }} position="absolute" top={32} width="100%">
          <ArrowRightIcon sx={{ color: "text.secondary", mx: "auto" }} />
        </Box>
        <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
          <Avatar sx={{ bgcolor: "blue.100", color: "blue.600", width: 64, height: 64, mb: 2 }}>
            <SearchIcon fontSize="large" />
          </Avatar>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            2. Explore materiais
          </Typography>
          <Typography color="text.secondary">
            Busque provas, listas e resumos por disciplina, professor ou código.
          </Typography>
        </Box>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }} position="relative">
        <Box display={{ xs: "none", md: "block" }} position="absolute" top={32} width="100%">
          <ArrowRightIcon sx={{ color: "text.secondary", mx: "auto" }} />
        </Box>
        <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
          <Avatar sx={{ bgcolor: "blue.100", color: "blue.600", width: 64, height: 64, mb: 2 }}>
            <FileUpIcon fontSize="large" />
          </Avatar>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            3. Compartilhe conhecimento
          </Typography>
          <Typography color="text.secondary">
            Contribua com seus próprios materiais e ajude outros estudantes.
          </Typography>
        </Box>
      </Grid>
    </Grid>
  )
}
