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

interface AuthProps {
  onSwitch: () => void;
}

export const LoginPage: React.FC<AuthProps> = ({ onSwitch }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:4000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error('Credenciais inválidas');
      const data = await res.json();
      console.log('Logado com sucesso:', data);
      // Salve token e redirecione conforme necessário
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Box maxW="md" mx="auto" mt={8} p={6} borderWidth={1} borderRadius="md" boxShadow="sm">
      <Heading mb={6}>Login</Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          <Box>
            <Text mb={1} fontWeight="semibold">Email</Text>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Box>
          <Box>
            <Text mb={1} fontWeight="semibold">Senha</Text>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:4000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) throw new Error('Falha no cadastro');
      const data = await res.json();
      console.log('Cadastrado com sucesso:', data);
      onSwitch();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Box maxW="md" mx="auto" mt={8} p={6} borderWidth={1} borderRadius="md" boxShadow="sm">
      <Heading mb={6}>Cadastrar</Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          <Box>
            <Text mb={1} fontWeight="semibold">Nome</Text>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Box>
          <Box>
            <Text mb={1} fontWeight="semibold">Email</Text>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Box>
          <Box>
            <Text mb={1} fontWeight="semibold">Senha</Text>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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
