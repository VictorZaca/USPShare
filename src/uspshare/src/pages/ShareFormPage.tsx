import React, { useState } from 'react';
import { Box, Typography, TextField, FormControl, InputLabel, Select, MenuItem, FormControlLabel, Checkbox, Button, Stack } from '@mui/material';

export default function ShareFormPage() {
  const [file, setFile] = useState<File | null>(null);
  return (
    <Box component="form" sx={{ '& .MuiFormControl-root': { mb: 2 } }}>
      <Typography variant="h4" gutterBottom>Compartilhar Recurso</Typography>
      <TextField fullWidth label="Título" />
      <TextField fullWidth label="Descrição" multiline rows={4} />
      <FormControl fullWidth>
        <InputLabel>Disciplina</InputLabel>
        <Select label="Disciplina">
          <MenuItem value="db">Banco de Dados</MenuItem>
        </Select>
      </FormControl>
      <TextField fullWidth label="Tags (separadas por vírgula)" />
      <Button variant="contained" component="label">Upload de Arquivo
        <input type="file" hidden onChange={e => setFile(e.target.files ? e.target.files[0] : null)} />
      </Button>
      <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
        <FormControlLabel control={<Checkbox />} label="Público USP" />
        <FormControlLabel control={<Checkbox />} label="Somente CC" />
      </Stack>
      <Button type="submit" variant="contained" sx={{ mt: 3 }}>Publicar</Button>
    </Box>
  );
}