import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Pressable, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../api/axios';

// --- Componente Auxiliar para Força da Senha ---
const PasswordStrengthIndicator: React.FC<{ password: string }> = ({ password }) => {
  const { strength, color, label } = useMemo(() => {
    let score = 0;
    if (!password) return { strength: 0, color: "#ccc", label: "" };
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    switch (score) {
      case 1: return { strength: 25, color: "#d32f2f", label: "Fraca" };
      case 2: return { strength: 50, color: "#ffa000", label: "Razoável" };
      case 3: return { strength: 75, color: "#66bb6a", label: "Boa" };
      case 4: return { strength: 100, color: "#388e3c", label: "Forte" };
      default: return { strength: 10, color: "#d32f2f", label: "Muito Fraca" };
    }
  }, [password]);

  if (!password) return null;

  return (
    <View style={styles.strengthContainer}>
      <View style={{...styles.strengthBar, width: `${strength}%`, backgroundColor: color }} />
      <Text style={{ ...styles.strengthLabel, color: color }}>{label}</Text>
    </View>
  );
};


// --- Tela Principal de Cadastro ---
export default function SignupPage() {
  // Lógica de estado idêntica à da web
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] =useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const validateUspEmail = (email: string) => email.endsWith("@usp.br");

  const handleSubmit = async () => {
    setError(null);
    if (!name || !email || !password || !confirmPassword) return setError("Por favor, preencha todos os campos.");
    if (!validateUspEmail(email)) return setError("Por favor, utilize um e-mail USP válido (@usp.br).");
    if (password !== confirmPassword) return setError("As senhas não coincidem.");
    if (password.length < 8) return setError("A senha deve ter pelo menos 8 caracteres.");
    if (!agreeTerms) return setError("Você precisa concordar com os termos de uso.");
    
    setIsLoading(true);
    try {
      await apiClient.post("/api/signup", { name, email, password });
      setSuccess(true);
      setTimeout(() => router.replace("/login"), 3000); // Redireciona para o login
    } catch (err: any) {
      setError(err.response?.data?.error || "Falha ao criar conta.");
    } finally {
      setIsLoading(false);
    }
  };
  
  if (success) {
    return (
      <View style={styles.successContainer}>
        <Ionicons name="checkmark-circle" size={80} color="#388e3c" />
        <Text style={styles.successTitle}>Cadastro realizado!</Text>
        <Text style={styles.successSubtitle}>Você já pode fazer login com suas credenciais.</Text>
        <Text style={styles.redirectText}>Redirecionando para a tela de login...</Text>
        <ActivityIndicator style={{ marginTop: 16 }} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="book" size={32} color="#fff" />
        </View>
        <Text style={styles.title}>Criar Conta</Text>
      </View>

      <View style={styles.card}>
        {error && <Text style={styles.errorText}>{error}</Text>}

        <TextInput style={styles.input} placeholder="Nome Completo" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="E-mail USP (ex: nome@usp.br)" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Senha" value={password} onChangeText={setPassword} secureTextEntry />
        <PasswordStrengthIndicator password={password} />
        <TextInput style={styles.input} placeholder="Confirmar Senha" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

        <Pressable style={styles.checkboxContainer} onPress={() => setAgreeTerms(!agreeTerms)}>
          <Ionicons name={agreeTerms ? "checkbox" : "square-outline"} size={20} color="#555" />
          <Text style={styles.checkboxLabel}>
            Eu concordo com os <Text style={styles.linkText}>termos de uso</Text>.
          </Text>
        </Pressable>

        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Criar Conta</Text>}
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Já tem uma conta? </Text>
        <Link href="/login" asChild>
            <TouchableOpacity>
                <Text style={styles.linkText}>Faça login</Text>
            </TouchableOpacity>
        </Link>
      </View>
    </ScrollView>
  );
}

// --- ESTILIZAÇÃO NATIVA ---
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1976d2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 8,
    width: '100%',
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 12,
  },
  input: {
    height: 48,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 12,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkboxLabel: {
    marginLeft: 8,
    color: '#555',
  },
  linkText: {
    color: '#1976d2',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#1976d2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    color: '#666',
  },
  strengthContainer: {
    marginBottom: 16,
  },
  strengthBar: {
    height: 6,
    borderRadius: 3,
  },
  strengthLabel: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 2,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  redirectText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});