import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, TextField, Button, Typography, Container, 
  Paper, Grid, Stack, MenuItem, Divider, CircularProgress 
} from '@mui/material';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import CancelIcon from '@mui/icons-material/Cancel';

// Servicios y lógica
import { getUserById, updateUser } from '../../services/userService';
import { userWithoutPasswordSchema } from '../../schemas/user';
import ErrorMessage from '../../components/ErrorMessage';

const EditUserPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState([]);
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        rol: 'USER_ROLE',
        status: 'active'
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await getUserById(id);
                setFormData({
                    nombre: response.data.nombre || '',
                    apellido: response.data.apellido || '',
                    email: response.data.email || '',
                    telefono: response.data.telefono || '',
                    rol: response.data.rol || 'USER_ROLE',
                    status: response.data.status || 'active'
                });
            } catch (error) {
                console.error('Error fetching user:', error);
                setErrors([{ campo: 'SERVER', mensaje: 'No se pudo cargar el usuario' }]);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors([]);
        
        try {
            const resultado = userWithoutPasswordSchema.safeParse(formData);
            if (!resultado.success) {
                const listaErrores = resultado.error.issues.map(issue => ({
                    campo: issue.path[0],
                    mensaje: issue.message
                }));
                setErrors(listaErrores);
            } else {
                await updateUser(id, formData);
                navigate('/users');
            }
        } catch (error) {
            const serverMessage = error.response?.data?.error || 'Error al actualizar';
            setErrors([{ campo: 'SERVER', mensaje: serverMessage }]);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress sx={{ color: '#1a237e' }} />
            </Box>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
            {/* Encabezado fuera del Paper para dar aire */}
            <Box sx={{ mb: 4, textAlign: 'left', borderLeft: '5px solid #1a237e', pl: 2 }}>
                <Typography variant="h4" sx={{ color: '#1a237e', fontWeight: 800 }}>
                    Editar Perfil
                </Typography>
                <Typography variant="body1" sx={{ color: '#64748b' }}>
                    Actualizando información de: <strong>{formData.nombre} {formData.apellido}</strong>
                </Typography>
            </Box>

            <Paper 
                elevation={0} 
                sx={{ 
                    p: { xs: 3, md: 5 }, 
                    borderRadius: '16px', 
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)'
                }}
            >
                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Nombre"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                variant="outlined"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Apellido"
                                name="apellido"
                                value={formData.apellido}
                                onChange={handleChange}
                                variant="outlined"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={8}>
                            <TextField
                                fullWidth
                                label="Email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                variant="outlined"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Teléfono"
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleChange}
                                variant="outlined"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                fullWidth
                                label="Rol Administrativo"
                                name="rol"
                                value={formData.rol}
                                onChange={handleChange}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                            >
                                <MenuItem value="USER_ROLE">Bibliotecario / Usuario</MenuItem>
                                <MenuItem value="ADMIN_ROLE">Administrador Global</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                fullWidth
                                label="Estado de Cuenta"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                            >
                                <MenuItem value="active">Activo (Acceso permitido)</MenuItem>
                                <MenuItem value="inactive">Inactivo (Acceso restringido)</MenuItem>
                            </TextField>
                        </Grid>

                        <Grid item xs={12}>
                            <Divider sx={{ my: 2, borderColor: '#f1f5f9' }} />
                            <Stack direction="row" spacing={2} justifyContent="flex-end">
                                <Button
                                    variant="outlined"
                                    color="inherit"
                                    size="large"
                                    onClick={() => navigate('/users')}
                                    startIcon={<CancelIcon />}
                                    sx={{ 
                                        borderRadius: '10px', 
                                        px: 4,
                                        color: '#64748b',
                                        borderColor: '#cbd5e1',
                                        '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' }
                                    }}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    startIcon={<SaveAsIcon />}
                                    sx={{ 
                                        borderRadius: '10px', 
                                        px: 4,
                                        bgcolor: '#1a237e',
                                        fontWeight: 'bold',
                                        '&:hover': { bgcolor: '#0d1440' }
                                    }}
                                >
                                    Guardar Cambios
                                </Button>
                            </Stack>
                        </Grid>
                    </Grid>
                </Box>

                {errors.length > 0 && (
                    <Box sx={{ mt: 4, p: 2, bgcolor: '#fff1f2', borderRadius: '10px', border: '1px solid #fda4af' }}>
                        <ErrorMessage errors={errors} />
                    </Box>
                )}
            </Paper>
        </Container>
    );
};

export default EditUserPage;