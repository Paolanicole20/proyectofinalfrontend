import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reservationService } from '../../services/reservationService';
import { studentService } from '../../services/studentService';
import { bookService } from '../../services/bookService';
import { reservationZodSchema } from '../../schemas/reservation';
import ErrorMessage from '../../components/ErrorMessage';
import { toast } from 'react-toastify';


const CreateReservationPage = () => {
  const navigate = useNavigate();
  
  // Estados de datos
  const [students, setStudents] = useState([]);
  const [books, setBooks] = useState([]);
  const [formData, setFormData] = useState({
    estudiante: '',
    libro: '',
    fechaReservacion: new Date().toISOString().split('T')[0],
    fechaVencimiento: ''
  });

  // Estados de control
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const loadData = async () => {
    try {
      setFetching(true);
      const [resStudents, resBooks] = await Promise.all([
        studentService.getAll(),
        bookService.getAll()
      ]);
      
      // Filtrar solo estudiantes activos y libros con stock disponible
      setStudents(resStudents.data?.filter(s => s.estado === 'activo') || []);
      setBooks(resBooks.data?.filter(b => b.ejemplaresDisponibles > 0) || []);
      
    } catch (error) {
      toast.error('Error al cargar catálogos para la reservación');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors.length > 0) setErrors([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 1. Validar con Zod
      const result = reservationZodSchema.safeParse(formData);
      
      if (!result.success) {
        const issues = result.error.issues.map(i => ({
          campo: i.path[0],
          mensaje: i.message
        }));
        setErrors(issues);
        return;
      }

      setLoading(true);
      await reservationService.create(formData);
      toast.success('Reservación confirmada correctamente');
      navigate('/reservations');

    } catch (error) {
      const msg = error.response?.data?.error || 'Error al procesar la reservación';
      setErrors([{ campo: 'SERVER', mensaje: msg }]);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="loading-state">Sincronizando disponibilidad de libros...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">📅 Nueva Reservación</h2>
          <p className="page-description">Apartado temporal de material bibliográfico</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/reservations')}>
          ← Volver
        </button>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            
            <div className="form-group">
              <label>Estudiante solicitante:</label>
              <select
                name="estudiante"
                value={formData.estudiante}
                onChange={handleChange}
                className={errors.some(e => e.campo === 'estudiante') ? 'input-error' : ''}
              >
                <option value="">-- Seleccione estudiante activo --</option>
                {students.map(s => (
                  <option key={s._id} value={s._id}>
                    {s.carnet} - {s.nombres} {s.apellidos}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Libro a reservar:</label>
              <select
                name="libro"
                value={formData.libro}
                onChange={handleChange}
                className={errors.some(e => e.campo === 'libro') ? 'input-error' : ''}
              >
                <option value="">-- Seleccione libro con stock --</option>
                {books.map(b => (
                  <option key={b._id} value={b._id}>
                    {b.titulo} (Disponibles: {b.ejemplaresDisponibles})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Fecha de Reservación:</label>
              <input
                type="date"
                name="fechaReservacion"
                value={formData.fechaReservacion}
                onChange={handleChange}
                className={errors.some(e => e.campo === 'fechaReservacion') ? 'input-error' : ''}
              />
            </div>

            <div className="form-group">
              <label>Fecha de Vencimiento:</label>
              <input
                type="date"
                name="fechaVencimiento"
                value={formData.fechaVencimiento}
                onChange={handleChange}
                className={errors.some(e => e.campo === 'fechaVencimiento') ? 'input-error' : ''}
              />
              <small className="help-text">Fecha límite para recoger el libro.</small>
            </div>
          </div>

          <ErrorMessage errors={errors} />

          <div className="button-group" style={{ marginTop: '2rem' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Confirmando...' : 'Confirmar Reservación'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => navigate('/reservations')}
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

export default CreateReservationPage;