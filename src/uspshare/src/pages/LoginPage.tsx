import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Card,
  CardHeader,
  CardContent,
  TextField,
  FormControlLabel,
  Checkbox,
  Link,
  Stack,
  Alert,
  Avatar,
  Paper,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";

import { useAuth } from "../context/AuthContext";

import MenuBookIcon from "@mui/icons-material/MenuBook";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

    const auth = useAuth(); 
    if (!auth) {
      throw new Error("useAuth must be used within an AuthProvider");
    }
    const { login } = auth;


  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      navigate("/explore");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container
      component="main"
      maxWidth="xs"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100vh - 64px)", 
        py: 4,
      }}
    >
      <Stack spacing={3} alignItems="center" sx={{ mb: 4, textAlign: "center" }}>
        <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56 }}>
          <MenuBookIcon fontSize="large" />
        </Avatar>
        <Typography component="h1" variant="h4" fontWeight="bold">
          USPShare
        </Typography>
        <Typography color="text.secondary">
          Acesse sua conta para compartilhar materiais
        </Typography>
      </Stack>

      <Card sx={{ width: "100%", overflow: "visible" }}>
        <CardHeader
          title="Entrar"
          subheader="Digite suas credenciais para acessar sua conta"
          sx={{ textAlign: "center" }}
        />
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={2}>
              {error && <Alert severity="error">{error}</Alert>}

              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="E-mail USP"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />

              <Stack spacing={1}>
                 <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" component="label" htmlFor="password" fontWeight="medium">
                        Senha
                    </Typography>
                     <Link component={RouterLink} to="/forgot-password" variant="body2">
                        Esqueceu a senha?
                    </Link>
                </Stack>
                <TextField
                  required
                  fullWidth
                  name="password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </Stack>
             

              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    name="remember"
                    color="primary"
                    disabled={isLoading}
                  />
                }
                label="Lembrar de mim"
              />

              <LoadingButton
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                loading={isLoading}
                sx={{ mt: 2, mb: 2 }}
              >
                <span>Entrar</span>
              </LoadingButton>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      <Stack spacing={3} sx={{ mt: 4, textAlign: "center", width: '100%' }}>
        <Typography variant="body2" color="text.secondary">
          Não tem uma conta?{" "}
          <Link component={RouterLink} to="/signup" variant="body2" fontWeight="medium">
            Cadastre-se
          </Link>
        </Typography>
        
        <Paper 
            variant="outlined" 
            sx={{ 
                p: 1.5,
                bgcolor: 'action.hover',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5
            }}
        >
            <InfoOutlinedIcon color="action" sx={{ mt: '3px', flexShrink: 0 }} />
            <Typography variant="caption" color="text.secondary">
                O USPShare é exclusivo para estudantes da USP. Utilize seu e-mail institucional (@usp.br) para se cadastrar.
            </Typography>
        </Paper>
      </Stack>
    </Container>
  );
}