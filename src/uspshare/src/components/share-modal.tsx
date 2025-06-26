import React, { useState, useEffect, FC, useCallback } from 'react';
import { Dialog, DialogTitle, DialogContent, Autocomplete, TextField, DialogActions, Button, Stack, Avatar, Box, Typography, CircularProgress } from '@mui/material';
import apiClient from '../api/axios';
import useDebounce from '../hooks/useDebounce'; // Reutilizando nosso hook!

interface UserOption {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  onShare: (recipientId: string) => Promise<void>;
}

export const ShareModal: FC<ShareModalProps> = ({ open, onClose, onShare }) => {
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<UserOption[]>([]);
  const [selectedValue, setSelectedValue] = useState<UserOption | null>(null);
  const [loading, setLoading] = useState(false);
  const debouncedSearchTerm = useDebounce(inputValue, 300); 

  const searchUsers = useCallback(async (searchTerm: string) => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/api/users/search?q=${searchTerm}`);
      setOptions(response.data || []);
    } catch (error) {
      console.error("Failed to search users:", error);
      setOptions([]); // Limpa as opções em caso de erro
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // Se o modal não estiver aberto, não faz nada.
    if (!open) {
      return;
    }

    // Se o termo de busca debounced está vazio, busca a lista inicial.
    // Se não, busca pelo termo específico.
    searchUsers(debouncedSearchTerm);
    
  }, [debouncedSearchTerm, open, searchUsers]); 

  const handleShare = () => {
    if (selectedValue) {
      onShare(selectedValue.id);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Compartilhar com um usuário</DialogTitle>
      <DialogContent>
        <Autocomplete
          options={options}
          loading={loading}
          getOptionLabel={(option) => option.name}
          filterOptions={(x) => x} // Necessário para busca via API
          onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
          onChange={(event, newValue) => setSelectedValue(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Buscar por nome ou e-mail"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loading ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          renderOption={(props, option) => (
            <Box component="li" {...props}>
              <Avatar src={`http://localhost:8080${option.avatarUrl}`} sx={{ mr: 2 }} />
              <Box>
                <Typography variant="body1">{option.name}</Typography>
                <Typography variant="body2" color="text.secondary">{option.email}</Typography>
              </Box>
            </Box>
          )}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleShare} disabled={!selectedValue} variant="contained">Enviar</Button>
      </DialogActions>
    </Dialog>
  );
};