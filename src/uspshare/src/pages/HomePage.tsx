import React from 'react';
import { Box, Typography, TextField, Grid, Card, CardContent } from '@mui/material';

export default function HomePage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Bem-vindo ao USPShare</Typography>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Buscar provas, resumos, exercícios..."
        sx={{ mb: 3 }}
      />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="h6">Provas Recentes</Typography>
                <Typography>Prova P1 - Algoritmos 1</Typography>
              </CardContent>
            </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">Resumos Populares</Typography>
              <Typography>Resumo de Estruturas de Dados</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">Exercícios em Alta</Typography>
              <Typography>Lista - Cálculo II</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}