import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { returnService } from '../../services/returnService';
import { loanService } from '../../services/loanService';
import { returnZodSchema } from '../../schemas/return';
import ErrorMessage from '../../components/ErrorMessage';
import { toast } from 'react-toastify';


const EditReturnPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Estados de datos
  const [loans, setLoans] = useState([]);
  const [formData, setFormData] = useState({
    prestamo: '',
    fechaDevolucionReal: '',
    estadoLibro: '',
    observaciones: ''
  });

  // Estados de control
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [diasRetraso, setDiasRetraso] = useState(0);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Cargamos la devolución actual y todos los préstamos (para tener la referencia)
      const [resReturn, resLoans] = await Promise.all([
        returnService.getById(id),
        loanService.getAll()
      ]);

      const returnData = resReturn.data;
      
      setFormData({
        prestamo: returnData.prestamo?._id || returnData.prestamo,
        fechaDevolucionReal: returnData.fechaDevolucionReal?.split('T')[0] || '',
        estadoLibro: returnData.estadoLibro || '',
        observaciones: returnData.observaciones || ''
      });

      setLoans(resLoans.data || []);
      setDiasRetraso(returnData.diasRetraso || 0);

    } catch (error) {
      console.error('Error fetching return data:', error);
      toast.error('No se pudo cargar la información de la devolución');
      navigate('/returns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // Recalcular retraso si cambia la fecha en la edición
  const calculateDelay = (loanId, returnDate) => {
    const loan = loans.find(l => l._id === loanId);
    if (!loan || !returnDate) return;

    const fechaEsperada = new Date(loan.fechaDevolucionEsperada);
    const fechaReal = new Date(returnDate);
    const diffTime = fechaReal - fechaEsperada;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    setDiasRetraso(diffDays > 0 ? diffDays : 0);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'fechaDevolucionReal') {
      calculateDelay(formData.prestamo, value);
    }

    if (errors.length > 0) setErrors([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const result = returnZodSchema.safeParse(formData);
      
      if (!result.success) {
        const issues = result.error.issues.map(i => ({
          campo: i.path[0],
          mensaje: i.message
        }));
        setErrors(issues);
        return;
      }

      setSaving(true);
      await returnService.update(id, {
        ...formData,
        diasRetraso
      });

      toast.success('Registro de devolución actualizado');
      navigate('/returns');

    } catch (error) {
      const msg = error.response?.data?.error || 'Error al actualizar la devolución';
      setErrors([{ campo: 'SERVER', mensaje: msg }]);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-state">Cargando datos de la devolución...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">📝 Editar Registro de Devolución</h2>
          <p className="page-description">Corrija detalles o estado del libro recibido</p>
        </div>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            
            <div className="form-group">
              <label>Préstamo Asociado:</label>
              <select
                name="prestamo"
                value={formData.prestamo}
                disabled 
                className="input-disabled"
              >
                {loans.map(l => (
                  <option key={l._id} value={l._id}>
                    {l.estudiante?.nombres} - {l.libro?.titulo}
                  </option>
                ))}
              </select>
              <small>El préstamo no puede ser modificado una vez registrado.</small>
            </div>

            <div className="form-group">
              <label>Fecha de Recepción:</label>
              <input
                type="date"
                name="fechaDevolucionReal"
                value={formData.fechaDevolucionReal}
                onChange={handleChange}
                className={errors.some(e => e.campo === 'fechaDevolucionReal') ? 'input-error' : ''}
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
                <option value="Excelente">Excelente</option>
                <option value="Bueno">Bueno</option>
                <option value="Regular">Regular</option>
                <option value="Dañado">Dañado</option>
              </select>
            </div>

            <div className="form-group">
              <label>Días de Retraso Calculados:</label>
              <input
                type="text"
                value={`${diasRetraso} días`}
                disabled
                className="input-disabled"
                style={{ 
                  color: diasRetraso > 0 ? '#dc2626' : '#16a34a',
                  fontWeight: 'bold'
                }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>Observaciones:</label>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <ErrorMessage errors={errors} />

          <div className="button-group">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => navigate('/returns')}
              disabled={saving}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditReturnPage;