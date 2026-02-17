import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { categoryService } from '../../services/categoryService';
import { categoryZodSchema } from '../../schemas/category';
import ErrorMessage from '../../components/ErrorMessage';
import { toast } from 'react-toastify';

const EditCategoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: ''
  });

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getById(id);
      
      // Ajuste defensivo: si el backend envía { data: {...} } o solo {...}
      const data = response.data || response;
      
      setFormData({
        codigo: data.codigo || '',
        nombre: data.nombre || '',
        descripcion: data.descripcion || ''
      });
    } catch (error) {
      console.error('Error fetching category:', error);
      toast.error('No se pudo cargar la categoría');
      navigate('/categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategory();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors.length > 0) setErrors([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. Validación con Zod
      const resultado = categoryZodSchema.safeParse(formData);
      
      if (!resultado.success) {
        setErrors(resultado.error.issues.map(issue => ({
          campo: issue.path[0],
          mensaje: issue.message
        })));
        return;
      }

      // 2. Actualización en el servidor
      setSaving(true);
      await categoryService.update(id, formData);
      toast.success('Categoría actualizada con éxito');
      navigate('/categories');

    } catch (error) {
      const serverMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          'Error en el servidor';
      setErrors([{ campo: 'SERVER', mensaje: serverMessage }]);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-state">Cargando datos de la categoría...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">🏷️ Editar Categoría</h2>
          <p className="page-description">Actualiza los detalles de la clasificación</p>
        </div>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Código:</label>
              <input
                type="text"
                name="codigo"
                placeholder="Ej: MAT-01"
                value={formData.codigo}
                onChange={handleChange}
                className={errors.some(e => e.campo === 'codigo') ? 'input-error' : ''}
                disabled={saving}
              />
            </div>

            <div className="form-group">
              <label>Nombre:</label>
              <input
                type="text"
                name="nombre"
                placeholder="Ej: Matemáticas"
                value={formData.nombre}
                onChange={handleChange}
                className={errors.some(e => e.campo === 'nombre') ? 'input-error' : ''}
                disabled={saving}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>Descripción:</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows="4"
              placeholder="Escribe una breve descripción..."
              disabled={saving}
            ></textarea>
          </div>

          <ErrorMessage errors={errors} />

          <div className="button-group">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Actualizando...' : '💾 Guardar Cambios'}
            </button>
            <button 
              type="button" 
              className="btn-danger" 
              onClick={() => navigate('/categories')}
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

export default EditCategoryPage;