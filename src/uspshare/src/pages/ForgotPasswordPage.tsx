import React, { useState } from "react"
import { Link as RouterLink } from "react-router-dom"
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  CardHeader,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Box,
} from "@mui/material"
import BookIcon from "@mui/icons-material/MenuBook"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const validateUspEmail = (email: string) => email.endsWith("@usp.br")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    if (!email) {
      setError("Por favor, informe seu e-mail USP.")
      setIsLoading(false)
      return
    }

    if (!validateUspEmail(email)) {
      setError("Por favor, utilize um e-mail USP válido (@usp.br).")
      setIsLoading(false)
      return
    }

    await new Promise((resolve) => setTimeout(resolve, 1500))

    setSuccess(true)
    setIsLoading(false)
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Box textAlign="center" mb={4}>
        <BookIcon sx={{ fontSize: 48, color: "primary.main", mb: 1 }} />
        <Typography variant="h4" fontWeight="bold">
          USPShare
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Recuperação de senha
        </Typography>
      </Box>

      <Card>
        <CardHeader
          title="Esqueceu sua senha?"
          subheader="Informe seu e-mail USP e enviaremos instruções para redefinir sua senha."
        />
        <CardContent>
          {success ? (
            <Box textAlign="center" py={4}>
              <CheckCircleIcon sx={{ fontSize: 64, color: "success.main", mb: 2 }} />
              <Typography variant="h6">E-mail enviado!</Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                Enviamos instruções para {email}. Verifique sua caixa de entrada.
              </Typography>
              <Typography variant="body2" mt={2}>
                Não recebeu? Verifique o spam ou{" "}
                <Button onClick={handleSubmit} size="small" disabled={isLoading}>
                  tente novamente
                </Button>
              </Typography>
            </Box>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              <TextField
                fullWidth
                label="E-mail USP"
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                error={email !== "" && !validateUspEmail(email)}
                helperText={
                  email && !validateUspEmail(email)
                    ? "Por favor, utilize um e-mail USP válido (@usp.br)."
                    : ""
                }
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                sx={{ mt: 3 }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} /> Enviando...
                  </>
                ) : (
                  "Enviar instruções"
                )}
              </Button>
            </form>
          )}
        </CardContent>

        {!success && (
          <CardActions sx={{ justifyContent: "center" }}>
            <Button component={RouterLink} to="/login" size="small">
              Voltar para o login
            </Button>
          </CardActions>
        )}
      </Card>
    </Container>
  )
}
