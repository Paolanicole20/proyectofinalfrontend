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

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await categoryService.getAll();
        const data = response.data;
        if (Array.isArray(data)) {
          setCategories(data);
        } else if (data && Array.isArray(data.categories)) {
          setCategories(data.categories);
        } else if (data && Array.isArray(data.docs)) {
          setCategories(data.docs);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error("Error al cargar categorías:", error);
        toast.error('Error al cargar catálogo de categorías.');
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
      const msg = error.response?.data?.msg || 'Error al guardar el libro';
      setErrors([{ campo: 'SERVER', mensaje: msg }]);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="loading-state">Cargando categorías y recursos...</div>;

  return (
    <div className="page-container" style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
        <div>
          <h2 style={{ color: '#1a237e', margin: 0 }}>📖 Registro de Nuevo Libro</h2>
          <p style={{ color: '#666', margin: '5px 0' }}>Complete la ficha técnica para el inventario</p>
        </div>
      </div>

      <div className="form-card" style={{ background: '#fff', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>ISBN / Código de Barras:</label>
              <input
                type="text"
                name="isbn"
                value={formData.isbn}
                onChange={handleChange}
                placeholder="Ej: 978-607-313-433-0"
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Título de la Obra:</label>
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Autor(es):</label>
              <input
                type="text"
                name="autor"
                value={formData.autor}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Editorial:</label>
              <input
                type="text"
                name="editorial"
                value={formData.editorial}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Categoría / Género:</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
              >
                <option value="">-- Seleccione Categoría --</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>
                    {cat.nombre || cat.name || "Sin nombre"}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Año de Edición:</label>
              <input
                type="number"
                name="anioPublicacion"
                value={formData.anioPublicacion}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Cantidad de Ejemplares:</label>
              <input
                type="number"
                name="cantidadDisponible"
                value={formData.cantidadDisponible}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Ubicación Física:</label>
              <input
                type="text"
                name="ubicacion"
                value={formData.ubicacion}
                onChange={handleChange}
                placeholder="Ej: Estante A-13"
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Resumen / Descripción:</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows="3"
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' }}
            />
          </div>

          <div style={{ marginTop: '15px' }}>
            <ErrorMessage errors={errors} />
          </div>

          {/* SECCIÓN DE BOTONES ACTUALIZADA SEGÚN TU IMAGEN */}
          <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
            <button 
              type="submit" 
              disabled={loading} 
              style={{ 
                background: '#1a237e', 
                color: 'white', 
                padding: '10px 20px', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer', 
                flex: 1,
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {loading ? 'Guardando...' : '💾 Registrar Libro'}
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/books')} 
              disabled={loading}
              style={{ 
                background: '#f44336', 
                color: 'white', 
                padding: '10px 20px', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
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