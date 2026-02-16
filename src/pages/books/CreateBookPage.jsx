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
    anio: new Date().getFullYear().toString(),
    categoria: '',
    cantidadDisponible: '1',
    ubicacion: '',
    descripcion: ''
  });

  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await categoryService.getAll();
        setCategories(response.data || []);
      } catch (error) {
        toast.error('Error al cargar catálogo de categorías');
      } finally {
        setFetching(false);
      }
    };
    loadCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors.length > 0) setErrors([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Preparar datos para validación (convertir números)
    const dataToValidate = {
      ...formData,
      anio: parseInt(formData.anio),
      cantidadDisponible: parseInt(formData.cantidadDisponible)
    };

    try {
      // 2. Validar con Zod
      const result = bookZodSchema.safeParse(dataToValidate);
      
      if (!result.success) {
        const issues = result.error.issues.map(i => ({
          campo: i.path[0],
          mensaje: i.message
        }));
        setErrors(issues);
        return;
      }

      setLoading(true);
      await bookService.create(dataToValidate);
      toast.success('Libro registrado exitosamente en el catálogo');
      navigate('/books');

    } catch (error) {
      const msg = error.response?.data?.error || 'Error al guardar el libro';
      setErrors([{ campo: 'SERVER', mensaje: msg }]);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="loading-state">Preparando formulario de catálogo...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">📖 Registro de Nuevo Libro</h2>
          <p className="page-description">Ingrese los metadatos de la obra para el inventario</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/books')}>
          ← Volver
        </button>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {/* Identificación */}
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
                placeholder="Nombre completo del libro"
                className={errors.some(e => e.campo === 'titulo') ? 'input-error' : ''}
              />
            </div>

            {/* Autoría y Editorial */}
            <div className="form-group">
              <label>Autor(es):</label>
              <input
                type="text"
                name="autor"
                value={formData.autor}
                onChange={handleChange}
                placeholder="Nombre del autor principal"
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

            {/* Clasificación */}
            <div className="form-group">
              <label>Categoría / Género:</label>
              <select
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                className={errors.some(e => e.campo === 'categoria') ? 'input-error' : ''}
              >
                <option value="">-- Seleccione Categoría --</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.nombre}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Año de Edición:</label>
              <input
                type="number"
                name="anio"
                value={formData.anio}
                onChange={handleChange}
                className={errors.some(e => e.campo === 'anio') ? 'input-error' : ''}
              />
            </div>

            {/* Inventario */}
            <div className="form-group">
              <label>Cantidad de Ejemplares:</label>
              <input
                type="number"
                name="cantidadDisponible"
                value={formData.cantidadDisponible}
                onChange={handleChange}
                min="1"
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
                placeholder="Ej: Pasillo A - Estante 4"
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
              placeholder="Breve sinopsis o notas del estado del libro..."
            />
          </div>

          <ErrorMessage errors={errors} />

          <div className="button-group">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrar Libro'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary" 
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