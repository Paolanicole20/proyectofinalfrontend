import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryService } from '../../services/categoryService';
import { categoryZodSchema } from '../../schemas/category'; 
import ErrorMessage from '../../components/ErrorMessage';
import { toast } from 'react-toastify';


const CreateCategoryPage = () => {
  const navigate = useNavigate();
  
  // Estado de errores como Array 
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar errores al escribir
    if (errors.length > 0) setErrors([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // 1. Validación con Zod 
      const resultado = categoryZodSchema.safeParse(formData);
      
      if (!resultado.success) {
        const listaErrores = resultado.error.issues.map(issue => ({
          campo: issue.path[0],
          mensaje: issue.message
        }));
        setErrors(listaErrores);
        return;
      }

      // 2. Envío de datos al servidor
      setLoading(true);
      await categoryService.create(formData);
      toast.success('Categoría creada correctamente');
      navigate('/categories');

    } catch (error) {
      let serverMessage = "";
      if (error.response) {
        // Error de respuesta del servidor 
        serverMessage = error.response.data.error || 'Error en el servidor';
      } else if (error.request) {
        serverMessage = 'No se pudo conectar con el servidor';
      } else {
        serverMessage = error.message;
      }
      setErrors([{ campo: 'SERVER', mensaje: serverMessage }]);
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
                className={errors.some(e => e.campo === 'codigo') ? 'input-error' : ''}
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
                className={errors.some(e => e.campo === 'nombre') ? 'input-error' : ''}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>Descripción:</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows="3"
              placeholder="Breve descripción del tipo de libros en esta categoría..."
            ></textarea>
          </div>

          {/* Componente de visualización */}
          <ErrorMessage errors={errors} />

          <div className="button-group">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Categoría'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => navigate('/categories')}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCategoryPage;