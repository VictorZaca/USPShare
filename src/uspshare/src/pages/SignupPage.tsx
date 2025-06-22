// SignupPage.js - VERSÃO INTEGRADA

import React, { useState, useMemo } from "react";
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
  LinearProgress,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";

// --- INÍCIO DA ALTERAÇÃO ---
import apiClient from "../api/axios"; // 1. Importar nosso cliente de API
// --- FIM DA ALTERAÇÃO ---

// Material-UI Icons
import MenuBookIcon from "@mui/icons-material/MenuBook";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

// --- Seu componente PasswordStrengthIndicator (sem alterações) ---
interface PasswordStrengthIndicatorProps {
  password: string;
}

// --- Seu componente PasswordStrengthIndicator (sem alterações) ---
const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
  const { strength, color, label } = useMemo(() => {
    let score = 0;
    if (!password) return { strength: 0, color: "grey", label: "" };
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    switch (score) {
      case 1: return { strength: 25, color: "error.main", label: "Fraca" };
      case 2: return { strength: 50, color: "warning.main", label: "Razoável" };
      case 3: return { strength: 75, color: "success.light", label: "Boa" };
      case 4: return { strength: 100, color: "success.main", label: "Forte" };
      default: return { strength: 10, color: "error.main", label: "Muito Fraca" };
    }
  }, [password]);
  if (!password) return null;
  return (
    <Stack spacing={0.5}>
      <LinearProgress variant="determinate" value={strength} sx={{ height: 6, borderRadius: 3, '& .MuiLinearProgress-bar': { backgroundColor: color } }} />
      <Typography variant="caption" sx={{ color, textAlign: 'right' }}>{label}</Typography>
    </Stack>
  );
};

// --- Componente Principal da Página de Cadastro ---
export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const validateUspEmail = (email: string) => email.endsWith("@usp.br");

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setError(null);

    // Frontend Validations (mantidas, pois são ótimas)
    if (!name || !email || !password || !confirmPassword) return setError("Por favor, preencha todos os campos.");
    if (!validateUspEmail(email)) return setError("Por favor, utilize um e-mail USP válido (@usp.br).");
    if (password !== confirmPassword) return setError("As senhas não coincidem.");
    if (password.length < 8) return setError("A senha deve ter pelo menos 8 caracteres.");
    if (!agreeTerms) return setError("Você precisa concordar com os termos de uso.");
    
    setIsLoading(true);
    try {
      // --- INÍCIO DA ALTERAÇÃO ---
      // 2. Montar o payload para a API
      const payload = { name, email, password };

      // 3. Chamar o endpoint /api/signup do nosso backend Go
      await apiClient.post("/api/signup", payload);

      // Se a chamada for bem-sucedida, mostramos a tela de sucesso
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000); // Redireciona após 3 segundos
      // --- FIM DA ALTERAÇÃO ---
    } catch (err) {
      // --- INÍCIO DA ALTERAÇÃO ---
      // 4. Capturar o erro específico do backend
      const axiosError = err as any;
      if (axiosError.response && axiosError.response.data && axiosError.response.data.error) {
        setError(axiosError.response.data.error); // Ex: "Email already exists"
      } else {
        setError("Falha ao criar conta. Verifique sua conexão e tente novamente.");
      }
      // --- FIM DA ALTERAÇÃO ---
    } finally {
        setIsLoading(false);
    }
  };

  // O restante do seu JSX permanece o mesmo, pois já está preparado
  // para lidar com os estados de 'success', 'error' e 'isLoading'.
  return (
    <Container
      component="main"
      maxWidth="xs"
      sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 64px)", py: 4 }}
    >
      <Stack spacing={3} alignItems="center" sx={{ width: "100%" }}>
        <Stack alignItems="center" textAlign="center">
          <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56 }}>
            <MenuBookIcon fontSize="large" />
          </Avatar>
          <Typography component="h1" variant="h4" fontWeight="bold" mt={2}>
            USPShare
          </Typography>
          <Typography color="text.secondary">Crie sua conta para compartilhar materiais</Typography>
        </Stack>

        <Card sx={{ width: "100%" }}>
          <CardHeader title="Criar Conta" subheader="Preencha os dados abaixo para se cadastrar" />
          <CardContent>
            {success ? (
              <Stack alignItems="center" textAlign="center" spacing={2} py={4}>
                <CheckCircleOutlineIcon color="success" sx={{ fontSize: 64 }} />
                <Typography variant="h5" component="h2" fontWeight="bold">Cadastro realizado com sucesso!</Typography>
                <Typography color="text.secondary">
                  Você já pode fazer login com suas credenciais.
                </Typography>
                <Typography variant="caption">Redirecionando para a página de login...</Typography>
                <LinearProgress sx={{ width: '100%', mt: 2 }} />
              </Stack>
            ) : (
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Stack spacing={2}>
                  {error && <Alert severity="error">{error}</Alert>}
                  <TextField required fullWidth id="name" label="Nome Completo" value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} />
                  <TextField
                    required
                    fullWidth
                    id="email"
                    type="email"
                    label="E-mail USP"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={!!(email && !validateUspEmail(email))}
                    helperText={email && !validateUspEmail(email) ? "Por favor, utilize um e-mail USP válido." : ""}
                    disabled={isLoading}
                  />
                  <TextField
                    required
                    fullWidth
                    id="password"
                    type="password"
                    label="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <PasswordStrengthIndicator password={password} />
                  <TextField
                    required
                    fullWidth
                    id="confirm-password"
                    type="password"
                    label="Confirmar Senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    error={!!(confirmPassword && password !== confirmPassword)}
                    helperText={confirmPassword && password !== confirmPassword ? "As senhas não coincidem." : ""}
                    disabled={isLoading}
                  />
                  <FormControlLabel
                    control={<Checkbox checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} name="terms" disabled={isLoading} />}
                    label={
                      <Typography variant="body2" color="text.secondary">
                        Eu concordo com os{" "}
                        <Link component={RouterLink} to="/terms">termos de uso</Link> e{" "}
                        <Link component={RouterLink} to="/privacy">política de privacidade</Link>.
                      </Typography>
                    }
                  />
                  <LoadingButton type="submit" fullWidth variant="contained" size="large" loading={isLoading}>
                    <span>Criar Conta</span>
                  </LoadingButton>
                </Stack>
              </Box>
            )}
          </CardContent>
        </Card>

        <Stack spacing={2} sx={{ textAlign: "center", width: "100%" }}>
            <Typography variant="body2">
                Já tem uma conta?{" "}
                <Link component={RouterLink} to="/login" fontWeight="medium">Faça login</Link>
            </Typography>
             <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'action.hover', display: 'flex', alignItems: 'flex-start', gap: 1.5, textAlign: 'left' }}>
                <InfoOutlinedIcon color="action" sx={{ mt: '3px', flexShrink: 0 }} />
                <Typography variant="caption" color="text.secondary">
                    O USPShare é exclusivo para estudantes da USP. Seu e-mail institucional será verificado durante o processo de cadastro.
                </Typography>
            </Paper>
        </Stack>
      </Stack>
    </Container>
  );
}