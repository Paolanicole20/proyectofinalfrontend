import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fineService } from '../../services/fineService';
import { studentService } from '../../services/studentService';
import { fineZodSchema } from '../../schemas/fine';
import ErrorMessage from '../../components/ErrorMessage';
import { toast } from 'react-toastify';


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

  // Cargar lista de estudiantes para el selector
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
    
    // Limpiar errores al escribir
    if (errors.length > 0) setErrors([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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

  if (fetchingStudents) return <div className="loading-state">Cargando base de datos de estudiantes...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">💰 Registrar Nueva Multa</h2>
          <p className="page-description">Asignación manual de cargos por daños o extravíos</p>
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
              <label>Estudiante responsable:</label>
              <select
                name="estudiante"
                value={formData.estudiante}
                onChange={handleChange}
                className={errors.some(e => e.campo === 'estudiante') ? 'input-error' : ''}
              >
                <option value="">-- Seleccione un estudiante --</option>
                {students.map(student => (
                  <option key={student._id} value={student._id}>
                    {student.carnet} - {student.nombres} {student.apellidos}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Monto del cargo ($):</label>
              <input
                type="number"
                name="monto"
                value={formData.monto}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className={errors.some(e => e.campo === 'monto') ? 'input-error' : ''}
              />
            </div>

            <div className="form-group">
              <label>Fecha de emisión:</label>
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
            <label>Concepto o Motivo detallado:</label>
            <textarea
              name="motivo"
              value={formData.motivo}
              onChange={handleChange}
              rows="3"
              placeholder="Ej: Libro entregado con manchas de humedad o daño en el lomo..."
              className={errors.some(e => e.campo === 'motivo') ? 'input-error' : ''}
            />
          </div>

          <ErrorMessage errors={errors} />

          <div className="button-group" style={{ marginTop: '2rem' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Procesando...' : 'Registrar Multa'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => navigate('/fines')}
              disabled={loading}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFinePage;