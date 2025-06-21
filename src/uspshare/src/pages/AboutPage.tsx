import {
  FileOpen as BookOpen,
  Group as Users,
  Description as FileText,
  Search,
  Security as Shield,
  EmojiEvents as Award,
} from "@mui/icons-material"
import {
  Card,
  CardContent,
  CardHeader,
} from "@mui/material"
import Typography from "@mui/material/Typography"
import Container from "@mui/material/Container"
import Grid from "@mui/material/Grid"
import Box from "@mui/material/Box"
import Divider from "@mui/material/Divider"
import Avatar from "@mui/material/Avatar"
import Link from "@mui/material/Link"
import { useTheme } from "@mui/material/styles"

export default function AboutPage() {
  const theme = useTheme()

  return (
    <Container sx={{ py: 8 }}>
      <Box maxWidth="lg" mx="auto">
        <Box mb={6}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Sobre o USPShare
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Conheça nossa missão, visão e como estamos transformando o compartilhamento de materiais acadêmicos na USP
          </Typography>
        </Box>

        {/* Missão */}
        <Grid container spacing={4} alignItems="center" mb={6}>
          <Grid size={ { xs: 12, md: 6 } }>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Nossa Missão
            </Typography>
            <Typography paragraph>
              O USPShare é uma rede colaborativa criada por e para estudantes da Universidade de São Paulo. Nossa missão é democratizar o acesso a materiais acadêmicos — provas, listas, resumos e enunciados — reunindo, em um único lugar, tudo o que você precisa para planejar seus estudos de forma antecipada e eficiente.
            </Typography>
            <Typography paragraph>
              Acreditamos que o conhecimento deve ser compartilhado e que todos os estudantes merecem acesso a recursos de qualidade para apoiar sua jornada acadêmica.
            </Typography>
          </Grid>
          <Grid size={ { xs: 12, md: 6 } }>
            <Box
              sx={{
                borderRadius: 2,
                height: 300,
                backgroundColor: theme.palette.grey[900],
              }}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 6 }} />

        {/* História */}
        <Box mb={6}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Nossa História
          </Typography>
          <Typography paragraph>
            O USPShare nasceu em 2023, quando um grupo de estudantes de diferentes unidades da USP percebeu a dificuldade em encontrar materiais de estudo de qualidade para suas disciplinas.
          </Typography>
          <Typography paragraph>
            Inspirados pela cultura de colaboração que define a comunidade USP, decidimos criar uma plataforma que pudesse centralizar esses recursos e torná-los acessíveis a todos os estudantes.
          </Typography>
          <Typography paragraph>
            Desde então, o USPShare tem crescido rapidamente, com milhares de materiais compartilhados e uma comunidade ativa de usuários que contribuem diariamente.
          </Typography>

          <Grid container spacing={2} mt={2}>
            {["2023", "5", "42", "3500+"].map((text, idx) => (
              <Grid size={ { xs: 6, md: 3 } } key={idx}>
                <Box textAlign="center" p={2} bgcolor="grey.100" borderRadius={2}>
                  <Typography variant="h6" color="primary">
                    {text}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {[
                      "Ano de fundação",
                      "Fundadores",
                      "Unidades da USP",
                      "Usuários ativos",
                    ][idx]}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ my: 6 }} />

        {/* Valores */}
        <Box mb={6}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Nossos Valores
          </Typography>
          <Grid container spacing={4} mt={2}>
            {[
              {
                icon: <Users />,
                title: "Colaboração",
                desc: "Acreditamos no poder da comunidade e no compartilhamento de conhecimento.",
              },
              {
                icon: <Shield />,
                title: "Integridade",
                desc: "Promovemos o uso ético dos materiais, respeitando direitos autorais.",
              },
              {
                icon: <Award />,
                title: "Qualidade",
                desc: "Buscamos oferecer materiais de alta qualidade, avaliados pela comunidade.",
              },
            ].map((val, idx) => (
              <Grid size={ { xs: 12, md: 4 } } key={idx}>
                <Card sx={{ p: 2 }}>
                  <CardHeader title={val.title} avatar={val.icon} />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      {val.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ my: 6 }} />

        {/* Recursos */}
        <Box mb={6}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Principais Recursos
          </Typography>
          <Grid container spacing={4} mt={2}>
            {[
              {
                icon: <FileText />,
                title: "Compartilhamento de Arquivos",
                desc: "Upload de materiais com tags e metadados.",
              },
              {
                icon: <Search />,
                title: "Busca Inteligente",
                desc: "Encontre materiais por código, nome, ano, professor e tipo.",
              },
              {
                icon: <BookOpen />,
                title: "Visualização e Download",
                desc: "Pré-visualização e download de arquivos com um clique.",
              },
              {
                icon: <Users />,
                title: "Interação Social",
                desc: "Comentários, likes e sistema de reputação.",
              },
            ].map((feat, idx) => (
              <Grid size={ { xs: 12, md: 6 } } key={idx}>
                <Box display="flex" gap={2}>
                  <Box mt={0.5}>{feat.icon}</Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {feat.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feat.desc}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ my: 6 }} />

        {/* Equipe */}
        <Box mb={6}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Nossa Equipe
          </Typography>
          <Grid container spacing={4} mt={2}>
            {[
              {
                name: "Ana Silva",
                role: "Fundadora e Coordenadora",
                desc: "Estudante de Engenharia de Computação na Poli-USP.",
              },
              {
                name: "Pedro Santos",
                role: "Desenvolvedor",
                desc: "Estudante de Ciência da Computação no IME-USP.",
              },
              {
                name: "Mariana Costa",
                role: "Moderadora de Conteúdo",
                desc: "Estudante de Direito na FD-USP.",
              },
            ].map((member, idx) => (
              <Grid size={ { xs: 12, md: 4 } } key={idx}>
                <Card>
                  <CardHeader
                    avatar={<Avatar sx={{ width: 64, height: 64 }} />}
                    title={member.name}
                    subheader={member.role}
                  />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      {member.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ my: 6 }} />

        {/* Junte-se a nós */}
        <Box
          bgcolor="primary.main"
          color="primary.contrastText"
          borderRadius={2}
          textAlign="center"
          p={4}
        >
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Junte-se a Nós
          </Typography>
          <Typography maxWidth="sm" mx="auto" mb={2}>
            Estamos sempre em busca de voluntários para ajudar a melhorar a plataforma e expandir nosso acervo.
          </Typography>
          <Typography>
            Interessado em contribuir? Entre em contato em{' '}
            <Link href="mailto:voluntarios@uspshare.com.br" color="inherit" underline="always">
              voluntarios@uspshare.com.br
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  )
}
