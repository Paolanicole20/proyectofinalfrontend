import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookService } from '../../services/bookService';
import { categoryService } from '../../services/categoryService';
import { bookZodSchema } from '../../schemas/book';
import ErrorMessage from '../../components/ErrorMessage';
import { toast } from 'react-toastify';

const CreateBookPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  
  const [formData, setFormData] = useState({
    isbn: '',
    titulo: '',
    autor: '',
    editorial: '',
    anioPublicacion: new Date().getFullYear().toString(),
    categoryId: '', 
    cantidadDisponible: '1',
    ubicacion: '',
    descripcion: ''
  });

  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // ==========================================
  // BLOQUE DE DIAGNÓSTICO EN VIVO
  // ==========================================
  useEffect(() => {
    const loadCategories = async () => {
      try {
        console.log("--- Iniciando petición de categorías ---");
        const response = await categoryService.getAll();
        
        // Imprimimos la respuesta completa para ver la estructura
        console.log("Respuesta completa del servidor:", response);
        console.log("Datos dentro de response.data:", response.data);

        // Verificamos si es un array o viene dentro de otra propiedad
        const data = response.data;
        if (Array.isArray(data)) {
          setCategories(data);
        } else if (data && Array.isArray(data.categories)) {
          setCategories(data.categories);
        } else if (data && Array.isArray(data.docs)) {
          setCategories(data.docs);
        } else {
          console.error("El formato de datos no es un array conocido:", data);
          setCategories([]);
        }

      } catch (error) {
        console.error("Error detallado en la petición:", error);
        toast.error('Error al cargar catálogo de categorías. Revisa la consola (F12).');
      } finally {
        setFetching(false);
      }
    };
    loadCategories();
  }, []);
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors.length > 0) setErrors([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = bookZodSchema.safeParse(formData);
      
      if (!result.success) {
        const issues = result.error.issues.map(i => ({
          campo: i.path[0],
          mensaje: i.message
        }));
        setErrors(issues);
        return;
      }

      setLoading(true);
      await bookService.create(result.data); 
      toast.success('Libro registrado exitosamente');
      navigate('/books');

    } catch (error) {
      console.error("Error al guardar:", error);
      const msg = error.response?.data?.msg || 'Error al guardar el libro';
      setErrors([{ campo: 'SERVER', mensaje: msg }]);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="loading-state">Cargando categorías y recursos...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">📖 Registro de Nuevo Libro</h2>
          <p className="page-description">Complete la ficha técnica para el inventario</p>
        </div>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>ISBN / Código de Barras:</label>
              <input
                type="text"
                name="isbn"
                value={formData.isbn}
                onChange={handleChange}
                placeholder="Ej: 978-607-313-433-0"
                className={errors.some(e => e.campo === 'isbn') ? 'input-error' : ''}
              />
            </div>

            <div className="form-group">
              <label>Título de la Obra:</label>
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                className={errors.some(e => e.campo === 'titulo') ? 'input-error' : ''}
              />
            </div>

            <div className="form-group">
              <label>Autor(es):</label>
              <input
                type="text"
                name="autor"
                value={formData.autor}
                onChange={handleChange}
                className={errors.some(e => e.campo === 'autor') ? 'input-error' : ''}
              />
            </div>

            <div className="form-group">
              <label>Editorial:</label>
              <input
                type="text"
                name="editorial"
                value={formData.editorial}
                onChange={handleChange}
                className={errors.some(e => e.campo === 'editorial') ? 'input-error' : ''}
              />
            </div>

            <div className="form-group">
              <label>Categoría / Género:</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className={errors.some(e => e.campo === 'categoryId') ? 'input-error' : ''}
              >
                <option value="">-- Seleccione Categoría --</option>
                {/* Renderizado defensivo: probamos con .nombre y con .name */}
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>
                    {cat.nombre || cat.name || "Sin nombre"}
                  </option>
                ))}
              </select>
              {categories.length === 0 && (
                <small style={{ color: 'orange' }}>⚠️ No se encontraron categorías en la base de datos.</small>
              )}
            </div>

            <div className="form-group">
              <label>Año de Edición:</label>
              <input
                type="number"
                name="anioPublicacion"
                value={formData.anioPublicacion}
                onChange={handleChange}
                className={errors.some(e => e.campo === 'anioPublicacion') ? 'input-error' : ''}
              />
            </div>

            <div className="form-group">
              <label>Cantidad de Ejemplares:</label>
              <input
                type="number"
                name="cantidadDisponible"
                value={formData.cantidadDisponible}
                onChange={handleChange}
                className={errors.some(e => e.campo === 'cantidadDisponible') ? 'input-error' : ''}
              />
            </div>

            <div className="form-group">
              <label>Ubicación Física:</label>
              <input
                type="text"
                name="ubicacion"
                value={formData.ubicacion}
                onChange={handleChange}
                placeholder="Ej: Estante A-13"
                className={errors.some(e => e.campo === 'ubicacion') ? 'input-error' : ''}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>Resumen / Descripción:</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <ErrorMessage errors={errors} />

          <div className="button-group" style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={loading}>
              {loading ? 'Guardando...' : 'Registrar Libro'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary" 
              style={{ flex: 1, backgroundColor: '#6c757d', color: 'white' }} 
              onClick={() => navigate('/books')}
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

export default CreateBookPage;