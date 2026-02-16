import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Container, 
  Paper, 
  Grid, 
  Divider 
} from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';

import { getUserById, changePasswordUser } from '../../services/userService';
import { changePasswordSchema } from '../../schemas/user';
import { getAuthUser } from '../../utils/auth';
import ErrorMessage from '../../components/ErrorMessage';

const ChangePasswordUserPage = () => {
    const navigate = useNavigate();
    const userInfo = getAuthUser();
    
    const [errors, setErrors] = useState([]);
    const [userDisplay, setUserDisplay] = useState({
        nombre: '', apellido: '', email: '', rol: ''    
    });
    const [formDataChange, setFormDataChange] = useState({       
        newPassword:'',
        oldPassword:'' // Ajustado al nombre que usas en tu lógica
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                if (userInfo?.id) {
                    const response = await getUserById(userInfo.id);
                    setUserDisplay(response.data);
                }
            } catch (error) {
                console.error('Error fetching user info:', error);
            }
        };
        fetchUser();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormDataChange({ ...formDataChange, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors([]);

        try {
            const resultado = changePasswordSchema.safeParse(formDataChange);
            
            if (!resultado.success) {
                const listaErrores = resultado.error.issues.map(issue => ({
                    campo: issue.path[0],
                    mensaje: issue.message
                }));
                setErrors(listaErrores);
            } else {
                // Enviamos el ID y los datos al servicio
                await changePasswordUser(userInfo.id, formDataChange);
                alert('✅ Contraseña cambiada con éxito. Inicia sesión de nuevo.');
                navigate('/users/login');
            }
        } catch (error) {
            const serverMessage = error.response?.data?.msg || 'La contraseña actual es incorrecta';
            setErrors([{ campo: 'AUTH', mensaje: serverMessage }]);
        }
    }      

    return (
        <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LockResetIcon color="primary" /> Cambiar Contraseña
                </Typography>

                {/* Sección informativa (Deshabilitada) */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Nombre" value={userDisplay.nombre} disabled variant="filled" size="small" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Apellido" value={userDisplay.apellido} disabled variant="filled" size="small" />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField fullWidth label="Email" value={userDisplay.email} disabled variant="filled" size="small" />
                    </Grid>
                </Grid>

                <Divider sx={{ my: 3 }}>SEGURIDAD</Divider>

                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                type="password"
                                name="oldPassword"
                                label="Contraseña Actual"
                                value={formDataChange.oldPassword}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                type="password"
                                name="newPassword"
                                label="Nueva Contraseña"
                                value={formDataChange.newPassword}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 2 }}>
                        <ErrorMessage errors={errors} />
                    </Box>

                    <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                        <Button 
                            type="submit" 
                            variant="contained" 
                            fullWidth
                            size="large"
                        >
                            Cambiar ahora
                        </Button>
                        <Button 
                            variant="outlined" 
                            color="inherit"
                            fullWidth 
                            onClick={() => navigate('/')}
                        >
                            Cancelar
                        </Button>
                    </Stack>
                </Box>
            </Paper>
        </Container>
    );
}

export default ChangePasswordUserPage;