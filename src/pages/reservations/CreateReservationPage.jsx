import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  Grid, 
  TextField, 
  MenuItem, 
  Button, 
  Stack, 
  Divider,
  CircularProgress
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { toast } from 'react-toastify';

// Servicios y lógica
import { reservationService } from '../../services/reservationService';
import { studentService } from '../../services/studentService';
import { bookService } from '../../services/bookService';
import { reservationZodSchema } from '../../schemas/reservation';
import ErrorMessage from '../../components/ErrorMessage';

const CreateReservationPage = () => {
    const navigate = useNavigate();
    
    // Estados de datos
    const [students, setStudents] = useState([]);
    const [books, setBooks] = useState([]);
    const [formData, setFormData] = useState({
        estudiante: '',
        libro: '',
        fechaReservacion: new Date().toISOString().split('T')[0],
        fechaVencimiento: ''
    });

    // Estados de control
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const loadData = async () => {
        try {
            setFetching(true);
            const [resStudents, resBooks] = await Promise.all([
                studentService.getAll(),
                bookService.getAll()
            ]);
            
            // Filtrar solo estudiantes activos y libros con stock disponible
            setStudents(resStudents.data?.filter(s => s.estado === 'activo') || []);
            setBooks(resBooks.data?.filter(b => b.ejemplaresDisponibles > 0) || []);
            
        } catch (error) {
            toast.error('Error al cargar catálogos para la reservación');
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors.length > 0) setErrors([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // 1. Validar con Zod
            const result = reservationZodSchema.safeParse(formData);
            
            if (!result.success) {
                const issues = result.error.issues.map(i => ({
                    campo: i.path[0],
                    mensaje: i.message
                }));
                setErrors(issues);
                return;
            }

            setLoading(true);
            await reservationService.create(formData);
            toast.success('Reservación confirmada correctamente');
            navigate('/reservations');

        } catch (error) {
            const msg = error.response?.data?.error || 'Error al procesar la reservación';
            setErrors([{ campo: 'SERVER', mensaje: msg }]);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress sx={{ color: '#1a237e', mb: 2 }} />
                <Typography color="textSecondary">Sincronizando disponibilidad de libros...</Typography>
            </Box>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
            {/* Encabezado con identidad visual */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '5px solid #1a237e', pl: 2 }}>
                <Box>
                    <Typography variant="h4" sx={{ color: '#1a237e', fontWeight: 800 }}>
                        Nueva Reservación
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#64748b' }}>
                        Apartado temporal de material bibliográfico
                    </Typography>
                </Box>
                <Button 
                    variant="outlined" 
                    startIcon={<ArrowBackIcon />} 
                    onClick={() => navigate('/reservations')}
                    sx={{ borderRadius: '10px', textTransform: 'none' }}
                >
                    Volver
                </Button>
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
                        {/* Selector de Estudiante */}
                        <Grid item xs={12}>
                            <TextField
                                select
                                fullWidth
                                label="Estudiante solicitante"
                                name="estudiante"
                                value={formData.estudiante}
                                onChange={handleChange}
                                error={errors.some(e => e.campo === 'estudiante')}
                                helperText={errors.find(e => e.campo === 'estudiante')?.mensaje}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                            >
                                <MenuItem value="">-- Seleccione estudiante activo --</MenuItem>
                                {students.map(s => (
                                    <MenuItem key={s._id} value={s._id}>
                                        {s.carnet} - {s.nombres} {s.apellidos}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        {/* Selector de Libro */}
                        <Grid item xs={12}>
                            <TextField
                                select
                                fullWidth
                                label="Libro a reservar"
                                name="libro"
                                value={formData.libro}
                                onChange={handleChange}
                                error={errors.some(e => e.campo === 'libro')}
                                helperText={errors.find(e => e.campo === 'libro')?.mensaje}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                            >
                                <MenuItem value="">-- Seleccione libro con stock --</MenuItem>
                                {books.map(b => (
                                    <MenuItem key={b._id} value={b._id}>
                                        {b.titulo} (Disponibles: {b.ejemplaresDisponibles})
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        {/* Fechas */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                type="date"
                                label="Fecha de Reservación"
                                name="fechaReservacion"
                                value={formData.fechaReservacion}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                type="date"
                                label="Fecha de Vencimiento (Recojo)"
                                name="fechaVencimiento"
                                value={formData.fechaVencimiento}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                                error={errors.some(e => e.campo === 'fechaVencimiento')}
                                helperText={errors.find(e => e.campo === 'fechaVencimiento')?.mensaje || "Fecha límite para retirar el libro."}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Divider sx={{ my: 2, borderColor: '#f1f5f9' }} />
                            <Stack direction="row" spacing={2} justifyContent="flex-end">
                                <Button
                                    variant="contained"
                                    size="large"
                                    type="submit"
                                    disabled={loading}
                                    startIcon={loading ? <CircularProgress size={20} /> : <CalendarMonthIcon />}
                                    sx={{ 
                                        borderRadius: '10px', 
                                        px: 4,
                                        bgcolor: '#1a237e',
                                        '&:hover': { bgcolor: '#0d1440' },
                                        textTransform: 'none',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {loading ? 'Confirmando...' : 'Confirmar Reservación'}
                                </Button>
                            </Stack>
                        </Grid>
                    </Grid>
                </Box>

                {errors.some(e => e.campo === 'SERVER') && (
                    <Box sx={{ mt: 3 }}>
                        <ErrorMessage errors={errors.filter(e => e.campo === 'SERVER')} />
                    </Box>
                )}
            </Paper>
        </Container>
    );
};

export default CreateReservationPage;