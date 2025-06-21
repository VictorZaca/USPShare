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

// Material-UI Icons
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

// Helper component for creating bulleted list items
const BulletListItem = ({ children }: { children: React.ReactNode }) => (
  <ListItem sx={{ py: 0.5, pl: 2 }}>
    <ListItemIcon sx={{ minWidth: 28, color: "text.secondary" }}>
      <FiberManualRecordIcon sx={{ fontSize: "10px" }} />
    </ListItemIcon>
    <ListItemText primary={children} />
  </ListItem>
);

export default function TermsPage() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
      <Box sx={{ maxWidth: "896px", mx: "auto" }}>
        <Stack spacing={1}>
          <Typography variant="h3" component="h1" fontWeight="bold">
            Termos de Uso
          </Typography>
          <Typography color="text.secondary">
            Última atualização: 17 de junho de 2025
          </Typography>
        </Stack>

        <Alert
          severity="info"
          icon={<InfoOutlinedIcon />}
          sx={{ mt: 4, bgcolor: "info.lightest" }}
        >
          Este documento estabelece os termos e condições para uso da plataforma
          USPShare. Ao utilizar nossos serviços, você concorda com estes termos.
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
              Bem-vindo ao USPShare. Estes Termos de Uso ("Termos") regem seu
              acesso e uso do site, conteúdos e serviços (o "Serviço"). Ao
              utilizar o Serviço, você concorda em cumprir e estar vinculado a
              estes Termos. Se você não concordar, não poderá utilizar o Serviço.
            </Typography>
          </Box>

          <Box component="section">
            <Typography variant="h5" component="h2" fontWeight={600} mb={2}>
              2. Elegibilidade
            </Typography>
            <Typography>
              O Serviço é destinado exclusivamente a membros da comunidade da
              Universidade de São Paulo (USP). Para utilizar o Serviço, você
              deve possuir um e-mail institucional válido da USP (@usp.br) e ser
              capaz de celebrar um contrato vinculativo conosco.
            </Typography>
          </Box>

          <Box component="section">
            <Typography variant="h5" component="h2" fontWeight={600} mb={2}>
              3. Contas e Registro
            </Typography>
            <Typography>
              Ao criar uma conta, você concorda em:
            </Typography>
            <List dense>
              <BulletListItem>
                Fornecer informações precisas, atuais e completas.
              </BulletListItem>
              <BulletListItem>
                Manter a segurança de sua senha e aceitar todos os riscos de
                acesso não autorizado.
              </BulletListItem>
              <BulletListItem>
                Notificar-nos imediatamente sobre qualquer violação de
                segurança ou uso não autorizado de sua conta.
              </BulletListItem>
            </List>
          </Box>

          <Box component="section">
            <Typography variant="h5" component="h2" fontWeight={600} mb={2}>
              4. Conteúdo do Usuário
            </Typography>
            <Typography paragraph>
              Você é responsável por todo o conteúdo que compartilha ("Conteúdo
              do Usuário"). Ao enviar conteúdo, você nos concede uma licença
              mundial, não exclusiva e isenta de royalties para usar, armazenar
              e distribuir esse conteúdo em conexão com o Serviço.
            </Typography>
            <Typography>
              Reservamo-nos o direito de remover qualquer Conteúdo do Usuário
              que viole estes Termos.
            </Typography>
          </Box>

          <Box component="section">
            <Typography variant="h5" component="h2" fontWeight={600} mb={2}>
              5. Uso Ético e Conteúdo Proibido
            </Typography>
            <Typography>
              Você concorda em não compartilhar conteúdo que:
            </Typography>
            <List dense>
              <BulletListItem>
                Viole direitos autorais ou outras leis.
              </BulletListItem>
              <BulletListItem>
                Seja ilegal, ofensivo, ou contenha vírus.
              </BulletListItem>
              <BulletListItem>
                Viole políticas de integridade acadêmica da USP ou incentive o
                plágio.
              </BulletListItem>
            </List>
            <Typography paragraph sx={{ mt: 2 }}>
              O USPShare deve ser usado como uma ferramenta de estudo e
              referência, não para promover desonestidade acadêmica.
            </Typography>
          </Box>

          <Box component="section">
            <Typography variant="h5" component="h2" fontWeight={600} mb={2}>
              9. Limitação de Responsabilidade
            </Typography>
            <Typography paragraph>
              O Serviço é fornecido "como está", sem garantias de qualquer tipo.
              Em nenhuma circunstância seremos responsáveis por quaisquer danos
              indiretos, incidentais, especiais ou consequenciais resultantes do
              uso do Serviço.
            </Typography>
          </Box>

          <Box component="section">
            <Typography variant="h5" component="h2" fontWeight={600} mb={2}>
              10. Modificações dos Termos
            </Typography>
            <Typography paragraph>
              Reservamo-nos o direito de modificar estes Termos a qualquer
              momento. Notificaremos sobre alterações materiais com
              antecedência. Ao continuar a usar o Serviço após as revisões,
              você concorda em estar vinculado aos novos termos.
            </Typography>
          </Box>

          <Box component="section">
            <Typography variant="h5" component="h2" fontWeight={600} mb={2}>
              12. Contato
            </Typography>
            <Typography>
              Se você tiver alguma dúvida sobre estes Termos, entre em contato
              conosco:
            </Typography>
            <List dense>
              <BulletListItem>
                <strong>E-mail:</strong>{" "}
                <Link href="mailto:termos@uspshare.com.br" underline="hover">
                  termos@uspshare.com.br
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

        <Paper
          sx={{ mt: 6, p: 3, textAlign: "center", bgcolor: "action.hover" }}
          variant="outlined"
        >
          <Typography>
            Ao utilizar o USPShare, você confirma que leu, entendeu e concorda
            com estes Termos de Uso.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}