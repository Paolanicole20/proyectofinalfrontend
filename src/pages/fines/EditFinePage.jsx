import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fineService } from '../../services/fineService';
import { studentService } from '../../services/studentService';
import { fineZodSchema } from '../../schemas/fine';
import ErrorMessage from '../../components/ErrorMessage';
import { toast } from 'react-toastify';


const EditFinePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Estados de datos
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    estudiante: '',
    monto: '',
    motivo: '',
    fecha: ''
  });

  // Estados de control
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Cargamos la multa y la lista de estudiantes
      const [resFine, resStudents] = await Promise.all([
        fineService.getById(id),
        studentService.getAll()
      ]);

      const fineData = resFine.data;
      
      setFormData({
        estudiante: fineData.estudiante?._id || fineData.estudiante,
        monto: fineData.monto || '',
        motivo: fineData.motivo || '',
        fecha: fineData.fecha?.split('T')[0] || ''
      });

      setStudents(resStudents.data || []);
      
      // Si la multa ya está pagada, no deberíamos permitir editar ciertos campos
      if (fineData.estado === 'pagada') {
        toast.info('Esta multa ya ha sido pagada y no debería modificarse.');
      }

    } catch (error) {
      toast.error('No se pudo cargar la información de la multa');
      navigate('/fines');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

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
    
    try {
      const result = fineZodSchema.safeParse(formData);
      
      if (!result.success) {
        const issues = result.error.issues.map(i => ({
          campo: i.path[0],
          mensaje: i.message
        }));
        setErrors(issues);
        return;
      }

      setSaving(true);
      await fineService.update(id, formData);

      toast.success('Registro de multa actualizado');
      navigate('/fines');

    } catch (error) {
      const msg = error.response?.data?.error || 'Error al actualizar la multa';
      setErrors([{ campo: 'SERVER', mensaje: msg }]);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-state">Cargando detalles de cuenta...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">📝 Editar Registro de Multa</h2>
          <p className="page-description">Actualice los detalles del cargo o el motivo</p>
        </div>
        <button 
          className="btn btn-secondary"
          onClick={() => navigate('/fines')}
        >
          ← Volver
        </button>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            
            <div className="form-group">
              <label>Estudiante:</label>
              <select
                name="estudiante"
                value={formData.estudiante}
                disabled // Bloqueado por integridad referencial
                className="input-disabled"
              >
                {students.map(s => (
                  <option key={s._id} value={s._id}>
                    {s.carnet} - {s.nombres} {s.apellidos}
                  </option>
                ))}
              </select>
              <small>El estudiante no se puede cambiar para esta multa.</small>
            </div>

            <div className="form-group">
              <label>Monto Actual ($):</label>
              <input
                type="number"
                name="monto"
                value={formData.monto}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={errors.some(e => e.campo === 'monto') ? 'input-error' : ''}
              />
            </div>

            <div className="form-group">
              <label>Fecha de Emisión:</label>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                className={errors.some(e => e.campo === 'fecha') ? 'input-error' : ''}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>Concepto / Motivo:</label>
            <textarea
              name="motivo"
              value={formData.motivo}
              onChange={handleChange}
              rows="3"
              className={errors.some(e => e.campo === 'motivo') ? 'input-error' : ''}
            />
          </div>

          <ErrorMessage errors={errors} />

          <div className="button-group" style={{ marginTop: '2rem' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => navigate('/fines')}
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

export default EditFinePage;