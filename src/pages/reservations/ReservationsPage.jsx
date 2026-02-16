import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reservationService } from '../../services/reservationService';
import { toast } from 'react-toastify';


const ReservationsPage = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const response = await reservationService.getAll();
      setReservations(response.data || []);
    } catch (error) {
      console.error('Error al cargar reservaciones:', error);
      toast.error('No se pudo cargar el listado de reservaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('¿Está seguro de que desea cancelar esta reservación? El libro quedará disponible para otros usuarios.')) {
      return;
    }

    try {
      await reservationService.cancel(id);
      toast.success('Reservación cancelada exitosamente');
      loadReservations();
    } catch (error) {
      toast.error('No se pudo cancelar la reservación');
    }
  };

  const formatDate = (date) => {
    if (!date) return '---';
    return new Date(date).toLocaleDateString('es-SV');
  };

  if (loading) return <div className="loading-state">Cargando cronograma de reservas...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">📅 Gestión de Reservaciones</h2>
          <p className="page-description">Control de apartado de libros y disponibilidad</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/reservations/create')}
        >
          + Nueva Reservación
        </button>
      </div>

      <div className="table-card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Libro Reservado</th>
                <th>Fecha Reserva</th>
                <th>Vence</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reservations.length > 0 ? (
                reservations.map((res) => (
                  <tr key={res._id}>
                    <td>
                      <div className="user-info">
                        <span className="user-name">{res.estudiante?.nombres} {res.estudiante?.apellidos}</span>
                        <small className="user-sub">{res.estudiante?.carnet}</small>
                      </div>
                    </td>
                    <td>
                      <div className="user-info">
                        <span className="user-name">{res.libro?.titulo}</span>
                        <small className="user-sub">{res.libro?.autor}</small>
                      </div>
                    </td>
                    <td>{formatDate(res.fechaReservacion)}</td>
                    <td>
                      <span style={{ 
                        color: new Date(res.fechaVencimiento) < new Date() && res.estado === 'activa' ? '#dc2626' : 'inherit',
                        fontWeight: new Date(res.fechaVencimiento) < new Date() && res.estado === 'activa' ? 'bold' : 'normal'
                      }}>
                        {formatDate(res.fechaVencimiento)}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${
                        res.estado === 'activa' ? 'status-active' : 
                        res.estado === 'cancelada' ? 'status-danger' : 'status-inactive'
                      }`}>
                        {res.estado === 'activa' ? 'Activa' : 
                         res.estado === 'cancelada' ? 'Cancelada' : 'Completada'}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        {res.estado === 'activa' ? (
                          <>
                            <button 
                              className="btn btn-info btn-small"
                              onClick={() => navigate(`/reservations/edit/${res._id}`)}
                              title="Editar reserva"
                            >
                              ✏️
                            </button>
                            <button 
                              className="btn btn-danger btn-small"
                              onClick={() => handleCancel(res._id)}
                              title="Cancelar reserva"
                            >
                              🚫
                            </button>
                          </>
                        ) : (
                          <small className="text-muted">Sin acciones</small>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-data">No hay reservaciones en el sistema.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReservationsPage;