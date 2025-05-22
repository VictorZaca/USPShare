import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link as RouterLink } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';

import LandingPage from './pages/LandingPage';
import ExplorePage from './pages/ExplorePage';  // placeholder
// import UploadPage from './pages/UploadPage';    // placeholder
// import LoginPage from './pages/LoginPage';      // placeholder

export default function App() {
  const [mode, setMode] = useState<"light" | "dark">('light');
  const theme = React.useMemo(
    () => createTheme({ palette: { mode } }),
    [mode]
  );
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleTheme = () => setMode(prev => prev === 'light' ? 'dark' : 'light');
  const toggleDrawer = (open: boolean | ((prevState: boolean) => boolean)) => () => setDrawerOpen(open);

  const navItems = [
    { label: 'Explorar', path: '/explore' },
    { label: 'Compartilhar', path: '/upload' },
    { label: 'Entrar', path: '/login' }
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppBar position="sticky">
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={toggleDrawer(true)}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1 }} component={RouterLink} to="/" color="inherit" style={{ textDecoration: 'none' }}>
              USPShare
            </Typography>
            <IconButton color="inherit" onClick={toggleTheme}>
              {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
            </IconButton>
          </Toolbar>
        </AppBar>
        <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
          <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
            <List>
              {navItems.map(item => (
                <ListItem type='button' key={item.label} component={RouterLink} to={item.path}>
                  <ListItemText primary={item.label} />
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>
        <Box component="main">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/explore" element={<ExplorePage />} />
            {/* <Route path="/upload" element={<UploadPage />} />
            <Route path="/login" element={<LoginPage />} /> */}
          </Routes>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}