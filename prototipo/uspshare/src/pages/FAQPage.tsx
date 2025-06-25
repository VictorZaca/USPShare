"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Tabs, Tab, Box, Typography, InputBase, Button } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { Link as RouterLink } from "react-router-dom";

export default function FAQPage() {
  const [tab, setTab] = useState(0);

  const handleChange = (_: any, newValue: number) => {
    setTab(newValue);
  };

  const categories = ["Geral", "Conta e Acesso", "Arquivos", "Comunidade"];

  return (
    <Box sx={{ p: 4, maxWidth: "1000px", mx: "auto" }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Perguntas Frequentes
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Encontre respostas para as dúvidas mais comuns sobre o USPShare e como utilizar a plataforma
      </Typography>

      {/* Search */}
      <Box sx={{ position: "relative", mt: 4, mb: 6 }}>
        <SearchIcon sx={{ position: "absolute", top: 12, left: 12, color: "text.secondary" }} />
        <InputBase
          placeholder="Buscar nas perguntas frequentes..."
          sx={{
            width: "100%",
            pl: 5,
            pr: 2,
            py: 1,
            border: 1,
            borderColor: "divider",
            borderRadius: 1,
            bgcolor: "background.paper",
          }}
        />
      </Box>

      {/* Tabs */}
      <Tabs value={tab} onChange={handleChange} variant="scrollable" scrollButtons="auto" sx={{ mb: 4 }}>
        {categories.map((label) => (
          <Tab key={label} label={label} />
        ))}
      </Tabs>

      {/* Tab Panels */}
      <Box>
        <Typography variant="h6" fontWeight="medium" gutterBottom>
          Perguntas da categoria: {categories[tab]}
        </Typography>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>O que é o USPShare?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              O USPShare é uma plataforma colaborativa criada por e para estudantes da Universidade de São Paulo. Nosso
              objetivo é democratizar o acesso a materiais acadêmicos — provas, listas, resumos e enunciados — reunindo
              em um único lugar tudo o que você precisa para planejar seus estudos de forma antecipada e eficiente.
            </Typography>
          </AccordionDetails>
        </Accordion>
        {/* Outras perguntas viriam aqui em accordions semelhantes */}
      </Box>

      <Box mt={8} textAlign="center" bgcolor="action.hover" p={4} borderRadius={2}>
        <Typography variant="h6" gutterBottom>
          Ainda tem dúvidas?
        </Typography>
        <Typography variant="body2" gutterBottom>
          Entre em contato conosco e responderemos o mais rápido possível.
        </Typography>
        <Button variant="outlined" component={RouterLink} to="/contact">
          Fale Conosco
        </Button>
      </Box>
    </Box>
  );
}
