import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryService } from '../../services/categoryService';
import { toast } from 'react-toastify';


const CategoriesPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Función de carga similar a fetchProducts 
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getAll();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      toast.error('No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id) => {
    
    if (!window.confirm('¿Estás seguro de eliminar esta categoría?')) return;

    try {
      await categoryService.delete(id);
      toast.success('Categoría eliminada');
      // Recargar la lista tras eliminar
      fetchCategories();
    } catch (error) {
      toast.error('No se pudo eliminar la categoría');
    }
  };

  if (loading) return <div className="loading-state">Cargando categorías...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">🏷️ Gestión de Categorías</h2>
          <p className="page-description">Clasificación de libros por temática</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/categories/create')}
        >
          + Nueva Categoría
        </button>
      </div>

      <div className="table-card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categories.length > 0 ? (
                categories.map((category) => (
                  <tr key={category._id}>
                    <td><strong>{category.codigo}</strong></td>
                    <td>{category.nombre}</td>
                    <td>{category.descripcion || <span className="text-muted">Sin descripción</span>}</td>
                    <td className="table-actions">
                      <button 
                        className="btn btn-info btn-small" 
                        onClick={() => navigate(`/categories/edit/${category._id}`)}
                      >
                        Editar
                      </button>
                      <button 
                        className="btn btn-danger btn-small" 
                        onClick={() => handleDelete(category._id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="no-data">
                    No se encontraron categorías.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;