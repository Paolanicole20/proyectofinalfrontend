import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fineService } from '../../services/fineService';
import { studentService } from '../../services/studentService';
import { loanService } from '../../services/loanService'; 
import ErrorMessage from '../../components/ErrorMessage';
import { toast } from 'react-toastify';

const CreateFinePage = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loans, setLoans] = useState([]);
  const [formData, setFormData] = useState({
    estudiante: '', 
    prestamoId: '', 
    monto: '',
    motivo: '',
    fecha: new Date().toISOString().split('T')[0]
  });
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 1. Carga inicial de datos
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [resStudents, resLoans] = await Promise.all([
          studentService.getAll(),
          loanService.getAll()
        ]);
        
        // Extraer datos con validación de estructura
        const dataStudents = resStudents.data || resStudents || [];
        const dataLoans = resLoans.data || resLoans || [];
        
        console.log("Estudiantes cargados:", dataStudents);
        console.log("Préstamos cargados:", dataLoans);

        setStudents(Array.isArray(dataStudents) ? dataStudents : []);
        setLoans(Array.isArray(dataLoans) ? dataLoans : []);
      } catch (error) {
        console.error("Error en carga inicial:", error);
        toast.error('Error al conectar con el servidor');
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  // 2. Limpiar préstamo si el estudiante cambia
  useEffect(() => {
    setFormData(prev => ({ ...prev, prestamoId: '' }));
  }, [formData.estudiante]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 3. Filtrado de préstamos (Lógica reforzada)
  const filteredLoans = loans.filter(l => {
    if (!formData.estudiante) return false;
    // Comparamos el ID del estudiante en el préstamo con el seleccionado
    const loanStudentId = l.estudianteId?._id || l.estudianteId || l.estudiante?._id || l.estudiante;
    return String(loanStudentId) === String(formData.estudiante);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    
    if (!formData.estudiante || !formData.prestamoId || !formData.monto) {
      toast.warning('Por favor complete los campos obligatorios');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        estudianteId: formData.estudiante, 
        prestamoId: formData.prestamoId,
        monto: Number(formData.monto),
        motivo: formData.motivo.trim() || "Multa generada por el sistema",
        estado: 'pendiente'
      };

      await fineService.create(payload);
      toast.success('Multa registrada correctamente');
      navigate('/fines');
    } catch (error) {
      console.error("Error al guardar:", error.response?.data);
      const msg = error.response?.data?.error || "Error al procesar el registro";
      setErrors([{ campo: 'SERVER', mensaje: msg }]);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Cargando datos del sistema...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">Registrar Multa</h2>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            
            {/* Selector de Estudiante */}
            <div className="form-group">
              <label className="form-label">Estudiante responsable</label>
              <select 
                name="estudiante" 
                className="form-control"
                value={formData.estudiante} 
                onChange={handleChange}
              >
                <option value="">- Seleccione Estudiante -</option>
                {students.map(s => (
                  <option key={s._id} value={s._id}>
                    {s.nombres} {s.apellidos} {s.carnet ? `(${s.carnet})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Selector de Préstamo */}
            <div className="form-group">
              <label className="form-label">Préstamo asociado</label>
              <select 
                name="prestamoId" 
                className={`form-control ${!formData.estudiante ? 'bg-gray-100' : ''}`}
                value={formData.prestamoId} 
                onChange={handleChange}
                disabled={!formData.estudiante}
              >
                <option value="">
                  {formData.estudiante ? '- Seleccione el Préstamo -' : 'Elija primero un estudiante'}
                </option>
                {filteredLoans.map(l => (
                  <option key={l._id} value={l._id}>
                    {l.libroId?.titulo || l.libro?.titulo || 'Libro'} - {new Date(l.fechaPrestamo).toLocaleDateString()}
                  </option>
                ))}
              </select>
              {formData.estudiante && filteredLoans.length === 0 && (
                <p className="text-xs text-orange-600 mt-1">⚠️ No se encontraron préstamos activos para este alumno.</p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Monto ($)</label>
              <input 
                type="number" 
                name="monto" 
                className="form-control"
                value={formData.monto} 
                onChange={handleChange} 
                step="0.01" 
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="form-group mt-4">
            <label className="form-label">Motivo</label>
            <textarea 
              name="motivo" 
              className="form-control"
              value={formData.motivo} 
              onChange={handleChange} 
              rows="2"
            />
          </div>

          <ErrorMessage errors={errors} />

          <div className="form-actions mt-6">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Guardando...' : 'Confirmar Registro'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/fines')}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFinePage;