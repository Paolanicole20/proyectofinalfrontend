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
  const [students, setStudents] = useState([]);
  const [books, setBooks] = useState([]);
  const [formData, setFormData] = useState({
    estudiante: '',
    libro: '',
    fechaReservacion: '',
    fechaVencimiento: '',
    estado: 'activa'
  });
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resRes, resStu, resBook] = await Promise.all([
          reservationService.getById(id),
          studentService.getAll(),
          bookService.getAll()
        ]);
        const res = resRes.data || resRes;
        setFormData({
          estudiante: res.estudianteId?._id || res.estudianteId || '',
          libro: res.libroId?._id || res.libroId || '',
          fechaReservacion: res.fechaReservacion?.split('T')[0] || '',
          fechaVencimiento: res.fechaVencimiento?.split('T')[0] || '',
          estado: res.estado || 'activa'
        });
        setStudents(resStu.data || []);
        setBooks(resBook.data || []);
      } catch (error) {
        toast.error('Error al cargar reserva');
        navigate('/reservations');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = reservationZodSchema.safeParse(formData);
    if (!result.success) {
      setErrors(result.error.issues.map(i => ({ campo: i.path[0], mensaje: i.message })));
      return;
    }
    try {
      setSaving(true);
      const dataToSave = { 
        ...formData, 
        estudianteId: formData.estudiante, 
        libroId: formData.libro 
      };
      await reservationService.update(id, dataToSave);
      toast.success('Reserva actualizada');
      navigate('/reservations');
    } catch (error) {
      setErrors([{ campo: 'SERVER', mensaje: 'Error al actualizar' }]);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="page-container">
      <div className="page-header"><h2 className="page-title">📝 Editar Reservación</h2></div>
      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Estudiante:</label>
              <select value={formData.estudiante} disabled className="input-disabled">
                {students.map(s => <option key={s._id} value={s._id}>{s.nombres}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Libro:</label>
              <select value={formData.libro} disabled className="input-disabled">
                {books.map(b => <option key={b._id} value={b._id}>{b.titulo}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Fecha Reservación:</label>
              <input type="date" name="fechaReservacion" value={formData.fechaReservacion} onChange={(e) => setFormData({...formData, fechaReservacion: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Fecha Vencimiento:</label>
              <input type="date" name="fechaVencimiento" value={formData.fechaVencimiento} onChange={(e) => setFormData({...formData, fechaVencimiento: e.target.value})} />
            </div>
          </div>
          <ErrorMessage errors={errors} />
          <div className="button-group">
            <button type="submit" className="btn-primary" disabled={saving}>Actualizar Fechas</button>
            <button type="button" className="btn-danger" onClick={() => navigate('/reservations')}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditReservationPage;