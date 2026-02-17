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
    prestamo: '',
    fechaDevolucionReal: new Date().toISOString().split('T')[0],
    estadoLibro: '',
    observaciones: ''
  });

  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingLoans, setFetchingLoans] = useState(true);
  const [diasRetraso, setDiasRetraso] = useState(0);

  const loadLoans = async () => {
    try {
      setFetchingLoans(true);
      const response = await loanService.getAll();
      const activos = response.data.filter(l => l.estado === 'activo');
      setActiveLoans(activos);
    } catch (error) {
      toast.error('Error al cargar préstamos activos');
    } finally {
      setFetchingLoans(false);
    }
  };

  useEffect(() => { loadLoans(); }, []);

  const calculateDelay = (loanId, returnDate) => {
    const loan = activeLoans.find(l => l._id === loanId);
    if (!loan || !returnDate) { setDiasRetraso(0); return; }
    const fechaEsperada = new Date(loan.fechaDevolucionEsperada);
    const fechaReal = new Date(returnDate);
    const diffTime = fechaReal - fechaEsperada;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setDiasRetraso(diffDays > 0 ? diffDays : 0);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    const result = returnZodSchema.safeParse(formData);
    if (!result.success) {
      setErrors(result.error.issues.map(i => ({ campo: i.path[0], mensaje: i.message })));
      return;
    }
    try {
      setLoading(true);
      await returnService.create({ ...formData, diasRetraso });
      toast.success('Libro recibido correctamente');
      navigate('/returns');
    } catch (error) {
      setErrors([{ campo: 'SERVER', mensaje: error.response?.data?.error || 'Error del servidor' }]);
    } finally { setLoading(false); }
  };

  if (fetchingLoans) return <div className="page-container">Cargando préstamos...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">📥 Registrar Devolución</h1>
          <p style={{ color: '#64748b' }}>Gestione el retorno de libros al inventario</p>
        </div>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Seleccionar Préstamo Activo</label>
              <select name="prestamo" value={formData.prestamo} onChange={handleChange} required>
                <option value="">-- Buscar por Estudiante o Libro --</option>
                {activeLoans.map(l => (
                  <option key={l._id} value={l._id}>
                    {l.estudiante?.nombres} - {l.libro?.titulo}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Fecha de Recepción</label>
              <input type="date" name="fechaDevolucionReal" value={formData.fechaDevolucionReal} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Estado Físico del Libro</label>
              <select name="estadoLibro" value={formData.estadoLibro} onChange={handleChange} required>
                <option value="">-- Seleccionar Estado --</option>
                <option value="Excelente">Excelente</option>
                <option value="Bueno">Bueno</option>
                <option value="Dañado">Dañado (Genera Multa)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Retraso Detectado</label>
              <div style={{ 
                padding: '10px', 
                borderRadius: '8px', 
                backgroundColor: diasRetraso > 0 ? '#fee2e2' : '#f0fdf4',
                color: diasRetraso > 0 ? '#dc2626' : '#16a34a',
                fontWeight: 'bold',
                border: '1px solid currentColor'
              }}>
                {diasRetraso > 0 ? `⚠️ ${diasRetraso} días de retraso` : '✅ A tiempo'}
              </div>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '20px' }}>
            <label>Observaciones</label>
            <textarea name="observaciones" rows="3" value={formData.observaciones} onChange={handleChange} placeholder="Detalles sobre el estado del libro..."></textarea>
          </div>

          <ErrorMessage errors={errors} />

          <div className="button-group" style={{ marginTop: '30px' }}>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Procesando...' : 'Confirmar Recepción'}
            </button>
            <button type="button" className="btn-primary" style={{ backgroundColor: '#64748b' }} onClick={() => navigate('/returns')}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateReturnPage;