import React, { useState } from "react";
import {
  Container,
  Typography,
  Alert,
  Tabs,
  Tab,
  Box,
  Link,
  Card,
  CardHeader,
  CardContent,
  Grid,
  Stack,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  SxProps,
  Theme
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

// Material-UI Icons
import InfoIcon from "@mui/icons-material/Info";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import BlockIcon from "@mui/icons-material/Block";


// Helper component for Tab Panels, as recommended by MUI docs
function TabPanel(props: { [x: string]: any; children: any; value: any; index: any; }) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`guide-tabpanel-${index}`}
      aria-labelledby={`guide-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 4 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Helper to generate accessibility props for tabs
function a11yProps(index: string) {
  return {
    id: `guide-tab-${index}`,
    "aria-controls": `guide-tabpanel-${index}`,
  };
}

// Main Component
export default function GuidePage() {
  const [tabValue, setTabValue] = useState("getting-started");

  const handleTabChange = (_event: any, newValue: React.SetStateAction<string>) => {
    setTabValue(newValue);
  };
  const PlaceholderImage = ({ src, alt, sx }: { src: string; alt: string; sx?: SxProps<Theme> }) => (
  // Helper for creating placeholder images
    <Box
      component="img"
      src={src}
      alt={alt}
      sx={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        ...sx
      }}
    />
  );
  
  // Helper for creating numbered list items with a custom icon
  const NumberedListItem = ({ number, title, description }: { number: number, title: string, description: string }) => (
    <Stack direction="row" spacing={2} alignItems="center">
      <Avatar sx={{ bgcolor: "primary.light", color: "primary.dark", width: 32, height: 32 }}>
        <Typography variant="body1" fontWeight="bold">{number}</Typography>
      </Avatar>
      <Box>
        <Typography fontWeight="medium">{title}</Typography>
        <Typography color="text.secondary">{description}</Typography>
      </Box>
    </Stack>
  );

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
      <Box sx={{ maxWidth: "896px", mx: "auto" }}>
        <Stack spacing={2}>
          <Typography variant="h3" component="h1" fontWeight="bold">
            Guia de Uso
          </Typography>
          <Typography color="text.secondary">
            Aprenda a utilizar todos os recursos do USPShare para aproveitar ao máximo a plataforma.
          </Typography>
        </Stack>

        <Alert
          severity="info"
          icon={<InfoIcon />}
          sx={{ mt: 4, bgcolor: 'info.lightest' }} // Custom color similar to original
        >
          Este guia foi criado para ajudar novos usuários a entender como utilizar o USPShare. Se você tiver dúvidas
          adicionais, consulte nossa página de{" "}
          <Link component={RouterLink} to="/faq" underline="hover">
            Perguntas Frequentes
          </Link>
          .
        </Alert>

        <Box sx={{ width: "100%", mt: 6 }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="Seções do Guia"
            >
              <Tab label="Primeiros Passos" value="getting-started" {...a11yProps("getting-started")} />
              <Tab label="Compartilhando" value="uploading" {...a11yProps("uploading")} />
              <Tab label="Buscando" value="searching" {...a11yProps("searching")} />
              <Tab label="Interagindo" value="interacting" {...a11yProps("interacting")} />
              <Tab label="Seu Perfil" value="profile" {...a11yProps("profile")} />
            </Tabs>
          </Box>

          {/* Getting Started Panel */}
          <TabPanel value={tabValue} index="getting-started">
            <Stack spacing={6}>
              <Box component="section">
                <Typography variant="h4" component="h2" fontWeight="600" mb={3}>
                  Bem-vindo ao USPShare
                </Typography>
                <Typography>
                  O USPShare é uma plataforma colaborativa para compartilhamento de materiais acadêmicos entre
                  estudantes da Universidade de São Paulo. Aqui você encontrará provas antigas, listas de exercícios,
                  resumos e outros materiais que podem ajudar em seus estudos.
                </Typography>
                <Box sx={{ mt: 3, aspectRatio: '16 / 9', position: 'relative', borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                   <PlaceholderImage src="https://via.placeholder.com/800x450.png/007bff/FFFFFF?Text=Visão+Geral" alt="Visão geral da plataforma USPShare" sx={undefined} />
                </Box>
              </Box>

              <Box component="section">
                <Typography variant="h5" component="h2" fontWeight="600" mb={3}>
                  Criando sua Conta
                </Typography>
                <Grid container spacing={4}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography>
                      Para aproveitar todos os recursos do USPShare, você precisa criar uma conta usando seu e-mail
                      institucional da USP (@usp.br). Isso nos ajuda a garantir que a plataforma seja utilizada apenas
                      pela comunidade USP.
                    </Typography>
                     <List dense>
                        {[
                          "Clique no botão 'Entrar' no canto superior direito",
                          "Selecione 'Cadastre-se'",
                          "Preencha o formulário com seu nome e e-mail USP",
                          "Crie uma senha segura",
                          "Aceite os termos de uso",
                          "Clique em 'Criar Conta'",
                          "Verifique seu e-mail para confirmar sua conta"
                        ].map((text, index) => (
                           <ListItem key={index} disableGutters>
                             <ListItemIcon sx={{minWidth: '32px'}}>
                                <Typography color="primary" fontWeight="bold">{index+1}.</Typography>
                             </ListItemIcon>
                             <ListItemText primary={text} />
                           </ListItem>
                        ))}
                      </List>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={{ height: 300, position: 'relative', borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                       <PlaceholderImage src="https://via.placeholder.com/400x300.png/6c757d/FFFFFF?Text=Cadastro" alt="Tela de cadastro do USPShare" sx={undefined} />
                    </Box>
                  </Grid>
                </Grid>
              </Box>
              
               <Box component="section">
                <Typography variant="h5" component="h2" fontWeight="600" mb={3}>
                  Dicas para Iniciantes
                </Typography>
                <Stack spacing={3}>
                  <NumberedListItem number={1} title="Complete seu perfil" description="Adicione informações sobre seu curso e interesses para receber recomendações personalizadas." />
                  <NumberedListItem number={2} title="Explore materiais do seu curso" description="Use os filtros para encontrar materiais específicos das disciplinas que você está cursando." />
                  <NumberedListItem number={3} title="Contribua com a comunidade" description="Compartilhe materiais que você possui para ajudar outros estudantes e ganhar pontos de reputação." />
                  <NumberedListItem number={4} title="Interaja com outros usuários" description="Comente, faça perguntas e avalie materiais para enriquecer a experiência de todos." />
                </Stack>
              </Box>
            </Stack>
          </TabPanel>

          {/* Uploading Panel */}
          <TabPanel value={tabValue} index="uploading">
            <Stack spacing={6}>
              <Box component="section">
                <Typography variant="h4" component="h2" fontWeight="600" mb={3}>
                  Compartilhando Materiais
                </Typography>
                <Typography>
                  Uma das principais funcionalidades do USPShare é permitir que estudantes compartilhem materiais
                  acadêmicos com a comunidade. Quanto mais pessoas contribuírem, mais rica será nossa biblioteca de
                  recursos.
                </Typography>
              </Box>

              <Box component="section">
                 <Typography variant="h5" component="h2" fontWeight="600" mb={3}>
                    Como Fazer Upload de Materiais
                 </Typography>
                 <Grid container spacing={4}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        {/* Steps would be here */}
                         <Typography color="text.secondary">
                            O processo é simples: acesse a página, selecione o arquivo, preencha os detalhes como título, disciplina e professor, adicione tags e envie!
                         </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Stack spacing={2}>
                             <Box sx={{ height: 300, position: 'relative', borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                                <PlaceholderImage src="https://via.placeholder.com/400x300.png/007bff/FFFFFF?Text=Upload" alt="Tela de upload" sx={undefined} />
                            </Box>
                            <Alert severity="success" icon={<FileUploadIcon />}>
                                Quanto mais detalhes você fornecer, mais fácil será para outros estudantes encontrarem o material.
                            </Alert>
                        </Stack>
                    </Grid>
                 </Grid>
              </Box>

               <Box component="section">
                 <Typography variant="h5" component="h2" fontWeight="600" mb={3}>
                    Diretrizes para Compartilhamento
                 </Typography>
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                       <Card variant="outlined" sx={{ borderColor: 'success.main', height: '100%' }}>
                        <CardHeader 
                            avatar={<CheckCircleOutlineIcon color="success" />}
                            titleTypographyProps={{variant: 'h6', color: 'success.dark', fontWeight: 'bold'}}
                            title="O que Compartilhar" 
                        />
                         <CardContent>
                           <Typography variant="body2">Provas antigas, listas de exercícios, resumos, anotações de aula e materiais complementares.</Typography>
                         </CardContent>
                       </Card>
                    </Grid>
                     <Grid size={{ xs: 12, md: 6 }}>
                       <Card variant="outlined" sx={{ borderColor: 'error.main', height: '100%' }}>
                        <CardHeader 
                            avatar={<BlockIcon color="error" />}
                            titleTypographyProps={{variant: 'h6', color: 'error.dark', fontWeight: 'bold'}}
                            title="O que Não Compartilhar" 
                        />
                         <CardContent>
                           <Typography variant="body2">Materiais protegidos por direitos autorais, provas atuais, trabalhos que incentivem plágio ou conteúdo ofensivo.</Typography>
                         </CardContent>
                       </Card>
                    </Grid>
                  </Grid>
              </Box>
            </Stack>
          </TabPanel>

          {/* Searching Panel */}
           <TabPanel value={tabValue} index="searching">
            <Stack spacing={6}>
              <Box component="section">
                <Typography variant="h4" component="h2" fontWeight="600" mb={3}>
                  Encontrando Materiais
                </Typography>
                <Typography>
                  O USPShare oferece diversas formas de encontrar os materiais que você precisa. Nossa interface de
                  busca foi projetada para ser intuitiva e eficiente.
                </Typography>
                 <Box sx={{ mt: 3, aspectRatio: '16 / 9', position: 'relative', borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                   <PlaceholderImage src="https://via.placeholder.com/800x450.png/28a745/FFFFFF?Text=Busca" alt="Interface de busca" sx={undefined} />
                </Box>
              </Box>
              <Box component="section">
                 <Typography variant="h5" component="h2" fontWeight="600" mb={3}>
                    Utilizando a Busca e Filtros
                 </Typography>
                  <Grid container spacing={3}>
                     <Grid size={{ xs: 12, md: 6 }}>
                        <Typography fontWeight="medium">Busca Inteligente</Typography>
                         <Typography color="text.secondary" >
                          Digite nome da disciplina, código, professor ou tipo de material na barra de busca. Combine termos para refinar os resultados.
                         </Typography>
                    </Grid>
                     <Grid size={{ xs: 12, md: 6 }}>
                        <Typography fontWeight="medium">Filtros Avançados</Typography>
                         <Typography color="text.secondary">
                          Use os filtros para selecionar por tipo de material, ano/semestre ou tags como "com-gabarito" para encontrar exatamente o que precisa.
                         </Typography>
                    </Grid>
                  </Grid>
              </Box>
            </Stack>
          </TabPanel>

          {/* Interacting Panel */}
           <TabPanel value={tabValue} index="interacting">
             <Stack spacing={6}>
                <Box component="section">
                    <Typography variant="h4" component="h2" fontWeight="600" mb={3}>
                        Interagindo com a Comunidade
                    </Typography>
                     <Typography>
                       O USPShare não é apenas um repositório, mas uma comunidade colaborativa. Suas interações enriquecem a experiência de todos.
                    </Typography>
                </Box>
                <Box component="section">
                    <Typography variant="h5" component="h2" fontWeight="600" mb={3}>
                        Avaliações e Sistema de Reputação
                    </Typography>
                    <Typography>
                        Avalie os materiais que você usa, comente com dúvidas ou dicas, e reporte problemas. Suas contribuições geram pontos de reputação, que destacam os usuários mais ativos e ajudam a garantir a qualidade do conteúdo na plataforma.
                    </Typography>
                </Box>
             </Stack>
          </TabPanel>

          {/* Profile Panel */}
           <TabPanel value={tabValue} index="profile">
             <Stack spacing={6}>
                <Box component="section">
                    <Typography variant="h4" component="h2" fontWeight="600" mb={3}>
                        Gerenciando Seu Perfil
                    </Typography>
                     <Typography>
                       Seu perfil é seu espaço pessoal. Ele mostra suas contribuições e conquistas, e permite que você gerencie suas preferências e configurações.
                    </Typography>
                    <Box sx={{ mt: 3, aspectRatio: '16 / 9', position: 'relative', borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                        <PlaceholderImage src="https://via.placeholder.com/800x450.png/ffc107/FFFFFF?Text=Perfil" alt="Página de perfil" sx={undefined} />
                    </Box>
                </Box>
                 <Box component="section">
                    <Typography variant="h5" component="h2" fontWeight="600" mb={3}>
                        Personalização e Configurações
                    </Typography>
                    <Typography>
                        Adicione uma foto, atualize suas informações acadêmicas e escreva uma bio. Na aba de configurações, você pode gerenciar sua conta, privacidade, notificações e preferências de tema, além de solicitar o download dos seus dados.
                    </Typography>
                </Box>
             </Stack>
          </TabPanel>
        </Box>
      </Box>
    </Container>
  );
}