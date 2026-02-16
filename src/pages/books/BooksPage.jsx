import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookService } from '../../services/bookService';
import { toast } from 'react-toastify';


const BooksPage = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const response = await bookService.getAll();
      setBooks(response.data || []);
    } catch (error) {
      console.error('Error al cargar libros:', error);
      toast.error('No se pudo establecer conexión con el catálogo de libros');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este libro? Esta acción no se puede deshacer si el libro tiene préstamos asociados.')) {
      return;
    }

    try {
      await bookService.delete(id);
      toast.success('Libro retirado del catálogo correctamente');
      loadBooks();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'No se puede eliminar un libro con historial activo';
      toast.error(errorMsg);
    }
  };

  if (loading) return <div className="loading-state">Sincronizando catálogo bibliográfico...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">📖 Gestión de Libros</h2>
          <p className="page-description">Control de inventario, títulos y disponibilidad</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/books/create')}
        >
          + Nuevo Libro
        </button>
      </div>

      <div className="table-card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ISBN</th>
                <th>Información del Libro</th>
                <th>Categoría</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {books.length > 0 ? (
                books.map((book) => (
                  <tr key={book._id}>
                    <td className="font-mono text-small">{book.isbn}</td>
                    <td>
                      <div className="user-info">
                        <span className="user-name">{book.titulo}</span>
                        <small className="user-sub">{book.autor}</small>
                      </div>
                    </td>
                    <td>
                      <span className="category-tag">
                        {book.categoria?.nombre || 'General'}
                      </span>
                    </td>
                    <td>
                      <div className="stock-info">
                        <span className="stock-current">{book.cantidadDisponible}</span>
                        <small className="stock-total">/ {book.cantidadTotal || book.cantidadDisponible}</small>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${
                        book.cantidadDisponible > 0 ? 'status-active' : 'status-danger'
                      }`}>
                        {book.cantidadDisponible > 0 ? 'Disponible' : 'Agotado'}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button 
                          className="btn btn-info btn-small"
                          onClick={() => navigate(`/books/edit/${book._id}`)}
                          title="Editar detalles del libro"
                        >
                          ✏️
                        </button>
                        <button 
                          className="btn btn-danger btn-small"
                          onClick={() => handleDelete(book._id)}
                          title="Eliminar del catálogo"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-data">
                    No se encontraron libros registrados en la biblioteca.
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

export default BooksPage;