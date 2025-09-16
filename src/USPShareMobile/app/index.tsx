import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext'; // Ajuste o caminho se necessário

export default function IndexPage() {
  // 1. Pegamos o estado de autenticação e de carregamento do nosso contexto.
  const { isAuthenticated, loading } = useAuth();

  // 2. Enquanto o AuthContext está verificando o token no AsyncStorage (loading === true),
  // mostramos uma tela de carregamento. Isso é crucial para evitar um "piscar"
  // da tela de login antes de redirecionar um usuário já logado.
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  // 3. Após o carregamento, tomamos a decisão baseada no estado de autenticação.
  if (isAuthenticated) {
    // Se o usuário está logado, o redirecionamos para a tela principal do app.
    // O caminho '/(tabs)/explore' nos leva para a rota 'explore' que está dentro
    // do nosso grupo de layout de abas '(tabs)'.
    return <Redirect href="/(tabs)/explore" />;
  } else {
    // Se não está logado, o redirecionamos para a tela de login.
    return <Redirect href="/login" />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});