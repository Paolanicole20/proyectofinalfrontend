import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, TextField, Button, Typography, Container, 
  Paper, Grid, Stack, MenuItem, Divider, CircularProgress,
  InputAdornment
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { toast } from 'react-toastify';

// Servicios y lógica
import { fineService } from '../../services/fineService';
import { studentService } from '../../services/studentService';
import { fineZodSchema } from '../../schemas/fine';
import ErrorMessage from '../../components/ErrorMessage';

const CreateFinePage = () => {
    const navigate = useNavigate();
    
    // Estados de datos
    const [students, setStudents] = useState([]);
    const [formData, setFormData] = useState({
        estudiante: '',
        monto: '',
        motivo: '',
        fecha: new Date().toISOString().split('T')[0]
    });

    // Estados de control y UI
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingStudents, setFetchingStudents] = useState(true);

    // Cargar lista de estudiantes
    const loadStudents = async () => {
        try {
            setFetchingStudents(true);
            const response = await studentService.getAll();
            setStudents(response.data || []);
        } catch (error) {
            toast.error('Error al cargar la lista de estudiantes');
        } finally {
            setFetchingStudents(false);
        }
    };

    useEffect(() => {
        loadStudents();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'monto' ? (value === '' ? '' : parseFloat(value)) : value
        }));
        if (errors.length > 0) setErrors([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors([]);

        try {
            // 1. Validar con Zod
            const result = fineZodSchema.safeParse(formData);
            if (!result.success) {
                const issues = result.error.issues.map(i => ({
                    campo: i.path[0],
                    mensaje: i.message
                }));
                setErrors(issues);
                return;
            }

            // 2. Enviar al servidor
            setLoading(true);
            await fineService.create(formData);
            toast.success('Multa registrada exitosamente');
            navigate('/fines');

        } catch (error) {
            const msg = error.response?.data?.error || 'Error al crear la multa';
            setErrors([{ campo: 'SERVER', mensaje: msg }]);
        } finally {
            setLoading(false);
        }
    };

    if (fetchingStudents) {
        return (
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress sx={{ color: '#1a237e', mb: 2 }} />
                <Typography color="textSecondary">Cargando base de datos de estudiantes...</Typography>
            </Box>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
            {/* Encabezado */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '5px solid #d32f2f', pl: 2 }}>
                <Box>
                    <Typography variant="h4" sx={{ color: '#1a237e', fontWeight: 800 }}>
                        Registrar Multa
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#64748b' }}>
                        Asignación de cargos por daños, retrasos o extravíos
                    </Typography>
                </Box>
                <Button 
                    variant="outlined" 
                    startIcon={<ArrowBackIcon />} 
                    onClick={() => navigate('/fines')}
                    sx={{ borderRadius: '10px', textTransform: 'none', color: '#64748b', borderColor: '#cbd5e1' }}
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
                        {/* Estudiante */}
                        <Grid item xs={12}>
                            <TextField
                                select
                                fullWidth
                                label="Estudiante responsable"
                                name="estudiante"
                                value={formData.estudiante}
                                onChange={handleChange}
                                error={errors.some(e => e.campo === 'estudiante')}
                                helperText={errors.find(e => e.campo === 'estudiante')?.mensaje}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                            >
                                <MenuItem value="">-- Seleccione un estudiante --</MenuItem>
                                {students.map(student => (
                                    <MenuItem key={student._id} value={student._id}>
                                        {student.carnet} - {student.nombres} {student.apellidos}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        {/* Monto */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Monto del cargo"
                                name="monto"
                                value={formData.monto}
                                onChange={handleChange}
                                placeholder="0.00"
                                error={errors.some(e => e.campo === 'monto')}
                                helperText={errors.find(e => e.campo === 'monto')?.mensaje}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                    inputProps: { step: 0.01, min: 0 }
                                }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                            />
                        </Grid>

                        {/* Fecha */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                type="date"
                                label="Fecha de emisión"
                                name="fecha"
                                value={formData.fecha}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                                error={errors.some(e => e.campo === 'fecha')}
                                helperText={errors.find(e => e.campo === 'fecha')?.mensaje}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                            />
                        </Grid>

                        {/* Motivo */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                label="Concepto o Motivo detallado"
                                name="motivo"
                                value={formData.motivo}
                                onChange={handleChange}
                                placeholder="Describa el daño o el motivo del cargo..."
                                error={errors.some(e => e.campo === 'motivo')}
                                helperText={errors.find(e => e.campo === 'motivo')?.mensaje}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Divider sx={{ my: 2, borderColor: '#f1f5f9' }} />
                            <Stack direction="row" spacing={2} justifyContent="flex-end">
                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    disabled={loading}
                                    startIcon={loading ? <CircularProgress size={20} /> : <AccountBalanceWalletIcon />}
                                    sx={{ 
                                        borderRadius: '10px', 
                                        px: 4,
                                        bgcolor: '#d32f2f', // Color rojo para denotar cargo/multa
                                        '&:hover': { bgcolor: '#b71c1c' },
                                        textTransform: 'none',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {loading ? 'Procesando...' : 'Registrar Multa'}
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

export default CreateFinePage;