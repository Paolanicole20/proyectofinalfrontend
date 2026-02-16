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
  
  // Estados para selectores y control
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

  // Carga inicial de datos para los selectores
  const loadFormData = async () => {
    try {
      setFetchingData(true);
      const [resStudents, resBooks] = await Promise.all([
        studentService.getAll(),
        bookService.getAll()
      ]);
      setStudents(resStudents.data || []);
      // Filtramos libros que tengan stock disponible 
      setBooks(resBooks.data || []);
    } catch (error) {
      toast.error('Error al cargar información necesaria');
    } finally {
      setFetchingData(false);
    }
  };

  useEffect(() => {
    loadFormData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors.length > 0) setErrors([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // 1. Validación con Zod
      const resultado = loanZodSchema.safeParse(formData);
      
      if (!resultado.success) {
        const listaErrores = resultado.error.issues.map(issue => ({
          campo: issue.path[0],
          mensaje: issue.message
        }));
        setErrors(listaErrores);
        return;
      }

      // 2. Envío al servidor
      setLoading(true);
      await loanService.create(formData);
      toast.success('Préstamo registrado correctamente');
      navigate('/loans');

    } catch (error) {
      let serverMessage = "";
      if (error.response) {
        serverMessage = error.response.data.error || 'Error en el servidor';
      } else {
        serverMessage = 'No se pudo conectar con el servidor';
      }
      setErrors([{ campo: 'SERVER', mensaje: serverMessage }]);
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

            <div className="form-group">
              <label>Fecha de Salida:</label>
              <input
                type="date"
                name="fechaPrestamo"
                value={formData.fechaPrestamo}
                onChange={handleChange}
                className={errors.some(e => e.campo === 'fechaPrestamo') ? 'input-error' : ''}
              />
            </div>

            <div className="form-group">
              <label>Fecha Devolución Programada:</label>
              <input
                type="date"
                name="fechaDevolucionEsperada"
                value={formData.fechaDevolucionEsperada}
                onChange={handleChange}
                className={errors.some(e => e.campo === 'fechaDevolucionEsperada') ? 'input-error' : ''}
              />
            </div>

          </div>

          <ErrorMessage errors={errors} />

          <div className="button-group">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Procesando...' : 'Confirmar Préstamo'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => navigate('/loans')}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLoanPage;