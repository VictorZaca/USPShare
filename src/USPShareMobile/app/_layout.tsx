import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext'; 
import { LikesProvider } from '../context/LikesContext';
import { CommentLikesProvider } from '../context/CommentLikesContext';
import React, { useEffect, useCallback } from 'react'; 

import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

function AppLayout() {
  const { loading } = useAuth(); 

  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync(); 
    }
  }, [loading]); 

  if (loading) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name="login" options={{ title: 'Login' }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ title: 'Cadastro' }} />
      <Stack.Screen name="file/[id]" options={{ title: 'Material' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <LikesProvider>
        <CommentLikesProvider>
          {/* O AppLayout é renderizado DENTRO dos providers */}
          <AppLayout />
        </CommentLikesProvider>
      </LikesProvider>
    </AuthProvider>
  );
}