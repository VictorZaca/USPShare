import { useState, useEffect, FC } from 'react';
import { Container, Typography, Box, Tabs, Tab, Paper, List, ListItem, ListItemText, IconButton, TextField, Button, Stack, CircularProgress, ListItemAvatar, Avatar } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import apiClient from '../api/axios';

interface Tag { id: string; name: string; }
interface Course { id: string; code: string; name: string; }
interface Professor { id: string; name: string; avatarUrl: string; }

const ProfessorManagementSection: FC<{ items: Professor[]; onAdd: (name: string, avatar: File | null) => Promise<void>; onDelete: (id: string) => Promise<void>; }> = 
({ items, onAdd, onDelete }) => {
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);

  const handleAdd = async () => {
    await onAdd(name, avatar);
    setName("");
    setAvatar(null);
  };

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Gerenciar Professores</Typography>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }} alignItems="center">
        <TextField label="Nome do Professor" value={name} onChange={(e) => setName(e.target.value)} size="small" />
        <Button variant="outlined" component="label" size="small">
          {avatar ? "Avatar Selecionado" : "Escolher Avatar"}
          <input type="file" hidden accept="image/*" onChange={(e) => e.target.files && setAvatar(e.target.files[0])} />
        </Button>
        <Button variant="contained" onClick={handleAdd} disabled={!name}>Adicionar</Button>
      </Stack>
      <List>
        {items.map(prof => (
          <ListItem key={prof.id} secondaryAction={<IconButton edge="end" onClick={() => onDelete(prof.id)}><DeleteIcon /></IconButton>}>
            <ListItemAvatar><Avatar src={`http://localhost:8080${prof.avatarUrl}`} /></ListItemAvatar>
            <ListItemText primary={prof.name} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

const ManagementSection: FC<{
  title: string;
  items: any[];
  onAdd: (name: string, secondary?: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  addFields: { primary: string; secondary?: string };
}> = ({ title, items, onAdd, onDelete, addFields }) => {
  const [primaryField, setPrimaryField] = useState("");
  const [secondaryField, setSecondaryField] = useState("");

  const handleAddItem = async () => {
    await onAdd(primaryField, secondaryField);
    setPrimaryField("");
    setSecondaryField("");
  };

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>{title}</Typography>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField label={addFields.primary} value={primaryField} onChange={(e) => setPrimaryField(e.target.value)} size="small" />
        {addFields.secondary && <TextField label={addFields.secondary} value={secondaryField} onChange={(e) => setSecondaryField(e.target.value)} size="small" />}
        <Button variant="contained" onClick={handleAddItem} disabled={!primaryField}>Adicionar</Button>
      </Stack>
      <List>
        {items.map(item => (
          <ListItem key={item.id} secondaryAction={<IconButton edge="end" onClick={() => onDelete(item.id)}><DeleteIcon /></IconButton>}>
            <ListItemText primary={item.name} secondary={item.code} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};


export default function AdminPage() {
  const [tabValue, setTabValue] = useState(0);
  const [tags, setTags] = useState<Tag[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchData = async () => {
    setLoading(true);
    const [tagsRes, coursesRes, profsRes] = await Promise.all([
      apiClient.get('/api/data/tags'),
      apiClient.get('/api/data/courses'),
      apiClient.get('/api/data/professors')
    ]);
    console.log("Professores:", profsRes.data);
    setTags(tagsRes.data || []);
    setCourses(coursesRes.data || []);
    setProfessors(profsRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);
  
  const handleDelete = (entity: string) => async (id: string) => {
    if (window.confirm(`Tem certeza que quer deletar este item?`)) {
      await apiClient.delete(`/api/admin/${entity}/${id}`);
      fetchData(); 
    }
  };
  
  const handleAdd = (entity: string) => async (primary: string, secondary?: string) => {
    await apiClient.post(`/api/admin/${entity}`, { name: primary, code: secondary });
    fetchData();
  };

  const handleAddProfessor = async (name: string, avatar: File | null) => {
    const formData = new FormData();
    formData.append('name', name);
    if (avatar) {
      formData.append('avatar', avatar);
    }
    await apiClient.post('/api/admin/professors', formData);
    fetchData();
  };


  if (loading) return <CircularProgress />;

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Painel de Administração</Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="Matérias" />
          <Tab label="Professores" />
          <Tab label="Tags" />
        </Tabs>
      </Box>
      {tabValue === 0 && <ManagementSection title="Gerenciar Matérias" items={courses} onAdd={handleAdd('courses')} onDelete={handleDelete('courses')} addFields={{ primary: 'Nome da Matéria', secondary: 'Código' }} />}
      {tabValue === 1 && <ProfessorManagementSection items={professors} onAdd={handleAddProfessor} onDelete={handleDelete('professors')} />}
      {tabValue === 2 && <ManagementSection title="Gerenciar Tags" items={tags} onAdd={handleAdd('tags')} onDelete={handleDelete('tags')} addFields={{ primary: 'Nome da Tag' }} />}
    </Container>
  );
}