import React, { useState, useMemo, FC, SyntheticEvent } from 'react';
import { Box, Typography, Grid, Paper, Tabs, Tab, Button, Stack } from '@mui/material';

// --- ALTERAÇÃO: Importando os componentes necessários ---
// 1. O card que exibe cada arquivo individualmente
import { FileCard } from './file-card'; 
// 2. O Link do React Router para navegação
import { Link as RouterLink } from 'react-router-dom';

// --- Interfaces (sem alterações) ---
interface File {
  id: string;
  title: string;
  type: string;
  course: string;
  courseCode: string;
  professor: string;
  semester: string;
  uploadDate: string;
  tags?: string[];
  likes: number;
  comments: number;
}

interface SubjectDetailProps {
  subject: {
    courseCode: string;
    course: string;
    files: File[];
  };
  selectedFileType: string;
  activeFilters: string[];
  sortBy?: "recent" | "popular" | "default";
}

// --- O Componente Principal ---
export const SubjectDetail: FC<SubjectDetailProps> = ({
  subject, // Agora recebe os dados reais via props
  selectedFileType,
  activeFilters,
  sortBy = "default",
}) => {
  // Toda a sua lógica interna de estado e filtragem permanece a mesma.
  const [activeTab, setActiveTab] = useState<string>("all");
  const [showAll, setShowAll] = useState(false);

  const filteredAndSortedFiles = useMemo(() => {
    let files = subject.files.filter((file) => {
      const matchesTypeFromParent = selectedFileType === "all" || file.type === selectedFileType;
      const matchesActiveTab = activeTab === "all" || file.type === activeTab;
      const matchesFilters = activeFilters.length === 0 || activeFilters.some((filter) => file.tags ? file.tags.includes(filter) : false);
      return matchesTypeFromParent && matchesActiveTab && matchesFilters;
    });

    if (sortBy === "recent") {
      files.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
    } else if (sortBy === "popular") {
      files.sort((a, b) => b.likes - a.likes);
    }
    return files;
  }, [subject.files, selectedFileType, activeTab, activeFilters, sortBy]);

  const fileTypesInSubject = useMemo(() => {
    const counts: Record<string, number> = {};
    subject.files.forEach(file => {
      counts[file.type] = (counts[file.type] || 0) + 1;
    });
    return Object.entries(counts).map(([type, count]) => ({ type, count }));
  }, [subject.files]);

  const handleTabChange = (event: SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };
  
  const displayedFiles = showAll ? filteredAndSortedFiles : filteredAndSortedFiles.slice(0, 6);
  const hasMoreFiles = filteredAndSortedFiles.length > 6 && !showAll;

  return (
    <Paper 
      variant="outlined" 
      sx={{ p: 2, mt: 1, bgcolor: 'action.hover', overflow: 'hidden' }}
    >
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab label={`Todos (${filteredAndSortedFiles.length})`} value="all" />
          {fileTypesInSubject.map(({ type, count }) => (
            <Tab
              key={type}
              label={`${type.charAt(0).toUpperCase() + type.slice(1)}s (${count})`}
              value={type}
            />
          ))}
        </Tabs>
      </Box>

      {displayedFiles.length > 0 ? (
        <Stack spacing={3}>
          <Grid container spacing={2}>
            {displayedFiles.map((file) => (
              <Grid key={file.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                {/* O FileCard agora é um link para a página de detalhes do arquivo */}
                <RouterLink to={`/file/${file.id}`} style={{ textDecoration: 'none' }}>
                  <FileCard file={{ ...file, tags: file.tags || [] }} />
                </RouterLink>
              </Grid>
            ))}
          </Grid>
          
          {hasMoreFiles && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button variant="outlined" onClick={() => setShowAll(true)}>
                Ver todos os {filteredAndSortedFiles.length} materiais
              </Button>
            </Box>
          )}

          {showAll && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button variant="outlined" onClick={() => setShowAll(false)}>
                Mostrar menos
              </Button>
            </Box>
          )}
        </Stack>
      ) : (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography color="text.secondary">Nenhum material encontrado com os filtros selecionados.</Typography>
        </Box>
      )}
    </Paper>
  );
};