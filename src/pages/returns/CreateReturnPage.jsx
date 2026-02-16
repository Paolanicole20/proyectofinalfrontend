import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { returnService } from '../../services/returnService';
import { loanService } from '../../services/loanService';
import { returnZodSchema } from '../../schemas/return';
import ErrorMessage from '../../components/ErrorMessage';
import { toast } from 'react-toastify';


const CreateReturnPage = () => {
  const navigate = useNavigate();
  
  // Estados de datos
  const [activeLoans, setActiveLoans] = useState([]);
  const [formData, setFormData] = useState({
    prestamo: '',
    fechaDevolucionReal: new Date().toISOString().split('T')[0],
    estadoLibro: '',
    observaciones: ''
  });

  // Estados de control y UI
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingLoans, setFetchingLoans] = useState(true);
  const [diasRetraso, setDiasRetraso] = useState(0);

  // Cargar préstamos activos para el selector
  const loadLoans = async () => {
    try {
      setFetchingLoans(true);
      const response = await loanService.getAll();
      // Solo nos interesan los libros que aún no han sido devueltos
      const activos = response.data.filter(l => l.estado === 'activo');
      setActiveLoans(activos);
    } catch (error) {
      toast.error('Error al cargar préstamos activos');
    } finally {
      setFetchingLoans(false);
    }
  };

  useEffect(() => {
    loadLoans();
  }, []);

  // Lógica para calcular retraso en tiempo real
  const calculateDelay = (loanId, returnDate) => {
    const loan = activeLoans.find(l => l._id === loanId);
    if (!loan || !returnDate) {
      setDiasRetraso(0);
      return;
    }

    const fechaEsperada = new Date(loan.fechaDevolucionEsperada);
    const fechaReal = new Date(returnDate);
    
    // Solo contamos días si la fecha real es posterior a la esperada
    const diffTime = fechaReal - fechaEsperada;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    setDiasRetraso(diffDays > 0 ? diffDays : 0);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);

    // Si cambia el préstamo o la fecha, recalculamos el retraso
    if (name === 'prestamo' || name === 'fechaDevolucionReal') {
      calculateDelay(
        name === 'prestamo' ? value : formData.prestamo,
        name === 'fechaDevolucionReal' ? value : formData.fechaDevolucionReal
      );
    }

    if (errors.length > 0) setErrors([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // 1. Validar con Zod
      const result = returnZodSchema.safeParse(formData);
      
      if (!result.success) {
        const issues = result.error.issues.map(i => ({
          campo: i.path[0],
          mensaje: i.message
        }));
        setErrors(issues);
        return;
      }

      // 2. Enviar al servidor incluyendo los días de retraso calculados
      setLoading(true);
      await returnService.create({
        ...formData,
        diasRetraso
      });

      toast.success('Libro recibido correctamente');
      if (diasRetraso > 0) {
        toast.warning(`Atención: Se ha registrado una multa por ${diasRetraso} días.`);
      }
      
      navigate('/returns');

    } catch (error) {
      const msg = error.response?.data?.error || 'Error al registrar la devolución';
      setErrors([{ campo: 'SERVER', mensaje: msg }]);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingLoans) return <div className="loading-state">Buscando préstamos pendientes...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">↩️ Registrar Devolución</h2>
          <p className="page-description">Complete el formulario al recibir un ejemplar de vuelta</p>
        </div>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            
            <div className="form-group">
              <label>Seleccionar Préstamo Activo:</label>
              <select
                name="prestamo"
                value={formData.prestamo}
                onChange={handleChange}
                className={errors.some(e => e.campo === 'prestamo') ? 'input-error' : ''}
              >
                <option value="">-- Buscar por Estudiante o Libro --</option>
                {activeLoans.map(l => (
                  <option key={l._id} value={l._id}>
                    {l.estudiante?.nombres} - {l.libro?.titulo} (Vencía: {new Date(l.fechaDevolucionEsperada).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Fecha de Recepción:</label>
              <input
                type="date"
                name="fechaDevolucionReal"
                value={formData.fechaDevolucionReal}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Estado Físico del Libro:</label>
              <select
                name="estadoLibro"
                value={formData.estadoLibro}
                onChange={handleChange}
                className={errors.some(e => e.campo === 'estadoLibro') ? 'input-error' : ''}
              >
                <option value="">-- Seleccionar Estado --</option>
                <option value="Excelente">Excelente</option>
                <option value="Bueno">Bueno</option>
                <option value="Regular">Regular</option>
                <option value="Dañado">Dañado (Requiere Multa)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Días de Retraso:</label>
              <input
                type="text"
                value={diasRetraso > 0 ? `${diasRetraso} días` : 'Sin retraso'}
                disabled
                style={{ 
                  backgroundColor: diasRetraso > 0 ? '#fee2e2' : '#f0fdf4',
                  color: diasRetraso > 0 ? '#dc2626' : '#16a34a',
                  fontWeight: 'bold'
                }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>Observaciones Adicionales:</label>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              placeholder="Ej: El libro presenta desgaste en la portada..."
              rows="3"
            />
          </div>

          <ErrorMessage errors={errors} />

          {diasRetraso > 0 && (
            <div className="status-badge status-danger" style={{ width: '100%', padding: '10px', marginBottom: '15px', textAlign: 'center' }}>
              ⚠️ El sistema detectó {diasRetraso} días de retraso. Se procederá con el cargo correspondiente.
            </div>
          )}

          <div className="button-group">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Procesando...' : 'Confirmar Recepción'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => navigate('/returns')}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateReturnPage;