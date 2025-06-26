import React, { JSX } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, CircularProgress } from '@mui/material';

export const AdminProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Box sx={{display: 'flex', justifyContent: 'center', p: 4}}><CircularProgress /></Box>;
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    // Redireciona para o login ou para uma página de "não autorizado"
    return <Navigate to="/explore" state={{ from: location }} replace />;
  }

  return children;
};