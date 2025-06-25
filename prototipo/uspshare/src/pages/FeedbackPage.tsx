import { useState } from "react"
import {
  Box,
  Typography,
  Container,
  TextField,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  FormControl,
  FormLabel,
  MenuItem,
  Select,
  InputLabel,
  Rating,
  Snackbar,
  Alert,
  Grid,
  Divider,
} from "@mui/material"
import { Message as MessageIcon } from "@mui/icons-material"
import { Link as RouterLink } from "react-router-dom"

export default function FeedbackPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [feedbackType, setFeedbackType] = useState("")
  const [rating, setRating] = useState<number | null>(null)
  const [message, setMessage] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)
    setTimeout(() => {
      setIsSubmitted(false)
      setName("")
      setEmail("")
      setFeedbackType("")
      setRating(null)
      setMessage("")
    }, 5000)
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Enviar Feedback
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Sua opinião é importante para melhorarmos o USPShare. Compartilhe suas sugestões, elogios ou problemas
        encontrados.
      </Typography>

      <Card sx={{ mt: 4 }}>
        <CardHeader title="Formulário de Feedback" subheader="Ajude-nos a melhorar a plataforma compartilhando sua experiência" />
        <CardContent component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Nome Completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6}}>
              <TextField
                label="E-mail USP"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                required
              />
            </Grid>
            <Grid size={{ xs: 12 }} >
              <FormControl fullWidth required>
                <InputLabel id="feedback-type-label">Tipo de Feedback</InputLabel>
                <Select
                  labelId="feedback-type-label"
                  value={feedbackType}
                  label="Tipo de Feedback"
                  onChange={(e) => setFeedbackType(e.target.value)}
                >
                  <MenuItem value="suggestion">Sugestão de Melhoria</MenuItem>
                  <MenuItem value="bug">Problema ou Bug</MenuItem>
                  <MenuItem value="compliment">Elogio</MenuItem>
                  <MenuItem value="feature">Solicitação de Funcionalidade</MenuItem>
                  <MenuItem value="other">Outro</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormLabel>Como você avalia sua experiência com o USPShare?</FormLabel>
              <Rating
                value={rating}
                onChange={(_e, newValue) => setRating(newValue)}
                sx={{ mt: 1 }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Seu Feedback"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                multiline
                rows={6}
                fullWidth
                required
              />
            </Grid>
          </Grid>

          <CardActions sx={{ justifyContent: "flex-end", mt: 2 }}>
            <Button type="submit" variant="contained" startIcon={<MessageIcon />}>
              Enviar Feedback
            </Button>
          </CardActions>
        </CardContent>
      </Card>

      <Divider sx={{ my: 6 }} />

      <Box>
        <Typography variant="h5" gutterBottom>
          Outros Canais de Contato
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Além deste formulário, você também pode entrar em contato conosco através dos seguintes canais:
        </Typography>

        <Grid container spacing={4} mt={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardHeader title="E-mail Direto" />
              <CardContent>
                <Typography variant="body2">
                  Para assuntos específicos, envie um e-mail diretamente para:
                </Typography>
                <ul>
                  <li>Suporte Técnico: suporte@uspshare.com.br</li>
                  <li>Sugestões: sugestoes@uspshare.com.br</li>
                  <li>Parcerias: parcerias@uspshare.com.br</li>
                </ul>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardHeader title="Redes Sociais" />
              <CardContent>
                <Typography variant="body2">
                  Siga-nos e envie mensagens através de nossas redes sociais:
                </Typography>
                <ul>
                  <li>Instagram: @uspshare</li>
                  <li>Twitter: @uspshare</li>
                  <li>LinkedIn: USPShare</li>
                </ul>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Alert severity="info" sx={{ mt: 4 }}>
          Para reportar conteúdo inadequado ou que viole direitos autorais, por favor utilize nossa{' '}
          <RouterLink to="/report" style={{ fontWeight: 500 }}>
            página de denúncias
          </RouterLink>
          .
        </Alert>
      </Box>

      <Snackbar open={isSubmitted} autoHideDuration={4000}>
        <Alert severity="success">Feedback enviado com sucesso!</Alert>
      </Snackbar>
    </Container>
  )
}
