import React, { useState, useEffect } from 'react';
import { 
  Box, Button, TextField, Typography, Paper, 
  Avatar, CircularProgress, InputAdornment, IconButton 
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { toast } from 'react-toastify';

// Importaciones según tu estructura
import { loginUser } from '../../services/userService';
import { saveAuth } from '../../utils/auth';
import { loginSchema } from '../../schemas/user';

const LoginUserPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // 1. Validación con Zod
    const validation = loginSchema.safeParse(formData);
    if (!validation.success) {
      const newErrors = {};
      validation.error.errors.forEach((err) => {
        newErrors[err.path[0]] = err.message;
      });
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      // 2. Llamada al servicio (Apunta a /users/login)
      const response = await loginUser(formData);
      
      // Desestructuramos lo que envía tu backend: { ok, token, msg }
      const { token, msg } = response.data;

      if (token) {
        // Como el backend no manda el objeto usuario, creamos uno básico
        // para que el Navbar o el Layout no den error al intentar leerlo.
        const usuarioSesion = {
          email: formData.email,
          rol: 'ADMIN_ROLE', // Rol por defecto
          nombre: 'Administrador'
        };

        // Guardamos en LocalStorage
        saveAuth(token, usuarioSesion);
        toast.success(msg || '¡Acceso exitoso!');

        // 3. Redirección al Home
        setTimeout(() => {
          window.location.href = '/'; 
        }, 500);
      }
    } catch (error) {
      console.error('Error de login:', error);
      const message = error.response?.data?.msg || 'Credenciales inválidas o error de servidor';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '85vh' }}>
      <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '400px', borderRadius: 3 }}>
        <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 56, height: 56 }}>
          <LockOutlinedIcon fontSize="large" />
        </Avatar>
        <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold' }}>
          Biblioteca Escolar
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Correo Electrónico"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: 'bold' }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Acceder al Panel'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginUserPage;