// src/components/AuthPages.tsx
import React, { useState } from 'react';
import {
  Box,
  Button,
  Input,
  Heading,
  VStack,
  Link,
  Text,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

interface AuthProps {
  onSwitch: () => void;
}

interface StoredUser {
  name?: string;
  email: string;
  password: string;
}

const USERS_KEY = 'app_users';
const TOKEN_KEY = 'app_token';

export const LoginPage: React.FC<AuthProps> = ({ onSwitch }) => {
  const navigate = useNavigate();
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]     = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // 1. Busca lista de usuários
      const stored = localStorage.getItem(USERS_KEY) || '[]';
      const users: StoredUser[] = JSON.parse(stored);

      // 2. Verifica credenciais
      const user = users.find(u => u.email === email && u.password === password);
      if (!user) throw new Error('Email ou senha inválidos');

      // 3. Gera um token simples e salva
      const token = Math.random().toString(36).slice(2);
      localStorage.setItem(TOKEN_KEY, token);

      // 4. Redireciona para a home
      console.log('Token gerado:', token);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Box maxW="md" mx="auto" mt={8} p={6}
      borderWidth={1} borderRadius="md" boxShadow="sm"
    >
      <Heading mb={6}>Login</Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          <Box>
            <Text mb={1} fontWeight="semibold">Email</Text>
            <Input
              id="email" type="email" value={email}
              onChange={e => setEmail(e.target.value)} required
            />
          </Box>
          <Box>
            <Text mb={1} fontWeight="semibold">Senha</Text>
            <Input
              id="password" type="password" value={password}
              onChange={e => setPassword(e.target.value)} required
            />
          </Box>

          {error && <Text color="red.500">{error}</Text>}

          <Button type="submit" colorScheme="blue" width="full">
            Entrar
          </Button>

          <Text textAlign="center">
            Não tem conta?{' '}
            <Link color="blue.500" onClick={onSwitch} cursor="pointer">
              Cadastre-se
            </Link>
          </Text>
        </VStack>
      </form>
    </Box>
  );
};


export const SignupPage: React.FC<AuthProps> = ({ onSwitch }) => {
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]     = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // 1. Carrega usuários existentes
      const stored = localStorage.getItem(USERS_KEY) || '[]';
      const users: StoredUser[] = JSON.parse(stored);

      // 2. Previne e-mail duplicado
      if (users.find(u => u.email === email)) {
        throw new Error('Este email já está cadastrado');
      }

      // 3. Adiciona novo usuário
      users.push({ name, email, password });
      localStorage.setItem(USERS_KEY, JSON.stringify(users));

      // 4. Vai para tela de login
      onSwitch();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Box maxW="md" mx="auto" mt={8} p={6}
      borderWidth={1} borderRadius="md" boxShadow="sm"
    >
      <Heading mb={6}>Cadastrar</Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          <Box>
            <Text mb={1} fontWeight="semibold">Nome</Text>
            <Input
              id="name" value={name}
              onChange={e => setName(e.target.value)} required
            />
          </Box>
          <Box>
            <Text mb={1} fontWeight="semibold">Email</Text>
            <Input
              id="email" type="email" value={email}
              onChange={e => setEmail(e.target.value)} required
            />
          </Box>
          <Box>
            <Text mb={1} fontWeight="semibold">Senha</Text>
            <Input
              id="password" type="password" value={password}
              onChange={e => setPassword(e.target.value)} required
            />
          </Box>

          {error && <Text color="red.500">{error}</Text>}

          <Button type="submit" colorScheme="green" width="full">
            Cadastrar
          </Button>

          <Text textAlign="center">
            Já tem conta?{' '}
            <Link color="green.500" onClick={onSwitch} cursor="pointer">
              Faça login
            </Link>
          </Text>
        </VStack>
      </form>
    </Box>
  );
};
