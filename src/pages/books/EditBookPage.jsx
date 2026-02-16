import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { bookService } from '../../services/bookService';
import { categoryService } from '../../services/categoryService';
import { bookZodSchema } from '../../schemas/book';
import ErrorMessage from '../../components/ErrorMessage';
import { toast } from 'react-toastify';


const EditBookPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    isbn: '',
    titulo: '',
    autor: '',
    editorial: '',
    anio: '',
    categoria: '',
    cantidadDisponible: '',
    ubicacion: '',
    descripcion: ''
  });

  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const initPage = async () => {
      try {
        setLoading(true);
        // Cargar categorías y datos del libro en paralelo
        const [catRes, bookRes] = await Promise.all([
          categoryService.getAll(),
          bookService.getById(id)
        ]);

        setCategories(catRes.data || []);
        
        const book = bookRes.data;
        setFormData({
          isbn: book.isbn,
          titulo: book.titulo,
          autor: book.autor,
          editorial: book.editorial,
          anio: book.anio.toString(),
          categoria: book.categoria?._id || book.categoria || '',
          cantidadDisponible: book.cantidadDisponible.toString(),
          ubicacion: book.ubicacion,
          descripcion: book.descripcion || ''
        });
      } catch (error) {
        toast.error('No se pudo recuperar la información del libro');
        navigate('/books');
      } finally {
        setLoading(false);
      }
    };

    initPage();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors.length > 0) setErrors([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dataToValidate = {
      ...formData,
      anio: parseInt(formData.anio),
      cantidadDisponible: parseInt(formData.cantidadDisponible)
    };

    try {
      const result = bookZodSchema.safeParse(dataToValidate);
      
      if (!result.success) {
        const issues = result.error.issues.map(i => ({
          campo: i.path[0],
          mensaje: i.message
        }));
        setErrors(issues);
        return;
      }

      setSaving(true);
      await bookService.update(id, dataToValidate);
      toast.success('Información del libro actualizada');
      navigate('/books');
    } catch (error) {
      const msg = error.response?.data?.error || 'Error al actualizar el catálogo';
      setErrors([{ campo: 'SERVER', mensaje: msg }]);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-state">Obteniendo ficha bibliográfica...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">✏️ Editar Libro</h2>
          <p className="page-description">Modificando: <strong>{formData.titulo}</strong></p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/books')}>
          ← Volver
        </button>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>ISBN:</label>
              <input
                type="text"
                name="isbn"
                value={formData.isbn}
                onChange={handleChange}
                className={errors.some(e => e.campo === 'isbn') ? 'input-error' : ''}
              />
            </div>

            <div className="form-group">
              <label>Título:</label>
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                className={errors.some(e => e.campo === 'titulo') ? 'input-error' : ''}
              />
            </div>

            <div className="form-group">
              <label>Autor:</label>
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
              <label>Categoría:</label>
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

            <div className="form-group">
              <label>Cantidad en Stock:</label>
              <input
                type="number"
                name="cantidadDisponible"
                value={formData.cantidadDisponible}
                onChange={handleChange}
                className={errors.some(e => e.campo === 'cantidadDisponible') ? 'input-error' : ''}
              />
            </div>

            <div className="form-group">
              <label>Ubicación:</label>
              <input
                type="text"
                name="ubicacion"
                value={formData.ubicacion}
                onChange={handleChange}
                className={errors.some(e => e.campo === 'ubicacion') ? 'input-error' : ''}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>Descripción / Notas:</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <ErrorMessage errors={errors} />

          <div className="button-group">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Guardando cambios...' : 'Actualizar Libro'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => navigate('/books')}
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

export default EditBookPage;