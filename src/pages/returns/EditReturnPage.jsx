import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { returnService } from '../../services/returnService';
import { loanService } from '../../services/loanService';
import { returnZodSchema } from '../../schemas/return';
import ErrorMessage from '../../components/ErrorMessage';
import { toast } from 'react-toastify';

const EditReturnPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [formData, setFormData] = useState({
    prestamo: '',
    fechaDevolucionReal: '',
    estadoLibro: 'Excelente',
    observaciones: ''
  });
  const [diasRetraso, setDiasRetraso] = useState(0);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resRet, resLoan] = await Promise.all([
          returnService.getById(id),
          loanService.getAll()
        ]);
        const ret = resRet.data || resRet;
        setFormData({
          prestamo: ret.prestamoId?._id || ret.prestamoId || '',
          fechaDevolucionReal: ret.fechaDevolucionReal?.split('T')[0] || '',
          estadoLibro: ret.estadoLibro || 'Excelente',
          observaciones: ret.observaciones || ''
        });
        setLoans(resLoan.data || []);
        setDiasRetraso(ret.diasRetraso || 0);
      } catch (error) {
        toast.error('Error al cargar devolución');
        navigate('/returns');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = returnZodSchema.safeParse(formData);
    if (!result.success) {
      setErrors(result.error.issues.map(i => ({ campo: i.path[0], mensaje: i.message })));
      return;
    }
    try {
      setSaving(true);
      const dataToSave = { ...formData, prestamoId: formData.prestamo, diasRetraso };
      await returnService.update(id, dataToSave);
      toast.success('Devolución actualizada');
      navigate('/returns');
    } catch (error) {
      setErrors([{ campo: 'SERVER', mensaje: 'Error al actualizar' }]);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="page-container">
      <div className="page-header"><h2 className="page-title">📝 Editar Devolución</h2></div>
      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Préstamo (ID):</label>
              <input value={formData.prestamo} disabled className="input-disabled" />
            </div>
            <div className="form-group">
              <label>Fecha Recepción:</label>
              <input type="date" name="fechaDevolucionReal" value={formData.fechaDevolucionReal} onChange={(e) => setFormData({...formData, fechaDevolucionReal: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Estado del Libro:</label>
              <select name="estadoLibro" value={formData.estadoLibro} onChange={(e) => setFormData({...formData, estadoLibro: e.target.value})}>
                <option value="Excelente">Excelente</option>
                <option value="Bueno">Bueno</option>
                <option value="Regular">Regular</option>
                <option value="Dañado">Dañado</option>
              </select>
            </div>
          </div>
          <ErrorMessage errors={errors} />
          <div className="button-group">
            <button type="submit" className="btn-primary" disabled={saving}>Guardar Cambios</button>
            <button type="button" className="btn-danger" onClick={() => navigate('/returns')}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditReturnPage;