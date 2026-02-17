import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { loanService } from '../../services/loanService';
import { studentService } from '../../services/studentService';
import { bookService } from '../../services/bookService';
import { loanZodSchema } from '../../schemas/loan';
import ErrorMessage from '../../components/ErrorMessage';
import { toast } from 'react-toastify';

const EditLoanPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [students, setStudents] = useState([]);
  const [books, setBooks] = useState([]);
  const [formData, setFormData] = useState({
    estudiante: '',
    libro: '',
    fechaPrestamo: '',
    fechaDevolucionEsperada: '',
    estado: 'activo' 
  });

  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resLoan, resStudents, resBooks] = await Promise.all([
        loanService.getById(id),
        studentService.getAll(),
        bookService.getAll()
      ]);

      // IMPORTANTE: Manejo de respuesta según cómo venga del backend
      const loan = resLoan.data || resLoan; 
      
      // Mapeo defensivo para que los selectores reconozcan el ID
      setFormData({
        // Intentamos obtener el ID ya sea que venga poblado o solo el string
        estudiante: loan.estudianteId?._id || loan.estudianteId || '',
        libro: loan.libroId?._id || loan.libroId || '',
        fechaPrestamo: loan.fechaPrestamo?.split('T')[0] || '',
        fechaDevolucionEsperada: loan.fechaDevolucionEsperada?.split('T')[0] || '',
        estado: loan.estado || 'activo'
      });

      setStudents(resStudents.data || []);
      setBooks(resBooks.data || []);

    } catch (error) {
      toast.error('No se pudo cargar la información del préstamo');
      navigate('/loans');
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
    
    // 1. Validación con Zod
    const resultado = loanZodSchema.safeParse(formData);
    
    if (!resultado.success) {
      setErrors(resultado.error.issues.map(issue => ({
        campo: issue.path[0],
        mensaje: issue.message
      })));
      return;
    }

    try {
      setSaving(true);

      // 2. TRADUCCIÓN PARA EL BACKEND (Crucial para evitar Error 400)
      const dataParaEnviar = {
        estudianteId: formData.estudiante,
        libroId: formData.libro,
        fechaPrestamo: formData.fechaPrestamo,
        fechaDevolucionEsperada: formData.fechaDevolucionEsperada,
        estado: formData.estado
      };

      await loanService.update(id, dataParaEnviar);
      toast.success('Préstamo actualizado correctamente');
      navigate('/loans');

    } catch (error) {
      const serverMessage = error.response?.data?.error || error.response?.data?.message || 'Error al actualizar';
      setErrors([{ campo: 'SERVER', mensaje: serverMessage }]);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-state">Cargando detalles del préstamo...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">📝 Editar Préstamo</h2>
          <p className="page-description">Modifica las condiciones o fechas del préstamo actual</p>
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
                disabled={saving}
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
              <label>Libro:</label>
              <select
                name="libro"
                value={formData.libro}
                onChange={handleChange}
                className={errors.some(e => e.campo === 'libro') ? 'input-error' : ''}
                disabled={saving}
              >
                <option value="">-- Seleccionar Libro --</option>
                {books.map(b => (
                  <option key={b._id} value={b._id}>
                    {b.titulo}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Fecha de Préstamo:</label>
              <input
                type="date"
                name="fechaPrestamo"
                value={formData.fechaPrestamo}
                onChange={handleChange}
                className={errors.some(e => e.campo === 'fechaPrestamo') ? 'input-error' : ''}
              />
            </div>

            <div className="form-group">
              <label>Nueva Fecha Devolución:</label>
              <input
                type="date"
                name="fechaDevolucionEsperada"
                value={formData.fechaDevolucionEsperada}
                onChange={handleChange}
                className={errors.some(e => e.campo === 'fechaDevolucionEsperada') ? 'input-error' : ''}
              />
            </div>

            <div className="form-group">
              <label>Estado:</label>
              <select 
                name="estado" 
                value={formData.estado} 
                onChange={handleChange}
              >
                <option value="activo">Pendiente (Activo)</option>
                <option value="devuelto">Devuelto</option>
              </select>
            </div>

          </div>

          <ErrorMessage errors={errors} />

          <div className="button-group">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Guardando cambios...' : '💾 Actualizar Préstamo'}
            </button>
            <button 
              type="button" 
              className="btn-danger" 
              onClick={() => navigate('/loans')}
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

export default EditLoanPage;