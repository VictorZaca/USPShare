import React, { useState, useCallback, useEffect } from "react";
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
  Link,
  Autocomplete,
  Chip,
  Paper,
  IconButton,
  Avatar,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";

import apiClient from "../api/axios";
import useDebounce from "../hooks/useDebounce"

import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ClearIcon from "@mui/icons-material/Clear";
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Navigate } from "react-router-dom";

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onFileClear: () => void;
}

interface CourseOption {
  code: string;
  name: string;
}

interface ProfessorOption {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface TagOption {
  id: string;
  name: string;
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

export default function UploadPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");

  const [course, setCourse] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [professor, setProfessor] = useState<{ id: string; name: string; avatarUrl?: string } | null>(null);
  const [fileType, setFileType] = useState("");
  const [semester, setSemester] = useState("");
  const [isAnonymous, setIsAnonymous] =useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [uploadedFileId, setUploadedFileId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const [_error, setError] = useState<string | null>(null); 

  const [courseOptions, setCourseOptions] = useState<CourseOption[]>([]);
  const [professorOptions, setProfessorOptions] = useState<ProfessorOption[]>([]);
  const [tagOptions, setTagOptions] = useState<TagOption[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

  const debouncedDescription = useDebounce(descriptionInput, 500);

  useEffect(() => {
    setDescription(debouncedDescription);
  }, [debouncedDescription]);


  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setIsLoadingOptions(true);
        const [coursesRes, professorsRes, tagsRes] = await Promise.all([
          apiClient.get('/api/data/courses'),
          apiClient.get('/api/data/professors'),
          apiClient.get('/api/data/tags')
        ]);
        setCourseOptions(coursesRes.data || []);
        setProfessorOptions(professorsRes.data || []);
        setTagOptions(tagsRes.data || []);
      } catch (error) {
        console.error("Failed to fetch form options:", error);
      } finally {
        setIsLoadingOptions(false);
      }
    };
    fetchOptions();
  }, []);

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setError(null);

    if (!file || !title || !fileType || !course || !courseCode) {
      setError("Os campos com * são obrigatórios.");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();

    formData.append("file", file);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("course", course);
    formData.append("courseCode", courseCode);
    formData.append("fileType", fileType);
    formData.append("semester", semester);
    formData.append("isAnonymous", isAnonymous.toString());
    formData.append("tags", JSON.stringify(tags)); 

    if (professor) {
      formData.append("professorId", professor.id);
    }
    try {
      const response = await apiClient.post("/api/upload", formData);
      
      setUploadedFileId(response.data.id);
      setIsSubmitted(true);
    } 
    catch (err)
    {
      const errorMsg = (err as any).response?.data?.error || "Ocorreu um erro ao enviar o material.";
      setError(errorMsg);
      console.error(err);
    } 
    finally 
    {
      setIsLoading(false);
    }
  };
  
  if (isSubmitted) {
      return <Navigate replace to={`/file/${uploadedFileId}`} />;
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

              <TextField
                label="Descrição"
                multiline
                rows={3}
                fullWidth
                value={descriptionInput}
                onChange={(e) => setDescriptionInput(e.target.value)}
              />

              <Grid container spacing={3}>
                <Grid size={{xs: 12, md: 6}}>
                  <Autocomplete
                    options={courseOptions}
                    getOptionLabel={(option) => `${option.code} - ${option.name}`}
                    onChange={(_event, newValue) => {
                      if (newValue) {
                        setCourse(newValue.name);
                        setCourseCode(newValue.code);
                      } else {
                        setCourse("");
                        setCourseCode("");
                      }
                    }}
                    renderInput={(params) => <TextField {...params} label="Disciplina*" required />}
                    loading={isLoadingOptions}
                  />
                </Grid>
                <Grid size={{xs: 12, md: 6}}>
                <Autocomplete
                    freeSolo
                    options={professorOptions} 
                    getOptionLabel={(option) => typeof option === 'string' ? option : option.name} // Mostra o nome no campo
                    onChange={(_event, newValue) => {
                      setProfessor(newValue);
                    }}
                    renderOption={(props, option) => (
                        <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                            <Avatar src={`http://localhost:8080${option.avatarUrl}`} sx={{ mr: 1.5, width: 24, height: 24 }} />
                            {option.name}
                        </Box>
                    )}
                    renderInput={(params) => <TextField {...params} label="Professor" />}
                    loading={isLoadingOptions}
                />
                </Grid>
                <Grid size={{xs: 12, md: 6}}>
                     <FormControl fullWidth required>
                        <InputLabel id="semester-label">Semestre/Ano</InputLabel>
                        <Select labelId="semester-label" value={semester} label="Semestre/Ano" onChange={(e) => setSemester(e.target.value)}>
                            <MenuItem value="2025-1">2025/1</MenuItem>
                            <MenuItem value="2024-2">2024/2</MenuItem>
                            <MenuItem value="2024-1">2024/1</MenuItem>
                            <MenuItem value="2023-1">2023/1</MenuItem>
                            <MenuItem value="2023-2">2023/2</MenuItem>
                            <MenuItem value="2022-1">2022/1</MenuItem>
                            <MenuItem value="2022-2">2022/2</MenuItem>
                            <MenuItem value="2021-1">2021/1</MenuItem>
                            <MenuItem value="2021-2">2021/2</MenuItem>
                            <MenuItem value="2020-1">2020/1</MenuItem>
                            <MenuItem value="2020-2">2020/2</MenuItem>
                            <MenuItem value="2010-1">2019/1</MenuItem>
                            <MenuItem value="2019-2">2019/2</MenuItem>
                            <MenuItem value="2018-1">2018/1</MenuItem>
                            <MenuItem value="2018-2">2018/2</MenuItem>
                            <MenuItem value="2017-1">2017/1</MenuItem>
                            <MenuItem value="2017-2">2017/2</MenuItem>
                            <MenuItem value="2016-1">2016/1</MenuItem>
                            <MenuItem value="2016-2">2016/2</MenuItem>
                            <MenuItem value="2015-1">2015/1</MenuItem>
                            <MenuItem value="2015-2">2015/2</MenuItem>
                            <MenuItem value="2014-1">2014/1</MenuItem>
                            <MenuItem value="2014-2">2014/2</MenuItem>
                            <MenuItem value="2013-1">2013/1</MenuItem>
                            <MenuItem value="2013-2">2013/2</MenuItem>
                        </Select>
                    </FormControl>
                 </Grid>
              </Grid>

              <Autocomplete
                multiple
                freeSolo
                id="tags-input"
                options={tagOptions}
                value={tags}

                getOptionLabel={(option) => typeof option === 'string' ? option : option.name} 
                onChange={(_event, newValue) => {
                  const uniqueTags = [...new Set(newValue.map(tag => typeof tag === 'string' ? tag.trim() : tag.name.trim()).filter(Boolean))];                  
                  setTags(uniqueTags);
                }}

                renderValue={(value, getTagProps) => value.map((option, index) => (
                    <Chip variant="outlined" label={typeof option === 'string' ? option : option.name} {...getTagProps({ index })} />
                ))}
                renderInput={(params) => <TextField {...params} label="Tags" placeholder="Adicione ou selecione tags" />}
                loading={isLoadingOptions}
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