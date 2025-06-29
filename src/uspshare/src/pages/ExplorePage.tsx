// src/pages/ExplorePage.js

import { useEffect, useState } from 'react';
import apiClient from '../api/axios'; // Importe o cliente
import {
  Container,
  Typography,
  Box,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Drawer,
  List,
  ListItem,
  Checkbox,
  FormControlLabel,
  Chip,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Avatar
} from '@mui/material';
import {
    Search as SearchIcon,
    Tune as TuneIcon,
    ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { SubjectDetail } from '../components/subject-detail';

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [selectedFileType, setSelectedFileType] = useState("all");
  const [isFilterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0); 

  const [allResources, setAllResources] = useState<any[]>([]);
  const [_loading, setLoading] = useState(true);
  const [_error, setError] = useState<string | null>(null);

  interface FilterOptions {
    tags: { _id: string; name: string }[];
    professors: { _id: string; name: string; avatarUrl: string }[];
  }

  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    tags: [],
    professors: []
  });


  const subjectGroups = allResources.reduce((groups: Record<string, { courseCode: string; course: string; files: any[] }>, file) => {
    const key = file.courseCode;
    if (!groups[key]) {
      groups[key] = { courseCode: file.courseCode, course: file.course, files: [] };
    }
    groups[key].files.push(file);
    return groups;
  }, {});
  const subjects = Object.values(subjectGroups).sort((a, b) => a.courseCode.localeCompare(b.courseCode));

  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch =
      subject.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.courseCode.toLowerCase().includes(searchQuery.toLowerCase());
    const hasMatchingFileType =
      selectedFileType === "all" || subject.files.some((file) => file.type === selectedFileType);
    const hasMatchingFilters =
      activeFilters.length === 0 ||
      subject.files.some((file) =>
      activeFilters.some((filter) =>
        (file.tags && file.tags.includes(filter)) ||
        (file.semester && file.semester === filter) ||
        (file.professor && file.professor === filter)
      )
      );
      
    return matchesSearch && hasMatchingFileType && hasMatchingFilters;
  });


  let sortedAndFilteredSubjects = [...filteredSubjects];
  if (activeTab === 1) { 
    sortedAndFilteredSubjects.sort((a, b) => {
        const latestA = Math.max(...a.files.map(f => new Date(f.uploadDate).getTime()));
        const latestB = Math.max(...b.files.map(f => new Date(f.uploadDate).getTime()));
        return latestB - latestA;
    });
  } else if (activeTab === 2) { 
    sortedAndFilteredSubjects.sort((a, b) => {
        const likesA = a.files.reduce((sum, file) => sum + file.likes, 0);
        const likesB = b.files.reduce((sum, file) => sum + file.likes, 0);
        return likesB - likesA;
    });
  }

  const toggleFilter = (filter: string) => {
    setActiveFilters((prev) => (prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]));
  };

  const clearFilters = () => {
    setActiveFilters([]);
    setSelectedFileType("all");
  };

  const semesters = [
    { value: '2025-1', label: '2025-1' },
    { value: '2024-2', label: '2024-2' },
    { value: '2024-1', label: '2024-1' },
    { value: '2023-2', label: '2023-2' },
    { value: '2023-1', label: '2023-1' },
    { value: '2022-2', label: '2022-2' },
    { value: '2022-1', label: '2022-1' },
    { value: '2021-2', label: '2021-2' },
    { value: '2021-1', label: '2021-1' },
    { value: '2020-2', label: '2020-2' },
    { value: '2020-1', label: '2020-1' },
    { value: '2019-2', label: '2019-2' },
    { value: '2019-1', label: '2019-1' },
    { value: '2018-2', label: '2018-2' },
    { value: '2018-1', label: '2018-1' },
    { value: '2017-2', label: '2017-2' },
    { value: '2017-1', label: '2017-1' },
    { value: '2016-2', label: '2016-2' },
    { value: '2016-1', label: '2016-1' },
    { value: '2015-2', label: '2015-2' },
    { value: '2015-1', label: '2015-1' },
    { value: '2014-2', label: '2014-2' },
    { value: '2014-1', label: '2014-1' },
    { value: '2013-2', label: '2013-2' },
    { value: '2013-1', label: '2013-1' },
  ]

  const handleSubjectAccordionChange = (panel: string) => (_event: any, isExpanded: boolean) => {
    setExpandedSubject(isExpanded ? panel : null);
  };

  useEffect(() => {
    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [
              resourcesRes, 
              tagsRes, 
              profsRes, 
            ] = await Promise.all([
              apiClient.get('/api/resources'),
              apiClient.get('/api/data/tags'),
              apiClient.get('/api/data/professors'),
            ]);

            setAllResources(resourcesRes.data || []);
            setFilterOptions({
              tags: tagsRes.data || [],
              professors: profsRes.data || [],
            });

        } catch (err) {
            setError('Não foi possível carregar os materiais.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    fetchInitialData();
  }, []); 

  return (
    <Container sx={{ py: 4 }}>
      <Stack spacing={2}>
        <Typography variant="h3" component="h1" fontWeight="bold">
          Explorar Materiais
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Encontre provas, listas, resumos e outros materiais compartilhados pela comunidade USP
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar por disciplina ou código..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Stack direction="row" spacing={1}>
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>Tipo de Material</InputLabel>
              <Select
                value={selectedFileType}
                label="Tipo de Material"
                onChange={(e) => setSelectedFileType(e.target.value)}
              >
                <MenuItem value="all">Todos os Tipos</MenuItem>
                <MenuItem value="prova">Provas</MenuItem>
                <MenuItem value="lista">Listas</MenuItem>
                <MenuItem value="resumo">Resumos</MenuItem>
                <MenuItem value="enunciado">Enunciados</MenuItem>
              </Select>
            </FormControl>
            <Button variant="outlined" startIcon={<TuneIcon />} onClick={() => setFilterDrawerOpen(true)}>
                Filtros
            </Button>
          </Stack>
        </Stack>

        {activeFilters.length > 0 && (
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {activeFilters.map((filter) => (
              <Chip
                key={filter}
                label={filter}
                onDelete={() => toggleFilter(filter)}
                color="primary"
                variant="outlined"
              />
            ))}
            <Button variant="text" size="small" onClick={clearFilters}>
              Limpar todos
            </Button>
          </Stack>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}>
            <Tabs value={activeTab} onChange={(_e, newValue) => setActiveTab(newValue)}>
                <Tab label="Mais Relevantes" />
                <Tab label="Mais Recentes" />
                <Tab label="Mais Populares" />
            </Tabs>
        </Box>
        <Box sx={{ pt: 3 }}>
          {sortedAndFilteredSubjects.length > 0 ? (
            <Stack spacing={2}>
              {sortedAndFilteredSubjects.map((subject) => (
                <Accordion 
                    key={subject.courseCode}
                    expanded={expandedSubject === subject.courseCode}
                    onChange={handleSubjectAccordionChange(subject.courseCode)}
                >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography fontWeight="medium">{`${subject.courseCode} - ${subject.course}`}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                       <SubjectDetail 
                         subject={subject}
                         selectedFileType={selectedFileType}
                         activeFilters={activeFilters}
                         sortBy={activeTab === 1 ? 'recent' : activeTab === 2 ? 'popular' : 'default'}
                       />
                    </AccordionDetails>
                </Accordion>
              ))}
            </Stack>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6">Nenhuma disciplina encontrada</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Tente ajustar seus filtros ou buscar por outro termo
              </Typography>
            </Box>
          )}
        </Box>
      </Stack>

      <Drawer anchor="right" open={isFilterDrawerOpen} onClose={() => setFilterDrawerOpen(false)}>
        <Box sx={{ width: 300, p: 3 }} role="presentation">
          <Typography variant="h6" component="h2" gutterBottom>Filtros Avançados</Typography>
          
          <Stack spacing={4} sx={{mt: 4}}>
            <Box>
              <Typography variant="subtitle2" component="h3" fontWeight="bold">Semestre/Ano</Typography>
              <List dense>
                {semesters.map(option => (
                  <ListItem key={option.value} disablePadding>
                    <FormControlLabel
                      control={<Checkbox checked={activeFilters.includes(option.value)} onChange={() => toggleFilter(option.value)} />}
                      label={option.label}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>

            <Box>
              <Typography variant="subtitle2" component="h3" fontWeight="bold">Tags</Typography>
              <List dense>
                {filterOptions.tags.map(option => (
                  <ListItem key={option._id} disablePadding>
                    <FormControlLabel
                      control={<Checkbox checked={activeFilters.includes(option.name)} onChange={() => toggleFilter(option.name)} />}
                      label={option.name}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" component="h3" fontWeight="bold">Professores</Typography>
              <List dense>
                {filterOptions.professors.map(option => (
                  <ListItem key={option._id} disablePadding>
                    <Avatar src={`http://localhost:8080`+option.avatarUrl} alt={option.name} sx={{ width: 24, height: 24, mr: 1 }} />
                    <FormControlLabel
                      control={<Checkbox checked={activeFilters.includes(option.name)} onChange={() => toggleFilter(option.name)} />}
                      label={option.name}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Stack>

          <Button onClick={clearFilters} variant="outlined" fullWidth sx={{ mt: 4 }}>
            Limpar Filtros
          </Button>
        </Box>
      </Drawer>

    </Container>
  );
}