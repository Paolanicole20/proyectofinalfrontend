import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loanService } from '../../services/loanService';
import { studentService } from '../../services/studentService';
import { bookService } from '../../services/bookService';
import { loanZodSchema } from '../../schemas/loan';
import ErrorMessage from '../../components/ErrorMessage';
import { toast } from 'react-toastify';

const CreateLoanPage = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [books, setBooks] = useState([]);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);

  const [formData, setFormData] = useState({
    estudiante: '',
    libro: '',
    fechaPrestamo: new Date().toISOString().split('T')[0],
    fechaDevolucionEsperada: ''
  });

  const loadFormData = async () => {
    try {
      setFetchingData(true);
      const [resStudents, resBooks] = await Promise.all([
        studentService.getAll(),
        bookService.getAll()
      ]);
      setStudents(resStudents.data || []);
      setBooks(resBooks.data || []);
    } catch (error) {
      toast.error('Error al cargar información necesaria');
    } finally {
      setFetchingData(false);
    }
  };

  useEffect(() => { loadFormData(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors.length > 0) setErrors([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Validar localmente con Zod
    const resultado = loanZodSchema.safeParse(formData);
    
    if (!resultado.success) {
      setErrors(resultado.error.issues.map(i => ({ 
        campo: i.path[0], 
        mensaje: i.message 
      })));
      return;
    }

    try {
      setLoading(true);

      // 2. "TRADUCCIÓN" PARA EL BACKEND:
      // Cambiamos los nombres de las llaves para que el API las entienda (Error 400 fix)
      const dataParaEnviar = {
        estudianteId: formData.estudiante, 
        libroId: formData.libro,           
        fechaPrestamo: formData.fechaPrestamo,
        fechaDevolucionEsperada: formData.fechaDevolucionEsperada
      };

      await loanService.create(dataParaEnviar); 
      
      toast.success('Préstamo registrado correctamente');
      navigate('/loans');
    } catch (error) {
      // Si el servidor responde con 400, capturamos el mensaje exacto
      const serverMsg = error.response?.data?.error || error.response?.data?.message || 'Error en el servidor';
      setErrors([{ campo: 'SERVER', mensaje: serverMsg }]);
      toast.error(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) return <div className="loading-state">Preparando catálogo de préstamos...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">📚 Registrar Nuevo Préstamo</h2>
          <p className="page-description">Seleccione el estudiante y el ejemplar a prestar</p>
        </div>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {/* Selector de Estudiante */}
            <div className="form-group">
              <label>Estudiante:</label>
              <select 
                name="estudiante" 
                value={formData.estudiante} 
                onChange={handleChange}
                className={errors.some(e => e.campo === 'estudiante') ? 'input-error' : ''}
              >
                <option value="">-- Seleccionar Estudiante --</option>
                {students.map(s => (
                  <option key={s._id} value={s._id}>
                    {s.carnet} - {s.nombres} {s.apellidos}
                  </option>
                ))}
              </select>
            </div>

            {/* Selector de Libro */}
            <div className="form-group">
              <label>Libro a prestar:</label>
              <select 
                name="libro" 
                value={formData.libro} 
                onChange={handleChange}
                className={errors.some(e => e.campo === 'libro') ? 'input-error' : ''}
              >
                <option value="">-- Seleccionar Libro --</option>
                {books.map(b => (
                  <option key={b._id} value={b._id} disabled={b.ejemplares <= 0}>
                    {b.titulo} {b.ejemplares <= 0 ? '(Sin stock)' : `(${b.ejemplares} disponibles)`}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha Prestamo */}
            <div className="form-group">
              <label>Fecha de Salida:</label>
              <input 
                type="date" 
                name="fechaPrestamo" 
                value={formData.fechaPrestamo} 
                onChange={handleChange} 
              />
            </div>

            {/* Fecha Devolución */}
            <div className="form-group">
              <label>Fecha Devolución Programada:</label>
              <input 
                type="date" 
                name="fechaDevolucionEsperada" 
                value={formData.fechaDevolucionEsperada} 
                onChange={handleChange} 
              />
            </div>
          </div>

          {errors.length > 0 && (
            <div className="error-box" style={{ marginTop: '20px', color: '#b91c1c', backgroundColor: '#fef2f2', padding: '10px', borderRadius: '6px' }}>
              <ErrorMessage errors={errors} />
            </div>
          )}

          <div className="button-group">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Procesando...' : '💾 Confirmar Préstamo'}
            </button>
            <button type="button" className="btn-danger" onClick={() => navigate('/loans')}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLoanPage;