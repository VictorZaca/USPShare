import React from "react";
import {
  Container,
  Typography,
  Box,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Link,
  Paper,
  Stack,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

const BulletListItem = ({ children }: { children: React.ReactNode }) => (
  <ListItem sx={{ py: 0.5, pl: 2 }}>
    <ListItemIcon sx={{ minWidth: 28, color: "text.secondary" }}>
      <FiberManualRecordIcon sx={{ fontSize: "10px" }} />
    </ListItemIcon>
    <ListItemText primary={children} />
  </ListItem>
);

export default function PrivacyPage() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
      <Box sx={{ maxWidth: "896px", mx: "auto" }}>
        <Stack spacing={1}>
          <Typography variant="h3" component="h1" fontWeight="bold">
            Política de Privacidade
          </Typography>
          <Typography color="text.secondary">
            Última atualização: 17 de junho de 2025
          </Typography>
        </Stack>

        <Alert
          severity="info"
          icon={<ShieldOutlinedIcon />}
          sx={{ mt: 4, bgcolor: "info.lightest" }}
        >
          Esta Política de Privacidade descreve como coletamos, usamos e
          compartilhamos suas informações pessoais quando você utiliza o
          USPShare.
        </Alert>

        <Stack
          spacing={4}
          divider={<Divider />}
          sx={{ mt: 6, lineHeight: "1.7" }}
        >
          <Box component="section">
            <Typography variant="h5" component="h2" fontWeight={600} mb={2}>
              1. Introdução
            </Typography>
            <Typography paragraph>
              O USPShare ("nós", "nosso" ou "USPShare") está comprometido em
              proteger sua privacidade. Esta Política de Privacidade explica como
              coletamos, usamos, divulgamos e protegemos suas informações pessoais
              quando você utiliza nosso site, serviços e aplicativos
              (coletivamente, o "Serviço").
            </Typography>
            <Typography paragraph>
              Ao utilizar o USPShare, você concorda com a coleta e uso de
              informações de acordo com esta política. Recomendamos que você leia
              este documento cuidadosamente para entender nossas práticas em
              relação aos seus dados pessoais.
            </Typography>
          </Box>

          <Box component="section">
            <Typography variant="h5" component="h2" fontWeight={600} mb={2}>
              2. Informações que Coletamos
            </Typography>
            <Typography paragraph>
              Coletamos diferentes tipos de informações para fornecer e melhorar
              nosso Serviço:
            </Typography>
            
            <Typography variant="h6" fontWeight={500} mt={3} mb={1}>
              2.1. Informações de Cadastro
            </Typography>
            <Typography>Quando você cria uma conta, coletamos:</Typography>
            <List dense>
              <BulletListItem>Nome completo</BulletListItem>
              <BulletListItem>E-mail institucional da USP (@usp.br)</BulletListItem>
              <BulletListItem>Senha (armazenada de forma criptografada)</BulletListItem>
              <BulletListItem>Unidade/Faculdade da USP</BulletListItem>
              <BulletListItem>Curso e ano de ingresso (opcional)</BulletListItem>
            </List>

            <Typography variant="h6" fontWeight={500} mt={3} mb={1}>
              2.2. Conteúdo Gerado pelo Usuário
            </Typography>
            <Typography>Coletamos materiais, comentários, avaliações e outras interações que você realiza na plataforma.</Typography>

             <Typography variant="h6" fontWeight={500} mt={3} mb={1}>
              2.3. Informações de Uso
            </Typography>
            <Typography>Coletamos automaticamente dados técnicos como endereço IP, tipo de navegador, páginas visitadas e informações do dispositivo.</Typography>

          </Box>

          <Box component="section">
            <Typography variant="h5" component="h2" fontWeight={600} mb={2}>
              3. Como Utilizamos Suas Informações
            </Typography>
            <Typography>
              Utilizamos suas informações para os seguintes propósitos:
            </Typography>
            <List dense>
                <BulletListItem>Fornecer, manter e melhorar o Serviço</BulletListItem>
                <BulletListItem>Verificar sua identidade como membro da comunidade USP</BulletListItem>
                <BulletListItem>Facilitar o compartilhamento de materiais acadêmicos</BulletListItem>
                <BulletListItem>Monitorar e analisar tendências de uso e atividades</BulletListItem>
                <BulletListItem>Detectar e prevenir problemas técnicos e de segurança</BulletListItem>
            </List>
          </Box>

          <Box component="section">
            <Typography variant="h5" component="h2" fontWeight={600} mb={2}>
              4. Compartilhamento de Informações
            </Typography>
            <Typography paragraph>
              Não vendemos, alugamos ou comercializamos suas informações
              pessoais. Suas informações podem ser compartilhadas com outros
              usuários (como seu nome, a menos que opte pelo anonimato) ou com
              prestadores de serviços que nos auxiliam na operação da plataforma
              (ex: provedores de hospedagem), sob estritas obrigações de
              confidencialidade.
            </Typography>
          </Box>

          <Box component="section">
            <Typography variant="h5" component="h2" fontWeight={600} mb={2}>
              5. Segurança dos Dados
            </Typography>
            <Typography paragraph>
              A segurança de suas informações é uma prioridade. Implementamos
              medidas técnicas e organizacionais para proteger seus dados,
              incluindo criptografia e revisões de segurança. No entanto, nenhum
              sistema é 100% seguro, e não podemos garantir segurança absoluta.
            </Typography>
          </Box>
          
          <Box component="section">
            <Typography variant="h5" component="h2" fontWeight={600} mb={2}>
              6. Seus Direitos e Escolhas
            </Typography>
             <Typography paragraph>
              Você pode acessar, atualizar ou solicitar a exclusão de suas informações através das configurações de sua conta. Também oferecemos a opção de compartilhamento anônimo e o controle sobre as notificações que você recebe.
            </Typography>
          </Box>

          <Box component="section">
            <Typography variant="h5" component="h2" fontWeight={600} mb={2}>
              9. Alterações nesta Política de Privacidade
            </Typography>
            <Typography paragraph>
              Podemos atualizar nossa Política de Privacidade periodicamente.
              Notificaremos você sobre quaisquer alterações publicando a nova
              versão nesta página. Recomendamos que você a revise
              periodicamente.
            </Typography>
          </Box>

          <Box component="section">
            <Typography variant="h5" component="h2" fontWeight={600} mb={2}>
              10. Contato
            </Typography>
            <Typography>
              Se você tiver alguma dúvida sobre esta Política de Privacidade,
              entre em contato conosco:
            </Typography>
            <List dense>
                <BulletListItem>
                    <strong>E-mail:</strong>{" "}
                    <Link href="mailto:privacidade@uspshare.com.br" underline="hover">
                        privacidade@uspshare.com.br
                    </Link>
                </BulletListItem>
                <BulletListItem>
                    <strong>Formulário:</strong>{" "}
                     <Link component={RouterLink} to="/contact" underline="hover">
                        Página de Contato
                    </Link>
                </BulletListItem>
            </List>
          </Box>
        </Stack>

        <Paper sx={{ mt: 6, p: 3, textAlign: "center", bgcolor: "action.hover" }} variant="outlined">
            <Typography>
              Ao utilizar o USPShare, você confirma que leu, entendeu e concorda
              com esta Política de Privacidade.
            </Typography>
        </Paper>

      </Box>
    </Container>
  );
}