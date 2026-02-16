import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loanService } from '../../services/loanService';
import { toast } from 'react-toastify';

const LoansPage = () => {
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const response = await loanService.getAll();
      setLoans(response.data || []);
    } catch (error) {
      console.error('Error al cargar préstamos:', error);
      toast.error('No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este registro de préstamo?')) return;

    try {
      await loanService.delete(id);
      toast.success('Préstamo eliminado');
      fetchLoans();
    } catch (error) {
      toast.error('Error al intentar eliminar el préstamo');
    }
  };

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
          <p className="page-description">Control de salida y entrada de libros</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/loans/create')}
        >
          + Nuevo Préstamo
        </button>
      </div>

      <div className="table-card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Libro</th>
                <th>Fecha Préstamo</th>
                <th>Fecha Devolución</th>
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
                        <span className="user-name">{loan.estudiante?.nombres} {loan.estudiante?.apellidos}</span>
                        <small className="user-sub">{loan.estudiante?.carnet}</small>
                      </div>
                    </td>
                    <td>{loan.libro?.titulo || <span className="text-muted">Desconocido</span>}</td>
                    <td>{formatDate(loan.fechaPrestamo)}</td>
                    <td>{formatDate(loan.fechaDevolucionEsperada)}</td>
                    <td>
                      <span className={`status-badge ${loan.estado === 'activo' ? 'status-active' : 'status-returned'}`}>
                        {loan.estado === 'activo' ? 'Pendiente' : 'Devuelto'}
                      </span>
                    </td>
                    <td className="table-actions">
                      <button 
                        className="btn btn-info btn-small" 
                        onClick={() => navigate(`/loans/edit/${loan._id}`)}
                      >
                        Editar
                      </button>
                      <button 
                        className="btn btn-danger btn-small" 
                        onClick={() => handleDelete(loan._id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-data">
                    No hay registros de préstamos disponibles.
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

export default LoansPage;