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
      toast.error('Error al sincronizar catálogo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBooks(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Desea retirar este libro del inventario?')) return;
    try {
      await bookService.delete(id);
      toast.success('Libro eliminado correctamente');
      loadBooks();
    } catch (error) {
      toast.error('No se puede eliminar: el libro tiene préstamos activos');
    }
  };

  if (loading) return <div className="loading-state">Sincronizando catálogo bibliográfico...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">📖 Gestión de Libros</h2>
          <p className="page-description">Control de inventario y títulos</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/books/create')}>+ Nuevo Libro</button>
      </div>

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>ISBN</th>
              <th>Información del Libro</th>
              <th>Stock</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book._id}>
                <td style={{ fontFamily: 'monospace' }}>{book.isbn}</td>
                <td>
                  <div className="user-info">
                    <span className="user-name">{book.titulo}</span>
                    <small className="user-sub">{book.autor}</small>
                  </div>
                </td>
                <td>{book.cantidadDisponible} / {book.cantidadTotal}</td>
                <td>
                  <span className={`status-badge ${book.cantidadDisponible > 0 ? 'status-active' : 'status-danger'}`}>
                    {book.cantidadDisponible > 0 ? 'Disponible' : 'Agotado'}
                  </span>
                </td>
                <td className="table-actions">
                  <button className="btn-table-edit" onClick={() => navigate(`/books/edit/${book._id}`)}>
                    ✏️ <span>Editar</span>
                  </button>
                  <button className="btn-table-delete" onClick={() => handleDelete(book._id)}>
                    🗑️ <span>Eliminar</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default BooksPage;