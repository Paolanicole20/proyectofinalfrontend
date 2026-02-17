import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { returnService } from '../../services/returnService';
import { loanService } from '../../services/loanService';
import { returnZodSchema } from '../../schemas/return';
import ErrorMessage from '../../components/ErrorMessage';
import { toast } from 'react-toastify';

const CreateReturnPage = () => {
  const navigate = useNavigate();
  const [activeLoans, setActiveLoans] = useState([]);
  const [formData, setFormData] = useState({
    prestamo: '', // Almacena el ID del préstamo
    fechaDevolucionReal: new Date().toISOString().split('T')[0],
    estadoLibro: '',
    observaciones: ''
  });

  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingLoans, setFetchingLoans] = useState(true);
  const [diasRetraso, setDiasRetraso] = useState(0);

  // 1. Carga de préstamos con filtros y validaciones de seguridad
  const loadLoans = async () => {
    try {
      setFetchingLoans(true);
      const response = await loanService.getAll();
      const data = response.data || response;
      
      console.log("Datos recibidos del backend:", data);

      if (!Array.isArray(data)) {
        setActiveLoans([]);
        return;
      }

      // Filtro flexible: acepta minúsculas, mayúsculas y diferentes estados lógicos
      const activos = data.filter(l => {
        const est = String(l.estado || '').toLowerCase();
        return est === 'activo' || est === 'pendiente' || est === 'prestado';
      });
      
      setActiveLoans(activos);
      if (activos.length === 0) {
        toast.info('No hay préstamos pendientes de devolución');
      }
    } catch (error) {
      console.error("Error cargando préstamos:", error);
      toast.error('Error de conexión o Timeout del servidor');
    } finally {
      setFetchingLoans(false);
    }
  };

  useEffect(() => {
    loadLoans();
  }, []);

  // 2. Cálculo de días de retraso
  const calculateDelay = (loanId, returnDate) => {
    const loan = activeLoans.find(l => l._id === loanId);
    if (!loan || !returnDate) { setDiasRetraso(0); return; }
    
    const fechaEsperada = new Date(loan.fechaDevolucionEsperada);
    const fechaReal = new Date(returnDate);
    
    fechaEsperada.setHours(0,0,0,0);
    fechaReal.setHours(0,0,0,0);

    const diffTime = fechaReal - fechaEsperada;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setDiasRetraso(diffDays > 0 ? diffDays : 0);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'prestamo' || name === 'fechaDevolucionReal') {
      const targetLoan = name === 'prestamo' ? value : formData.prestamo;
      const targetDate = name === 'fechaDevolucionReal' ? value : formData.fechaDevolucionReal;
      calculateDelay(targetLoan, targetDate);
    }
    if (errors.length > 0) setErrors([]);
  };

  // 3. Envío del formulario con validación Zod
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mapeo para que coincida con lo que el Schema de Zod espera (prestamoId)
    const dataToValidate = {
      prestamoId: formData.prestamo,
      fechaDevolucionReal: formData.fechaDevolucionReal,
      estadoLibro: formData.estadoLibro, // El select ya envía minúsculas
      observaciones: formData.observaciones,
      diasRetraso: diasRetraso
    };

    const result = returnZodSchema.safeParse(dataToValidate);
    
    if (!result.success) {
      setErrors(result.error.issues.map(i => ({ 
        campo: i.path[0], 
        mensaje: i.message 
      })));
      return;
    }

    try {
      setLoading(true);
      // Enviamos el objeto validado por Zod
      await returnService.create(result.data);
      toast.success('Devolución registrada y stock actualizado');
      navigate('/returns');
    } catch (error) {
      const msg = error.response?.data?.error || error.response?.data?.message || 'Error interno del servidor (500)';
      setErrors([{ campo: 'SERVER', mensaje: msg }]);
      toast.error('Error al procesar devolución');
    } finally { 
      setLoading(false); 
    }
  };

  if (fetchingLoans) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '50px' }}>
        <div className="loading-spinner">Cargando datos del servidor...</div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
        <h2 style={{ color: '#1a237e', margin: 0 }}>📥 Registrar Devolución</h2>
        <p style={{ color: '#666' }}>Seleccione un préstamo para procesar el retorno del libro</p>
      </div>

      <div className="form-card" style={{ background: '#fff', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            
            {/* SELECTOR DE PRÉSTAMOS */}
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Préstamo Activo</label>
              <select 
                name="prestamo" 
                value={formData.prestamo} 
                onChange={handleChange} 
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                required
              >
                <option value="">-- Seleccionar Estudiante / Libro --</option>
                {activeLoans.map(l => (
                  <option key={l._id} value={l._id}>
                    {l.estudianteId?.nombres || 'ID:'} {l.estudianteId?.apellidos || l._id.substring(0,6)} 
                    {' | '} 
                    {l.libroId?.titulo || 'Libro no identificado'}
                  </option>
                ))}
              </select>
              {activeLoans.length === 0 && (
                <small style={{ color: '#d32f2f', display: 'block', marginTop: '5px' }}>
                  ⚠️ No hay préstamos disponibles en el sistema.
                </small>
              )}
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Fecha de Recepción</label>
              <input 
                type="date" 
                name="fechaDevolucionReal" 
                value={formData.fechaDevolucionReal} 
                onChange={handleChange} 
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} 
              />
            </div>

            {/* ESTADO DEL LIBRO (Valores en minúsculas para Zod) */}
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Estado del Libro</label>
              <select 
                name="estadoLibro" 
                value={formData.estadoLibro} 
                onChange={handleChange} 
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} 
                required
              >
                <option value="">-- Seleccionar Estado --</option>
                <option value="excelente">Excelente</option>
                <option value="bueno">Bueno</option>
                <option value="regular">Regular</option>
                <option value="dañado">Dañado (Genera multa)</option>
              </select>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Estado de Entrega</label>
              <div style={{ 
                padding: '10px', borderRadius: '4px', 
                backgroundColor: diasRetraso > 0 ? '#fee2e2' : '#f0fdf4',
                color: diasRetraso > 0 ? '#dc2626' : '#16a34a',
                fontWeight: 'bold', border: '1px solid currentColor', textAlign: 'center'
              }}>
                {diasRetraso > 0 ? `⚠️ ${diasRetraso} días de retraso` : '✅ A tiempo'}
              </div>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Observaciones adicionales</label>
            <textarea 
              name="observaciones" 
              rows="3" 
              value={formData.observaciones} 
              onChange={handleChange} 
              placeholder="Ej: El libro presenta desgaste en la portada..."
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' }} 
            />
          </div>

          <div style={{ marginTop: '20px' }}>
            <ErrorMessage errors={errors} />
          </div>

          <div style={{ marginTop: '30px', display: 'flex', gap: '15px' }}>
            <button 
              type="submit" 
              disabled={loading} 
              style={{ 
                background: '#1a237e', color: 'white', padding: '12px 20px', 
                border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', 
                flex: 1, fontWeight: 'bold', fontSize: '16px' 
              }}
            >
              {loading ? 'Procesando...' : '📥 Confirmar Recepción'}
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/returns')} 
              style={{ 
                background: '#f44336', color: 'white', padding: '12px 20px', 
                border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' 
              }}
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