import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryService } from '../../services/categoryService';
import { toast } from 'react-toastify';

const CategoriesPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Función para cargar categorías
  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await categoryService.getAll();
      // Ajusta 'response.data' según la estructura de tu API
      setCategories(Array.isArray(response.data) ? response.data : response || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al conectar con el catálogo de categorías');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Función para eliminar
  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar esta categoría? Los libros asociados podrían quedar sin clasificación.')) return;
    
    try {
      await categoryService.delete(id);
      toast.success('Categoría eliminada correctamente');
      loadCategories(); // Recargar la lista
    } catch (error) {
      toast.error('No se puede eliminar: la categoría está siendo usada por libros.');
    }
  };

  // Filtrado simple por nombre
  const filteredCategories = categories.filter(cat => 
    cat.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="loading-state">Organizando estanterías temáticas...</div>;

  return (
    <div className="page-container">
      {/* Encabezado Principal */}
      <div className="page-header">
        <div>
          <h1 className="page-title">🏷️ Gestión de Categorías</h1>
          <p className="page-description">Administra las clasificaciones temáticas de la biblioteca</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/categories/create')}>
          + Nueva Categoría
        </button>
      </div>

      {/* Barra de Búsqueda */}
      <div className="search-section">
        <div className="search-form">
          <div className="form-group-inline">
            <label>Filtrar por nombre:</label>
            <input
              type="text"
              placeholder="Ej: Ciencias, Historia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-primary" onClick={loadCategories}>Actualizar</button>
        </div>
      </div>

      {/* Tabla con el nuevo diseño de App.css */}
      <div className="table-card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Código / ID</th>
                <th>Nombre de Categoría</th>
                <th>Descripción</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.length > 0 ? (
                filteredCategories.map((cat) => (
                  <tr key={cat._id}>
                    {/* Estilo monoespaciado para códigos técnicos */}
                    <td style={{ fontFamily: 'monospace', color: '#64748b', fontSize: '0.85rem' }}>
                      {cat.codigo || cat._id.substring(0, 8).toUpperCase()}
                    </td>
                    
                    <td>
                      <span className="user-name">{cat.nombre}</span>
                    </td>
                    
                    <td style={{ maxWidth: '350px', fontSize: '0.9rem', color: '#475569' }}>
                      {cat.descripcion || 'Sin descripción detallada'}
                    </td>
                    
                    {/* Nueva Columna de Acciones Estándar */}
                    <td className="table-actions">
                      <button 
                        className="btn-table-edit" 
                        onClick={() => navigate(`/categories/edit/${cat._id}`)}
                      >
                        ✏️ <span>Editar</span>
                      </button>
                      <button 
                        className="btn-table-delete" 
                        onClick={() => handleDelete(cat._id)}
                      >
                        🗑️ <span>Eliminar</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ padding: '30px', color: '#94a3b8' }}>
                    No se encontraron categorías disponibles.
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