import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Pressable } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons'; // Biblioteca de ícones que vem com o Expo

export default function LoginPage() {
  // --- LÓGICA DE ESTADO (IDÊNTICA À DA WEB) ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- LÓGICA DE AUTENTICAÇÃO E NAVEGAÇÃO ---
  const { login } = useAuth();
  const router = useRouter(); // Hook de navegação do Expo Router

  const handleSubmit = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await login(email, password);
      // 'replace' navega para a nova tela e impede o usuário de voltar para a tela de login
      router.replace('/(tabs)/explore');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="book" size={32} color="#fff" />
        </View>
        <Text style={styles.title}>USPShare</Text>
        <Text style={styles.subtitle}>Acesse sua conta para compartilhar materiais</Text>
      </View>

      <View style={styles.card}>
        {error && <Text style={styles.errorText}>{error}</Text>}

        <Text style={styles.inputLabel}>E-mail USP</Text>
        <TextInput
          style={styles.input}
          placeholder="seu.email@usp.br"
          placeholderTextColor="#808080"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isLoading}
        />

        <Text style={styles.inputLabel}>Senha</Text>
        <TextInput
          style={styles.input}
          placeholder="********"
          placeholderTextColor="#808080"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!isLoading}
        />

        <View style={styles.actionsRow}>
          <Pressable style={styles.checkboxContainer} onPress={() => setRememberMe(!rememberMe)}>
            <Ionicons name={rememberMe ? "checkbox" : "square-outline"} size={20} color="#555" />
            <Text style={styles.checkboxLabel}>Lembrar de mim</Text>
          </Pressable>
          {/* <Link href="/forgot-password" asChild>
            <TouchableOpacity>
              <Text style={styles.linkText}>Esqueceu a senha?</Text>
            </TouchableOpacity>
          </Link> */}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Entrar</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Não tem uma conta? </Text>
        <Link href="/signup" asChild>
            <TouchableOpacity>
                <Text style={styles.linkText}>Cadastre-se</Text>
            </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

// --- ESTILIZAÇÃO (O EQUIVALENTE AO SX E CSS) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1976d2', // Cor primária do MUI
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 8,
    width: '100%',
  },
  errorText: {
    color: '#d32f2f', // Cor de erro do MUI
    textAlign: 'center',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  input: {
    height: 48,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 12,
    borderRadius: 4,
    backgroundColor: '#fff',
    color: '#000',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
});