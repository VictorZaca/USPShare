import React, { useState } from 'react';
import { Box, Avatar, Typography, Tabs, Tab, List, ListItem } from '@mui/material';

export default function ProfilePage() {
  const [tab, setTab] = useState(0);
  const handleChange = (e: any, newVal: React.SetStateAction<number>) => setTab(newVal);

  return (
    <Box>
      <Avatar sx={{ width: 80, height: 80, mb: 2 }}>E</Avatar>
      <Typography variant="h5" gutterBottom>Enzo Spinella</Typography>
      <Tabs value={tab} onChange={handleChange} sx={{ mb: 2 }}> 
        <Tab label="Meus Recursos" />
        <Tab label="Favoritos" />
      </Tabs>
      {tab === 0 && (
        <List>
          <ListItem>Prova P2 - Estruturas de Dados</ListItem>
          <ListItem>Anotações - Cálculo II</ListItem>
        </List>
      )}
      {tab === 1 && (
        <List>
          <ListItem>Resumo - Algoritmos 2</ListItem>
          <ListItem>Lista - Álgebra Linear</ListItem>
        </List>
      )}
    </Box>
  );
}