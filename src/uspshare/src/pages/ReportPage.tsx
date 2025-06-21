import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Alert,
  AlertTitle,
  Card,
  CardHeader,
  CardContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Divider,
  Stack,
  Link,
  InputAdornment,
  Avatar
} from "@mui/material";
import { LoadingButton } from "@mui/lab";

// Material-UI Icons
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import LinkIcon from "@mui/icons-material/Link";
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';

export default function ReportPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [reportType, setReportType] = useState("");
  const [contentType, setContentType] = useState("");
  const [contentUrl, setContentUrl] = useState("");
  const [contentId, setContentId] = useState("");
  const [description, setDescription] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (!agreeTerms) return;
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitted(true);
    setIsLoading(false);
  };

  if (isSubmitted) {
    return (
        <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
            <Alert severity="success" icon={<CheckCircleOutlineIcon fontSize="inherit" />} sx={{ p: 4, alignItems: 'center' }}>
                 <AlertTitle sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Denúncia enviada com sucesso!</AlertTitle>
                 Agradecemos por reportar este problema. Nossa equipe de moderação irá analisar sua denúncia e tomar as medidas necessárias.
            </Alert>
        </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
      <Stack spacing={4}>
        <Box>
          <Typography variant="h3" component="h1" fontWeight="bold">
            Reportar Problema
          </Typography>
          <Typography color="text.secondary">
            Utilize este formulário para reportar conteúdo inadequado, violações
            de direitos autorais ou outros problemas na plataforma.
          </Typography>
        </Box>

        <Alert severity="warning" icon={<InfoOutlinedIcon />}>
          Todas as denúncias são tratadas com confidencialidade e analisadas por
          nossa equipe de moderação. Agradecemos sua colaboração para manter a
          plataforma segura e respeitosa.
        </Alert>

        <Card>
          <CardHeader
            title="Formulário de Denúncia"
            subheader="Forneça informações detalhadas sobre o problema encontrado"
          />
          <CardContent>
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField fullWidth required id="name" label="Nome Completo" value={name} onChange={(e) => setName(e.target.value)} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField fullWidth required id="email" type="email" label="E-mail USP" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </Grid>
                </Grid>

                <FormControl fullWidth required>
                  <InputLabel id="report-type-label">Tipo de Denúncia</InputLabel>
                  <Select labelId="report-type-label" id="report-type" value={reportType} label="Tipo de Denúncia" onChange={(e) => setReportType(e.target.value)}>
                    <MenuItem value="copyright">Violação de Direitos Autorais</MenuItem>
                    <MenuItem value="inappropriate">Conteúdo Inadequado ou Ofensivo</MenuItem>
                    <MenuItem value="plagiarism">Plágio</MenuItem>
                    <MenuItem value="other">Outro</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth required>
                  <InputLabel id="content-type-label">Tipo de Conteúdo</InputLabel>
                  <Select labelId="content-type-label" id="content-type" value={contentType} label="Tipo de Conteúdo" onChange={(e) => setContentType(e.target.value)}>
                    <MenuItem value="material">Material Acadêmico</MenuItem>
                    <MenuItem value="comment">Comentário</MenuItem>
                    <MenuItem value="user">Perfil de Usuário</MenuItem>
                  </Select>
                </FormControl>

                 <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField 
                            fullWidth 
                            id="content-url" 
                            label="URL do Conteúdo" 
                            type="url"
                            value={contentUrl} 
                            onChange={(e) => setContentUrl(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                <InputAdornment position="start">
                                    <LinkIcon />
                                </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField fullWidth id="content-id" label="ID do Conteúdo (se conhecido)" value={contentId} onChange={(e) => setContentId(e.target.value)}/>
                    </Grid>
                 </Grid>

                <TextField
                  fullWidth
                  required
                  id="description"
                  label="Descrição Detalhada do Problema"
                  multiline
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva o problema com o máximo de detalhes possível..."
                />

                <FormControl required error={!agreeTerms && isLoading}>
                    <FormControlLabel
                        control={<Checkbox checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} name="terms" />}
                        label="Confirmo que as informações fornecidas são verdadeiras e precisas."
                    />
                </FormControl>

                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <LoadingButton
                    type="submit"
                    variant="contained"
                    size="large"
                    loading={isLoading}
                    loadingPosition="end"
                    endIcon={<FlagOutlinedIcon />}
                  >
                    <span>Enviar Denúncia</span>
                  </LoadingButton>
                </Box>
              </Stack>
            </Box>
          </CardContent>
        </Card>

        <Divider sx={{ my: 4 }} />
        
        <Stack spacing={4}>
            <Box>
                <Typography variant="h4" component="h2" fontWeight={600}>Processo de Moderação</Typography>
                <Typography color="text.secondary">Entenda como funciona nosso processo de análise:</Typography>
            </Box>
            <Grid container spacing={3}>
                {[
                    { title: 'Recebimento', description: 'Sua denúncia é registrada e você recebe uma confirmação com um número de protocolo.'},
                    { title: 'Análise', description: 'Nossa equipe de moderação verifica se há violação das diretrizes da plataforma.'},
                    { title: 'Resolução', description: 'Tomamos as medidas necessárias, como remoção do conteúdo ou advertência ao usuário.'},
                ].map((item, index) => (
                    <Grid size={{ xs: 12, md: 4}} key={item.title}>
                        <Card sx={{height: '100%'}}>
                            <CardContent sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', p:3}}>
                                <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.dark', mb: 2 }}>{index + 1}</Avatar>
                                <Typography variant="h6" gutterBottom>{item.title}</Typography>
                                <Typography variant="body2" color="text.secondary">{item.description}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
             <Alert severity="info" icon={<ShieldOutlinedIcon />}>
                Para sugestões ou feedback geral, por favor utilize nossa{" "}
                <Link component={RouterLink} to="/feedback" sx={{ fontWeight: 'bold' }}>
                    página de feedback
                </Link>
                .
            </Alert>
        </Stack>

      </Stack>
    </Container>
  );
}