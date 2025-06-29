import { Box, FormControl, InputLabel, Select, MenuItem, Grid, Card, CardContent, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export default function ResourceListPage() {
  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Tipo</InputLabel>
          <Select label="Tipo">
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="notas">Anotações</MenuItem>
            <MenuItem value="provas">Provas</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Disciplina</InputLabel>
          <Select label="Disciplina">
            <MenuItem value="algoritmos">Algoritmos</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Semestre</InputLabel>
          <Select label="Semestre">
            <MenuItem value="2025/1">2025/1</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Ordenar</InputLabel>
          <Select label="Ordenar">
            <MenuItem value="recentes">Mais Recentes</MenuItem>
            <MenuItem value="avaliados">Melhor Avaliados</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Grid container spacing={2}>
        {[1,2,3,4].map(id => (
          <Grid size={{ xs: 12, md: 6 }} key={id}>
            <Card>
              <CardContent>
                <Typography component={RouterLink} to={`/resources/${id}`} variant="h6" sx={{ textDecoration: 'none' }}>Recurso {id}</Typography>
                <Typography>Disciplina Exemplo</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}