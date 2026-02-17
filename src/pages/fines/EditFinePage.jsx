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
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    estudiante: '',
    monto: '',
    motivo: '',
    fecha: '',
    estado: 'pendiente'
  });
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resFine, resStudents] = await Promise.all([
          fineService.getById(id),
          studentService.getAll()
        ]);
        const fine = resFine.data || resFine;
        setFormData({
          estudiante: fine.estudianteId?._id || fine.estudianteId || '',
          monto: fine.monto?.toString() || '',
          motivo: fine.motivo || '',
          fecha: fine.fecha?.split('T')[0] || '',
          estado: fine.estado || 'pendiente'
        });
        setStudents(resStudents.data || []);
      } catch (error) {
        toast.error('Error al cargar multa');
        navigate('/fines');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors.length > 0) setErrors([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToValidate = { ...formData, monto: parseFloat(formData.monto) };
    const result = fineZodSchema.safeParse(dataToValidate);
    
    if (!result.success) {
      setErrors(result.error.issues.map(i => ({ campo: i.path[0], mensaje: i.message })));
      return;
    }

    try {
      setSaving(true);
      const dataToSave = { ...dataToValidate, estudianteId: formData.estudiante };
      await fineService.update(id, dataToSave);
      toast.success('Multa actualizada');
      navigate('/fines');
    } catch (error) {
      setErrors([{ campo: 'SERVER', mensaje: error.response?.data?.error || 'Error' }]);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="page-container">
      <div className="page-header"><h2 className="page-title">📝 Editar Multa</h2></div>
      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Estudiante:</label>
              <select name="estudiante" value={formData.estudiante} disabled className="input-disabled">
                {students.map(s => <option key={s._id} value={s._id}>{s.carnet} - {s.nombres}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Monto ($):</label>
              <input type="number" name="monto" value={formData.monto} onChange={handleChange} step="0.01" />
            </div>
            <div className="form-group">
              <label>Estado:</label>
              <select name="estado" value={formData.estado} onChange={handleChange}>
                <option value="pendiente">Pendiente</option>
                <option value="pagada">Pagada</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Motivo:</label>
            <textarea name="motivo" value={formData.motivo} onChange={handleChange} rows="3" />
          </div>
          <ErrorMessage errors={errors} />
          <div className="button-group">
            <button type="submit" className="btn-primary" disabled={saving}>Guardar Cambios</button>
            <button type="button" className="btn-danger" onClick={() => navigate('/fines')}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditFinePage;