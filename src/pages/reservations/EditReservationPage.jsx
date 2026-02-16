import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { reservationService } from '../../services/reservationService';
import { studentService } from '../../services/studentService';
import { bookService } from '../../services/bookService';
import { reservationZodSchema } from '../../schemas/reservation';
import ErrorMessage from '../../components/ErrorMessage';
import { toast } from 'react-toastify';


const EditReservationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Estados de datos
  const [students, setStudents] = useState([]);
  const [books, setBooks] = useState([]);
  const [formData, setFormData] = useState({
    estudiante: '',
    libro: '',
    fechaReservacion: '',
    fechaVencimiento: ''
  });

  // Estados de control
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resReservation, resStudents, resBooks] = await Promise.all([
        reservationService.getById(id),
        studentService.getAll(),
        bookService.getAll()
      ]);

      const resData = resReservation.data;
      
      // Validar si la reserva ya no está activa
      if (resData.estado !== 'activa') {
        toast.warning('Solo se pueden editar reservaciones en estado activo.');
        navigate('/reservations');
        return;
      }

      setFormData({
        estudiante: resData.estudiante?._id || resData.estudiante,
        libro: resData.libro?._id || resData.libro,
        fechaReservacion: resData.fechaReservacion?.split('T')[0] || '',
        fechaVencimiento: resData.fechaVencimiento?.split('T')[0] || ''
      });

      setStudents(resStudents.data || []);
      setBooks(resBooks.data || []);

    } catch (error) {
      toast.error('No se pudo recuperar la información de la reserva');
      navigate('/reservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors.length > 0) setErrors([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = reservationZodSchema.safeParse(formData);
      
      if (!result.success) {
        const issues = result.error.issues.map(i => ({
          campo: i.path[0],
          mensaje: i.message
        }));
        setErrors(issues);
        return;
      }

      setSaving(true);
      await reservationService.update(id, formData);
      toast.success('Cronograma de reserva actualizado');
      navigate('/reservations');

    } catch (error) {
      const msg = error.response?.data?.error || 'Error al actualizar la reservación';
      setErrors([{ campo: 'SERVER', mensaje: msg }]);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-state">Cargando detalles del apartado...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">📝 Modificar Reservación</h2>
          <p className="page-description">Ajuste de fechas y plazos de entrega</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/reservations')}>
          ← Volver
        </button>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            
            <div className="form-group">
              <label>Estudiante (Solo lectura):</label>
              <select
                name="estudiante"
                value={formData.estudiante}
                disabled
                className="input-disabled"
              >
                {students.map(s => (
                  <option key={s._id} value={s._id}>
                    {s.carnet} - {s.nombres} {s.apellidos}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Libro Reservado (Solo lectura):</label>
              <select
                name="libro"
                value={formData.libro}
                disabled
                className="input-disabled"
              >
                {books.map(b => (
                  <option key={b._id} value={b._id}>
                    {b.titulo}
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
              <label>Nueva Fecha de Vencimiento:</label>
              <input
                type="date"
                name="fechaVencimiento"
                value={formData.fechaVencimiento}
                onChange={handleChange}
                className={errors.some(e => e.campo === 'fechaVencimiento') ? 'input-error' : ''}
              />
              <small className="help-text">Extienda el plazo si es necesario.</small>
            </div>
          </div>

          <ErrorMessage errors={errors} />

          <div className="button-group" style={{ marginTop: '2rem' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Guardando...' : 'Actualizar Fechas'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => navigate('/reservations')}
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

export default EditReservationPage;