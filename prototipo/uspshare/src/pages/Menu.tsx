// src/Navbar.js - VERSÃO ATUALIZADA (Mínimas Alterações)

import React, { useState, useContext, useEffect } from "react";
import { useLocation, Link as RouterLink, useNavigate } from "react-router-dom"; // Adicionado useNavigate
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Stack,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Drawer,
  List,
  ListItemButton,
  Box,
  Divider,
  Collapse,
  TextField,
  InputAdornment,
  useTheme,
  Badge,
} from "@mui/material";

import { useAuth } from "../context/AuthContext";
import apiClient from "../api/axios";


// Seus imports de ícones...
import MenuIcon from "@mui/icons-material/Menu";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import LoginIcon from '@mui/icons-material/Login';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7'; 
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import GavelIcon from '@mui/icons-material/Gavel';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import NotificationsIcon from '@mui/icons-material/Notifications';

import { ColorModeContext } from "../App";

interface Notification {
  id: string;
  actorName: string;
  message: string;
  resourceId: string;
  commentId?: string; 
  isRead: boolean;
  createdAt: string;
}

export default function Navbar() {
  // const [isLoggedIn, setIsLoggedIn] = useState(false);
  const auth = useAuth();
  if (!auth) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  const { isAuthenticated, user, logout } = auth;
  const navigate = useNavigate();
  // --- FIM DA ALTERAÇÃO 2 ---

  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [anchorElUser, setAnchorElUser] = useState<HTMLButtonElement | null>(null);
  const [anchorElMore, setAnchorElMore] = useState<HTMLButtonElement | null>(null);
  const location = useLocation();

  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);
  const handleOpenMoreMenu = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorElMore(event.currentTarget);
  const handleCloseMoreMenu = () => setAnchorElMore(null);

  const [anchorElNotifications, setAnchorElNotifications] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const handleOpenNotificationsMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorElNotifications(event.currentTarget);
  const handleCloseNotificationsMenu = () => setAnchorElNotifications(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (isAuthenticated) {
        try {
          const response = await apiClient.get<Notification[]>('/api/notifications');
          setNotifications(response.data || []);
        } catch (error) {
          console.error("Failed to fetch notifications:", error);
        }
      } else {
        setNotifications([]); // Limpa as notificações ao fazer logout
      }
    };

    fetchNotifications();
    // Você pode adicionar um polling aqui para buscar de tempos em tempos
    const interval = setInterval(fetchNotifications, 60000); // Ex: a cada 60 segundos
    return () => clearInterval(interval);

  }, [isAuthenticated]); // Roda quando o status de login muda

  // --- ALTERAÇÃO: Lógica para marcar notificação como lida ---
  const handleNotificationClick = async (notification: Notification) => {
    handleCloseNotificationsMenu();
    navigate(`/file/${notification.resourceId}?highlight=${notification.commentId}#${notification.commentId}`);

    // Se a notificação ainda não foi lida, marca como lida
    if (!notification.isRead) {
      try {
        await apiClient.post(`/api/notifications/${notification.id}/read`);
        // Atualiza o estado local para a UI responder instantaneamente
        setNotifications(prev =>
          prev.map(n =>
            n.id === notification.id ? { ...n, isRead: true } : n
          )
        );
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    }
  };

  // Calcula a contagem de notificações não lidas
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // SEU ARRAY DE LINKS ORIGINAL, SEM MUDANÇAS
  const navLinks = [
    { text: "Explorar", href: "/explore", icon: <ExploreOutlinedIcon /> },
    { text: "Compartilhar", href: "/upload", icon: <FileUploadOutlinedIcon /> },
  ];

  const moreLinks = [
      { text: "Sobre o USPShare", href: "/about", icon: <InfoOutlinedIcon /> },
      { text: "Perguntas Frequentes", href: "/faq", icon: <HelpOutlineIcon /> },
      { text: "Termos de Uso", href: "/terms", icon: <GavelIcon /> },
      { text: "Contato", href: "/contact", icon: <EmailOutlinedIcon /> },
  ]

  interface NavButtonProps {
    href: string;
    children: React.ReactNode;
  }

  const NavButton: React.FC<NavButtonProps> = ({ href, children }) => (
    <Button
      component={RouterLink}
      to={href}
      color={location.pathname === href ? "primary" : "inherit"}
      variant={location.pathname === href ? "text" : "text"}
    >
      {children}
    </Button>
  );

  const handleLogout = () => {
    handleCloseUserMenu();
    logout();
    navigate('/');
  };

  return (
    <AppBar
      position="sticky"
      color="default"
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        backdropFilter: "blur(8px)",
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Toolbar>        
        <Stack direction="row" alignItems="center" spacing={1} sx={{ flexGrow: { xs: 1, md: 0 } }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(true)}
            sx={{ display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Button component={RouterLink} to="/" color="inherit" startIcon={<MenuBookIcon />}>
            <Typography variant="h6" component="div" sx={{ display: { xs: "none", sm: "block" } }}>
              USPShare
            </Typography>
          </Button>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ display: { xs: "none", md: "flex" }, ml: 2 }}>
          {navLinks.map((link) => (
            <NavButton key={link.href} href={link.href}>{link.text}</NavButton>
          ))}
          <Button
            color="inherit"
            onClick={handleOpenMoreMenu}
            endIcon={<KeyboardArrowDownIcon />}
          >
            Mais
          </Button>
           <Menu
            anchorEl={anchorElMore}
            open={Boolean(anchorElMore)}
            onClose={handleCloseMoreMenu}
           >
            {moreLinks.map((link) => (
                 <MenuItem key={link.href} onClick={handleCloseMoreMenu} component={RouterLink} to={link.href}>
                    <ListItemIcon>{link.icon}</ListItemIcon>
                    <ListItemText>{link.text}</ListItemText>
                </MenuItem>
            ))}
           </Menu>
        </Stack>
        
        <Box sx={{ flexGrow: 1 }} />

        <Stack direction="row" alignItems="center" spacing={1}>
           <Stack direction="row" alignItems="center" sx={{ display: { xs: "none", md: "flex" } }}>
                <Collapse in={!isSearchOpen} orientation="horizontal" timeout={300}>
                     <IconButton color="inherit" onClick={() => setSearchOpen(true)}>
                        <SearchIcon />
                    </IconButton>
                </Collapse>
                <Collapse in={isSearchOpen} orientation="horizontal" timeout={300}>
                    <TextField
                        autoFocus
                        size="small"
                        placeholder="Buscar materiais..."
                        onBlur={() => setSearchOpen(false)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Collapse>
            </Stack>

          <IconButton color="inherit" component={RouterLink} to="/search" sx={{ display: { md: "none" } }}>
            <SearchIcon />
          </IconButton>
          
          <IconButton sx={{ ml: 1 }} onClick={colorMode.toggleColorMode} color="inherit">
            {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          
          {isAuthenticated ? (
            <>
              <IconButton color="inherit" onClick={handleOpenNotificationsMenu}>
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
               <Menu
                    anchorEl={anchorElNotifications}
                    open={Boolean(anchorElNotifications)}
                    onClose={handleCloseNotificationsMenu}
                    slotProps={{ list: { 'aria-labelledby': 'notifications-button' } }}
                    sx={{ mt: 1 }}
                  >
                <MenuItem disabled>
                    <Typography variant="subtitle1" sx={{ px: 1 }}>Notificações</Typography>
                </MenuItem>
                <Divider />
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <MenuItem 
                      key={notification.id} 
                      onClick={() => handleNotificationClick(notification)}
                      // Destaca notificações não lidas
                      sx={{ fontWeight: notification.isRead ? 'normal' : 'bold', bgcolor: notification.isRead ? 'transparent' : 'action.hover' }}
                    >
                      <ListItemText 
                        primary={`${notification.actorName} ${notification.message}`}
                        secondary={new Date(notification.createdAt).toLocaleString('pt-BR')}
                      />
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>
                    <ListItemText primary="Nenhuma notificação nova." />
                  </MenuItem>
                )}
              </Menu>

              <IconButton onClick={handleOpenUserMenu}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                  {user?.initial}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorElUser}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                <MenuItem component={RouterLink} to="/profile" onClick={handleCloseUserMenu}>
                    <ListItemIcon><AccountCircleOutlinedIcon fontSize="small"/></ListItemIcon>
                    <ListItemText>Meu Perfil</ListItemText>
                </MenuItem>
                 <MenuItem component={RouterLink} to="/uploads" onClick={handleCloseUserMenu}>
                    <ListItemIcon><DescriptionOutlinedIcon fontSize="small"/></ListItemIcon>
                    <ListItemText>Meus Uploads</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                    <ListItemIcon><LogoutOutlinedIcon fontSize="small" color="error"/></ListItemIcon>
                    <ListItemText sx={{color: 'error.main'}}>Sair</ListItemText>
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              component={RouterLink}
              to="/login"
              variant="outlined"
              startIcon={<LoginIcon />}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Entrar</Box>
            </Button>
          )}
        </Stack>
        
        {/* SEU DRAWER CONTINUA IGUAL */}
        <Drawer anchor="left" open={isDrawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box sx={{ width: 250 }} role="presentation">
            <Toolbar>
                <Button component={RouterLink} to="/" color="inherit" startIcon={<MenuBookIcon />}>
                    <Typography variant="h6">USPShare</Typography>
                </Button>
            </Toolbar>
            <Divider />
            <List>
              {[...navLinks, ...moreLinks.slice(0, 2)].map((link) => (
                <ListItemButton
                  key={link.href}
                  component={RouterLink}
                  to={link.href}
                  selected={location.pathname === link.href}
                  onClick={() => setDrawerOpen(false)}
                >
                  <ListItemIcon>{link.icon}</ListItemIcon>
                  <ListItemText primary={link.text} />
                </ListItemButton>
              ))}
            </List>
          </Box>
        </Drawer>
      </Toolbar>
    </AppBar>
  );
}