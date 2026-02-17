import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryService } from '../../services/categoryService';
import { categoryZodSchema } from '../../schemas/category'; 
import ErrorMessage from '../../components/ErrorMessage';
import { toast } from 'react-toastify';

const CreateCategoryPage = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors.length > 0) setErrors([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const resultado = categoryZodSchema.safeParse(formData);
    
    if (!resultado.success) {
      setErrors(resultado.error.issues.map(i => ({ 
        campo: i.path[0], 
        mensaje: i.message 
      })));
      return;
    }

    try {
      setLoading(true);
      await categoryService.create(formData);
      toast.success('Categoría creada correctamente');
      navigate('/categories');
    } catch (error) {
      setErrors([{ campo: 'SERVER', mensaje: error.response?.data?.error || 'Error en el servidor' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">🏷️ Crear Categoría</h2>
          <p className="page-description">Registrar nueva clasificación para la biblioteca</p>
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
                value={formData.codigo} 
                onChange={handleChange}
                placeholder="Ej: CAT-001"
              />
            </div>
            <div className="form-group">
              <label>Nombre de la Categoría:</label>
              <input
                type="text" 
                name="nombre" 
                value={formData.nombre} 
                onChange={handleChange}
                placeholder="Ej: Ciencias Exactas"
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '20px' }}>
            <label>Descripción:</label>
            <textarea
              name="descripcion" 
              value={formData.descripcion} 
              onChange={handleChange} 
              rows="3"
              placeholder="Breve descripción del tipo de libros..."
              className="form-control"
            />
          </div>

          {errors.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <ErrorMessage errors={errors} />
            </div>
          )}

          <div className="button-group">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Guardando...' : '💾 Guardar Categoría'}
            </button>
            <button type="button" className="btn-danger" onClick={() => navigate('/categories')}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCategoryPage;