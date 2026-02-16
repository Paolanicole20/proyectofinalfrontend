import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { returnService } from '../../services/returnService';
import { toast } from 'react-toastify';


const ReturnsPage = () => {
  const navigate = useNavigate();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const response = await returnService.getAll();
      setReturns(response.data || []);
    } catch (error) {
      console.error('Error al cargar devoluciones:', error);
      toast.error('No se pudo cargar el historial de devoluciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const formatDate = (date) => {
    if (!date) return '---';
    return new Date(date).toLocaleDateString('es-SV', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) return <div className="loading-state">Cargando historial de devoluciones...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">↩️ Registro de Devoluciones</h2>
          <p className="page-description">Historial completo de libros recibidos</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/returns/create')}
        >
          + Registrar Devolución
        </button>
      </div>

      <div className="table-card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Libro</th>
                <th>Fecha Devolución</th>
                <th>Estado Físico</th>
                <th>Retraso</th>
                <th>Observaciones</th>
              </tr>
            </thead>
            <tbody>
              {returns.length > 0 ? (
                returns.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div className="user-info">
                        <span className="user-name">
                          {item.prestamo?.estudiante?.nombres} {item.prestamo?.estudiante?.apellidos}
                        </span>
                        <small className="user-sub">
                          {item.prestamo?.estudiante?.carnet || 'N/A'}
                        </small>
                      </div>
                    </td>
                    <td>{item.prestamo?.libro?.titulo || 'Libro no identificado'}</td>
                    <td>{formatDate(item.fechaDevolucionReal)}</td>
                    <td>
                      <span className={`status-badge ${item.estadoLibro === 'Excelente' ? 'status-active' : 'status-returned'}`}>
                        {item.estadoLibro}
                      </span>
                    </td>
                    <td>
                      {item.diasRetraso > 0 ? (
                        <span className="status-badge status-danger" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
                          {item.diasRetraso} días
                        </span>
                      ) : (
                        <span className="text-muted">A tiempo</span>
                      )}
                    </td>
                    <td className="text-small">
                      {item.observaciones || <span className="text-muted italic">Sin notas</span>}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-data">
                    No hay devoluciones registradas en el sistema.
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

export default ReturnsPage;