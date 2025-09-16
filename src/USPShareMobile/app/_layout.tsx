import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import { LikesProvider } from '../context/LikesContext';
import { CommentLikesProvider } from '../context/CommentLikesContext';

// Este é o componente de layout principal do seu aplicativo.
export default function RootLayout() {
  return (
    // 1. Envolvemos tudo com nossos providers de contexto
    <AuthProvider>
      <LikesProvider>
        <CommentLikesProvider>
          {/* 2. O Stack navigator controla a navegação entre telas */}
          <Stack>
            {/* Cada tela é uma Stack.Screen. O nome corresponde ao nome do arquivo. */}
            <Stack.Screen name="login" options={{ title: 'Login' }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="signup" options={{ title: 'Cadastro' }} />
            <Stack.Screen name="file/[id]" options={{ title: 'Material' }} />
          </Stack>
        </CommentLikesProvider>
      </LikesProvider>
    </AuthProvider>
  );
}