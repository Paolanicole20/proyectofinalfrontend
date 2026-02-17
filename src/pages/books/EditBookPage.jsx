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
        const [catRes, bookRes] = await Promise.all([
          categoryService.getAll(),
          bookService.getById(id)
        ]);

        setCategories(catRes.data || []);
        const book = bookRes.data || bookRes;

        setFormData({
          isbn: book.isbn || '',
          titulo: book.titulo || '',
          autor: book.autor || '',
          editorial: book.editorial || '',
          anio: book.anio?.toString() || '',
          categoria: book.categoriaId?._id || book.categoriaId || '',
          cantidadDisponible: book.cantidadDisponible?.toString() || '0',
          ubicacion: book.ubicacion || '',
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

    const result = bookZodSchema.safeParse(dataToValidate);
    if (!result.success) {
      setErrors(result.error.issues.map(i => ({ campo: i.path[0], mensaje: i.message })));
      return;
    }

    try {
      setSaving(true);
      // Traducción para el Backend
      const dataToSave = {
        ...dataToValidate,
        categoriaId: formData.categoria
      };
      await bookService.update(id, dataToSave);
      toast.success('Libro actualizado correctamente');
      navigate('/books');
    } catch (error) {
      setErrors([{ campo: 'SERVER', mensaje: error.response?.data?.error || 'Error al actualizar' }]);
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
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>ISBN:</label>
              <input type="text" name="isbn" value={formData.isbn} onChange={handleChange} className={errors.some(e => e.campo === 'isbn') ? 'input-error' : ''} />
            </div>
            <div className="form-group">
              <label>Título:</label>
              <input type="text" name="titulo" value={formData.titulo} onChange={handleChange} className={errors.some(e => e.campo === 'titulo') ? 'input-error' : ''} />
            </div>
            <div className="form-group">
              <label>Autor:</label>
              <input type="text" name="autor" value={formData.autor} onChange={handleChange} className={errors.some(e => e.campo === 'autor') ? 'input-error' : ''} />
            </div>
            <div className="form-group">
              <label>Categoría:</label>
              <select name="categoria" value={formData.categoria} onChange={handleChange} className={errors.some(e => e.campo === 'categoria') ? 'input-error' : ''}>
                <option value="">-- Seleccione Categoría --</option>
                {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.nombre}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Año de Edición:</label>
              <input type="number" name="anio" value={formData.anio} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Stock:</label>
              <input type="number" name="cantidadDisponible" value={formData.cantidadDisponible} onChange={handleChange} />
            </div>
          </div>
          <ErrorMessage errors={errors} />
          <div className="button-group">
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Actualizar Libro'}</button>
            <button type="button" className="btn-danger" onClick={() => navigate('/books')}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBookPage;