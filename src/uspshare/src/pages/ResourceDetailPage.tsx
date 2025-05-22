import React from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Button, Stack } from '@mui/material';

export default function ResourceDetailPage() {
  const { id } = useParams();
  return (
    <Box>
      <Button component={RouterLink} to="/resources">← Voltar</Button>
      <Typography variant="h4" gutterBottom>Recurso {id}</Typography>
      <Typography sx={{ mb: 2 }}>Disciplina: Exemplo • Autor: Fulano • 15/03/2025</Typography>
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Button variant="contained">Download</Button>
        <Button variant="outlined">Favoritar</Button>
        <Button variant="outlined">Avaliar ★★★★☆</Button>
      </Stack>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6">Descrição</Typography>
        <Typography>Descrição detalhada do recurso.</Typography>
      </Box>
      <Box>
        <Typography variant="h6">Comentários</Typography>
        <Typography>Maria: "Ótimo material!"</Typography>
      </Box>
    </Box>
  );
}