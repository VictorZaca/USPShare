"use client"

import type React from "react"
import { useState } from "react"
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Grid,
  MenuItem,
  Select,
  TextField,
  Typography,
  Alert,
  FormControl,
  InputLabel,
} from "@mui/material"
import MailIcon from "@mui/icons-material/Mail"
import PhoneIcon from "@mui/icons-material/Phone"
import PlaceIcon from "@mui/icons-material/Place"
import SendIcon from "@mui/icons-material/Send"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"

export default function ContactPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSubmitted(true)
    setIsLoading(false)

    setTimeout(() => {
      setName("")
      setEmail("")
      setSubject("")
      setMessage("")
      setIsSubmitted(false)
    }, 5000)
  }

  return (
    <Container sx={{ py: 8 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Fale Conosco
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Tem alguma dúvida, sugestão ou problema? Entre em contato conosco e responderemos o mais rápido possível.
      </Typography>

      <Grid container spacing={4} sx={{ mt: 2 }}>
        <Grid size={{ xs: 12, md: 4 }}> 
          <Card>
            <CardHeader title="Informações de Contato" subheader="Diferentes formas de entrar em contato conosco" />
            <CardContent>
              <Box display="flex" alignItems="flex-start" gap={2} mb={2}>
                <MailIcon color="primary" />
                <Box>
                  <Typography fontWeight={500}>E-mail</Typography>
                  <Typography variant="body2" color="text.secondary">contato@uspshare.com.br</Typography>
                </Box>
              </Box>
              <Box display="flex" alignItems="flex-start" gap={2} mb={2}>
                <PlaceIcon color="primary" />
                <Box>
                  <Typography fontWeight={500}>Localização</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Universidade de São Paulo<br />São Paulo, SP - Brasil
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" alignItems="flex-start" gap={2}>
                <PhoneIcon color="primary" />
                <Box>
                  <Typography fontWeight={500}>Horário de Atendimento</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Segunda a Sexta<br />9h às 18h
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8}}>
          <Card>
            <CardHeader title="Envie sua Mensagem" subheader="Responderemos em até 48 horas" />
            <CardContent>
              {isSubmitted ? (
                <Alert icon={<CheckCircleIcon />} severity="success">
                  Mensagem enviada com sucesso! Obrigado por entrar em contato.
                </Alert>
              ) : (
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Nome Completo"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }} >
                      <TextField
                        fullWidth
                        type="email"
                        label="E-mail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <FormControl fullWidth required>
                        <InputLabel>Assunto</InputLabel>
                        <Select
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          label="Assunto"
                        >
                          <MenuItem value="duvida">Dúvida</MenuItem>
                          <MenuItem value="sugestao">Sugestão</MenuItem>
                          <MenuItem value="problema">Problema Técnico</MenuItem>
                          <MenuItem value="denuncia">Denúncia de Conteúdo</MenuItem>
                          <MenuItem value="direitos">Direitos Autorais</MenuItem>
                          <MenuItem value="parceria">Proposta de Parceria</MenuItem>
                          <MenuItem value="outro">Outro</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        multiline
                        rows={5}
                        label="Mensagem"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }} display="flex" justifyContent="flex-end">
                      <Button type="submit" variant="contained" endIcon={<SendIcon />} disabled={isLoading}>
                        {isLoading ? "Enviando..." : "Enviar Mensagem"}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}
