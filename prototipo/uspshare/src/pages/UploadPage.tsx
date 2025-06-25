import React, { useState, useCallback } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Button,
  Stack,
  Alert,
  AlertTitle,
  Link,
  Autocomplete,
  Chip,
  Paper,
  IconButton,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";

import apiClient from "../api/axios";

// Material-UI Icons
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ClearIcon from "@mui/icons-material/Clear";
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';

// --- A more advanced File Uploader Component ---
interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onFileClear: () => void;
}

const FileDropzone: React.FC<FileDropzoneProps> = ({ onFileSelect, selectedFile, onFileClear }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: { preventDefault: () => void; stopPropagation: () => void; }) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: { preventDefault: () => void; stopPropagation: () => void; }) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e: { preventDefault: () => void; stopPropagation: () => void; }) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  }, [onFileSelect]);

  return (
    <Paper
      variant="outlined"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      component="label"
      htmlFor="file-upload-input"
      sx={{
        p: 3,
        textAlign: "center",
        cursor: "pointer",
        borderStyle: "dashed",
        borderColor: isDragging ? "primary.main" : "divider",
        bgcolor: isDragging ? "action.hover" : "transparent",
        transition: "background-color 0.2s, border-color 0.2s",
      }}
    >
      <input type="file" id="file-upload-input" hidden onChange={(e) => { if (e.target.files) { onFileSelect(e.target.files[0]); } }} />
      {selectedFile ? (
        <Stack direction="row" alignItems="center" justifyContent="center" spacing={2}>
            <InsertDriveFileOutlinedIcon color="primary" />
            <Typography>{selectedFile.name}</Typography>
            <IconButton size="small" onClick={(e) => { e.preventDefault(); onFileClear(); }}>
                <ClearIcon />
            </IconButton>
        </Stack>
      ) : (
        <Stack alignItems="center" spacing={1}>
          <CloudUploadIcon color="action" sx={{ fontSize: 48 }} />
          <Typography>Arraste e solte o arquivo aqui</Typography>
          <Typography variant="body2" color="text.secondary">ou</Typography>
          <Button variant="text">Selecione o Arquivo</Button>
        </Stack>
      )}
    </Paper>
  );
};


// --- Main Upload Page Component ---
export default function UploadPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [course, setCourse] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [professor, setProfessor] = useState("");
  const [fileType, setFileType] = useState("");
  const [semester, setSemester] = useState("");
  const [isAnonymous, setIsAnonymous] =useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);



  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
            // Limpa erros antigos

    // Validação simples no frontend
    if (!file || !title || !fileType || !course || !courseCode) {
      console.error("Os campos com * são obrigatórios.");
      return;
    }

    setIsLoading(true);

    // 1. Criar um objeto FormData
    const formData = new FormData();

    // 2. Adicionar o arquivo e todos os campos do formulário ao FormData
    // Os nomes ("file", "title", etc.) devem bater com o que o backend espera
    formData.append("file", file);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("course", course);
    formData.append("courseCode", courseCode);
    formData.append("professor", professor);
    formData.append("fileType", fileType);
    formData.append("semester", semester);
    formData.append("isAnonymous", isAnonymous.toString());
    formData.append("tags", JSON.stringify(tags)); // Enviamos o array de tags como uma string JSON

    try {
      // 3. Enviar o FormData para o endpoint de upload protegido
      // Axios vai configurar o 'Content-Type: multipart/form-data' automaticamente
      await apiClient.post("/api/upload", formData);
      
      setIsSubmitted(true); // Mostra a tela de sucesso
    } 
    catch (err)
    {
      const errorMsg = (err as any).response?.data?.error || "Ocorreu um erro ao enviar o material.";
      console.error(errorMsg);
      console.error(err);
    } 
    finally 
    {
      setIsLoading(false);
    }
  };
  
  if (isSubmitted) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="success" icon={<CheckCircleOutlineIcon fontSize="inherit" />} sx={{ p: 3 }}>
          <AlertTitle sx={{ fontWeight: 'bold' }}>Material enviado com sucesso!</AlertTitle>
          Obrigado por contribuir! Seu material será revisado e estará disponível em breve.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
      <Stack spacing={2} sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" fontWeight="bold">Compartilhar Material</Typography>
        <Typography color="text.secondary">Contribua com a comunidade USP compartilhando seus materiais de estudo.</Typography>
      </Stack>

      <Box component="form" onSubmit={handleSubmit}>
        <Card>
          <CardHeader title="Informações do Material" subheader="Preencha os detalhes do material que você está compartilhando" />
          <CardContent>
            <Stack spacing={4}>
              <FormControl fullWidth required>
                <Typography component="label" variant="body2" fontWeight="medium" sx={{ mb: 1 }}>Arquivo*</Typography>
                <FileDropzone selectedFile={file} onFileSelect={(file: File) => setFile(file)} onFileClear={() => setFile(null)} />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                    Formatos aceitos: PDF, DOCX, JPG, PNG (máx. 10MB)
                </Typography>
              </FormControl>
              
              <Grid container spacing={3}>
                <Grid size={{xs: 12, md: 6}}><TextField fullWidth required label="Título do Material" value={title} onChange={(e) => setTitle(e.target.value)} /></Grid>
                <Grid size={{xs: 12, md: 6}}>
                  <FormControl fullWidth required>
                    <InputLabel id="file-type-label">Tipo de Material</InputLabel>
                    <Select labelId="file-type-label" value={fileType} label="Tipo de Material" onChange={(e) => setFileType(e.target.value)}>
                      <MenuItem value="prova">Prova</MenuItem>
                      <MenuItem value="lista">Lista de Exercícios</MenuItem>
                      <MenuItem value="resumo">Resumo</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <TextField label="Descrição" multiline rows={3} fullWidth value={description} onChange={(e) => setDescription(e.target.value)} />

              <Grid container spacing={3}>
                <Grid size={{xs: 12, md: 6}}><TextField fullWidth required label="Nome da Disciplina" value={course} onChange={(e) => setCourse(e.target.value)} /></Grid>
                <Grid size={{xs: 12, md: 6}}><TextField fullWidth required label="Código da Disciplina" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} /></Grid>
                <Grid size={{xs: 12, md: 6}}><TextField fullWidth label="Professor" value={professor} onChange={(e) => setProfessor(e.target.value)} /></Grid>
                <Grid size={{xs: 12, md: 6}}>
                     <FormControl fullWidth required>
                        <InputLabel id="semester-label">Semestre/Ano</InputLabel>
                        <Select labelId="semester-label" value={semester} label="Semestre/Ano" onChange={(e) => setSemester(e.target.value)}>
                            <MenuItem value="2025-1">2025/1</MenuItem>
                            <MenuItem value="2024-2">2024/2</MenuItem>
                            <MenuItem value="2024-1">2024/1</MenuItem>
                        </Select>
                    </FormControl>
                 </Grid>
              </Grid>

              <Autocomplete
                multiple
                freeSolo // Permite que o usuário digite valores que não estão na lista de opções
                id="tags-input"
                options={[]} // Não temos sugestões pré-definidas, então é um array vazio
                value={tags} // O valor do componente é controlado pelo nosso estado 'tags'
                onChange={(_event, newValue) => {
                  // Esta função é chamada quando uma tag é adicionada (com Enter) ou removida.
                  // 'newValue' é o novo array de tags.
                  setTags(newValue);
                }}
                renderValue={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tags"
                    // --- MUDANÇA PRINCIPAL AQUI (DICA PARA O USUÁRIO) ---
                    placeholder="Adicione tags e pressione Enter"
                  />
                )}
              />

              
              <FormControlLabel
                control={<Switch checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />}
                label={
                    <Box>
                        <Typography>Compartilhar Anonimamente</Typography>
                        <Typography variant="caption" color="text.secondary">Seu nome não será exibido no material.</Typography>
                    </Box>
                }
              />
              <Alert severity="info" icon={<InfoOutlinedIcon />}>
                Ao enviar, você confirma que o material não viola direitos autorais e concorda com nossos{" "}
                <Link component={RouterLink} to="/terms" sx={{ fontWeight: 'bold' }}>termos de uso</Link>.
              </Alert>
            </Stack>
          </CardContent>
          <CardActions sx={{ p: 2, justifyContent: 'flex-end', gap: 2 }}>
            <Button type="button" variant="text" disabled={isLoading}>Cancelar</Button>
            <LoadingButton type="submit" variant="contained" loading={isLoading}>
              <span>Enviar Material</span>
            </LoadingButton>
          </CardActions>
        </Card>
      </Box>
    </Container>
  );
}