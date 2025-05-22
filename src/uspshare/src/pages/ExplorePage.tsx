import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const coursesData = [
  {
    title: 'Bioquímica',
    code: 'BIO0305',
    materials: 1,
    professors: 1,
    badges: ['resumo']
  },
  { title: 'Direito Constitucional', code: 'DIR0101', materials: 1, professors: 1, badges: ['resumo'] },
  { title: 'Física II', code: 'FIS0202', materials: 1, professors: 1, badges: ['lista'] },
  { title: 'Algoritmos', code: 'MAC0121', materials: 1, professors: 1, badges: ['prova'] },
  { title: 'Cálculo I', code: 'MAT0101', materials: 1, professors: 1, badges: ['prova'] },
  { title: 'Química Orgânica', code: 'QUI0203', materials: 1, professors: 1, badges: ['lista'] }
];

export default function ExplorePage() {
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event: any, newValue: React.SetStateAction<number>) => {
    setTabIndex(newValue);
  };

  // Filtered datasets could be derived based on tabIndex
  const displayedCourses = tabIndex === 0
    ? coursesData
    : [];

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Explorar Materiais</Typography>
      <Typography color="textSecondary">Encontre provas, listas, resumos e outros materiais compartilhados pela comunidade USP</Typography>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mt: 3 }}>
        <TextField
          fullWidth
          placeholder="Buscar por disciplina ou código..."
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            )
          }}
        />
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="type-filter-label">Tipo</InputLabel>
          <Select
            labelId="type-filter-label"
            label="Tipo"
            defaultValue=""
          >
            <MenuItem value="">Todos os Tipos</MenuItem>
            <MenuItem value="anotacoes">Anotações</MenuItem>
            <MenuItem value="provas">Provas</MenuItem>
            <MenuItem value="resumos">Resumos</MenuItem>
            <MenuItem value="listas">Listas</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          sx={{ whiteSpace: 'nowrap' }}
        >
          Filtros
        </Button>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Tabs value={tabIndex} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
          <Tab label="Mais Relevantes" />
          <Tab label="Mais Recentes" />
          <Tab label="Mais Populares" />
        </Tabs>
      </Box>

      <Box sx={{ mt: 2 }}>
        {tabIndex === 0 && (
          <Stack spacing={2}>
            {displayedCourses.map((course) => (
              <Card key={course.code} variant="outlined" sx={{ cursor: 'pointer' }}>
                <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="h6">{course.title}</Typography>
                      <Chip label={course.code} size="small" />
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, fontSize: '0.875rem', color: 'text.secondary', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography>{course.materials} materiais</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography>{course.professors} professor{course.professors > 1 ? 'es' : ''}</Typography>
                      </Box>
                      {course.badges.map((b) => (
                        <Chip key={b} label={b} size="small" color="secondary" />
                      ))}
                    </Box>
                  </Box>
                  <ChevronRightIcon />
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
        {tabIndex > 0 && (
          <Typography color="textSecondary">Em breve...</Typography>
        )}
      </Box>
    </Container>
  );
}
