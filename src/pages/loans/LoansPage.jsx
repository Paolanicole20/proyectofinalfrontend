import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loanService } from '../../services/loanService';
import { toast } from 'react-toastify';

const LoansPage = () => {
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Función para obtener los préstamos
  const fetchLoans = async () => {
    try {
      setLoading(true);
      const res = await loanService.getAll();
      
      // El backend retorna el array directamente o dentro de .data
      const dataArray = res.data || res; 
      setLoans(Array.isArray(dataArray) ? dataArray : []);
      
    } catch (error) {
      console.error("Error en fetchLoans:", error);
      toast.error('Error al cargar la lista de préstamos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  // Función para eliminar un préstamo
  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este registro de préstamo?')) return;
    try {
      await loanService.delete(id);
      toast.success('Registro eliminado correctamente');
      fetchLoans(); 
    } catch (error) {
      toast.error('No se pudo eliminar el registro');
    }
  };

  // Formateador de fechas
  const formatDate = (date) => {
    if (!date) return '---';
    return new Date(date).toLocaleDateString('es-SV', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) return <div className="loading-state">Cargando lista de préstamos...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">📚 Gestión de Préstamos</h2>
          <p className="page-description">Control de salida y entrada de libros de la biblioteca</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/loans/create')}>
          + Nuevo Préstamo
        </button>
      </div>

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Estudiante</th>
              <th>Libro</th>
              <th>Vencimiento</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loans.length > 0 ? (
              loans.map((loan) => (
                <tr key={loan._id}>
                  <td>
                    <div className="user-info">
                      {/* CORRECCIÓN: Usamos estudianteId porque así viene del backend .populate() */}
                      <span className="user-name">
                        {loan.estudianteId 
                          ? `${loan.estudianteId.nombres} ${loan.estudianteId.apellidos}` 
                          : 'Estudiante no encontrado'}
                      </span>
                      <small className="user-sub">
                        {loan.estudianteId?.matricula || 'Sin Matrícula'}
                      </small>
                    </div>
                  </td>
                  <td>
                    <div className="book-info">
                      {/* CORRECCIÓN: Usamos libroId porque así viene del backend .populate() */}
                      <span className="book-title" style={{ fontWeight: '500' }}>
                        {loan.libroId?.titulo || 'Libro no encontrado'}
                      </span>
                      <br />
                      <small className="text-muted">
                        {loan.libroId?.autor || 'Autor desconocido'}
                      </small>
                    </div>
                  </td>
                  <td>{formatDate(loan.fechaDevolucionEsperada)}</td>
                  <td>
                    <span className={`status-badge ${loan.estado === 'activo' ? 'status-active' : 'status-returned'}`}>
                      {loan.estado === 'activo' ? 'Pendiente' : 'Devuelto'}
                    </span>
                  </td>
                  <td className="table-actions">
                    <button 
                      className="btn-table-edit" 
                      onClick={() => navigate(`/loans/edit/${loan._id}`)}
                      title="Editar"
                    >
                      ✏️ <span>Editar</span>
                    </button>
                    <button 
                      className="btn-table-delete" 
                      onClick={() => handleDelete(loan._id)}
                      title="Eliminar"
                    >
                      🗑️ <span>Eliminar</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
                  No se encontraron préstamos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LoansPage;