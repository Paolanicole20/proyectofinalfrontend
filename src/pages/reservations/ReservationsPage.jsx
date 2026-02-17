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
      toast.error('Error al cargar reservaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReservations(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('¿Cancelar esta reservación?')) return;
    try {
      await reservationService.cancel(id);
      toast.success('Reservación cancelada');
      loadReservations();
    } catch (error) {
      toast.error('No se pudo cancelar');
    }
  };

  const formatDate = (date) => date ? new Date(date).toLocaleDateString('es-SV') : '---';

  if (loading) return <div className="loading-state">Cargando cronograma de reservas...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">📅 Gestión de Reservaciones</h2>
          <p className="page-description">Control de apartado de libros</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/reservations/create')}>+ Nueva Reserva</button>
      </div>

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Estudiante</th>
              <th>Libro</th>
              <th>Vence</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((res) => (
              <tr key={res._id}>
                <td>
                  <div className="user-info">
                    <span className="user-name">{res.estudiante?.nombres}</span>
                    <small className="user-sub">{res.estudiante?.carnet}</small>
                  </div>
                </td>
                <td>{res.libro?.titulo}</td>
                <td>{formatDate(res.fechaVencimiento)}</td>
                <td>
                  <span className={`status-badge ${res.estado === 'activa' ? 'status-active' : 'status-danger'}`}>
                    {res.estado === 'activa' ? 'Activa' : 'Cancelada'}
                  </span>
                </td>
                <td className="table-actions">
                  {res.estado === 'activa' && (
                    <>
                      <button className="btn-table-edit" onClick={() => navigate(`/reservations/edit/${res._id}`)}>
                        ✏️ <span>Editar</span>
                      </button>
                      <button className="btn-table-delete" onClick={() => handleCancel(res._id)}>
                        🗑️ <span>Cancelar</span>
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default ReservationsPage;