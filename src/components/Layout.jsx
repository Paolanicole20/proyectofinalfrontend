import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Box, Drawer, AppBar, Toolbar, List, Typography, ListItem, 
  ListItemButton, ListItemIcon, ListItemText, IconButton, 
  Button, CssBaseline, Divider 
} from '@mui/material';
import {
  Menu as MenuIcon, Logout, Login, Home as HomeIcon,
  People, MenuBook, Category, Assignment, AssignmentReturn,
  MonetizationOn, Event, Settings
} from '@mui/icons-material';

import { getAuthUser, isAuthenticated, hasRole } from '../utils/auth';

const drawerWidth = 260;

const Layout = () => {
  const [user, setUser] = useState(getAuthUser());
  const [auth, setAuth] = useState(isAuthenticated());
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setUser(getAuthUser());
    setAuth(isAuthenticated());
  }, [location]);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/users/login'; // Recarga para limpiar estado
  };

  // Íconos y rutas ajustados a tu Biblioteca
  const menuItems = [
    { to: "/", label: "Inicio", icon: <HomeIcon />, public: true },
    { to: "/students", label: "Estudiantes", icon: <People />, roles: ['ADMIN_ROLE', 'USER_ROLE', 'ADMINISTRADOR', 'USUARIO'] },
    { to: "/books", label: "Libros", icon: <MenuBook />, roles: ['ADMIN_ROLE', 'USER_ROLE', 'ADMINISTRADOR', 'USUARIO'] },
    { to: "/categories", label: "Categorías", icon: <Category />, roles: ['ADMIN_ROLE', 'USER_ROLE', 'ADMINISTRADOR', 'USUARIO'] },
    { to: "/loans", label: "Préstamos", icon: <Assignment />, roles: ['ADMIN_ROLE', 'USER_ROLE', 'ADMINISTRADOR', 'USUARIO'] },
    { to: "/returns", label: "Devoluciones", icon: <AssignmentReturn />, roles: ['ADMIN_ROLE', 'USER_ROLE', 'ADMINISTRADOR', 'USUARIO'] },
    { to: "/fines", label: "Multas", icon: <MonetizationOn />, roles: ['ADMIN_ROLE', 'USER_ROLE', 'ADMINISTRADOR', 'USUARIO'] },
    { to: "/reservations", label: "Reservaciones", icon: <Event />, roles: ['ADMIN_ROLE', 'USER_ROLE', 'ADMINISTRADOR', 'USUARIO'] },
    { to: "/users", label: "Gestión Usuarios", icon: <Settings />, roles: ['ADMIN_ROLE', 'ADMINISTRADOR'] },
  ];

  const drawerContent = (
    <Box sx={{ height: '100%', bgcolor: 'background.paper' }}>
      <Toolbar>
        <Typography variant="subtitle1" fontWeight="bold" color="primary">
          BIBLIOTECA VIRTUAL
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ px: 1 }}>
        {menuItems
          .filter(item => item.public || hasRole(item.roles)) // Usamos tu función hasRole corregida
          .map((item) => (
            <ListItem key={item.to} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton 
                component={Link} 
                to={item.to}
                selected={location.pathname === item.to}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    bgcolor: 'primary.light',
                    color: 'white',
                    '& .MuiListItemIcon-root': { color: 'white' },
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f4f6f8' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: '#1a237e' }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { sm: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            📚 Biblioteca <span style={{ color: '#ffca28' }}>Escolar</span>
          </Typography>
          
          {auth && (
            <Typography variant="body2" sx={{ mr: 2, display: { xs: 'none', md: 'block' } }}>
              {user?.email} | <b>{user?.role}</b>
            </Typography>
          )}

          <Button 
            variant="contained" 
            color={auth ? "secondary" : "warning"}
            onClick={auth ? handleLogout : () => navigate('/users/login')}
            startIcon={auth ? <Logout /> : <Login />}
          >
            {auth ? "Salir" : "Entrar"}
          </Button>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth } }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { width: drawerWidth } }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar />
        <Box sx={{ bgcolor: 'white', p: 3, borderRadius: 2, boxShadow: 1, minHeight: '80vh' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;