import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fineService } from '../../services/fineService';
import { toast } from 'react-toastify';


const FinesPage = () => {
  const navigate = useNavigate();
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pendiente, pagada

  const loadFines = async () => {
    try {
      setLoading(true);
      const response = await fineService.getAll();
      setFines(response.data || []);
    } catch (error) {
      console.error('Error al cargar multas:', error);
      toast.error('No se pudo cargar el listado de multas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFines();
  }, []);

  const handlePay = async (id) => {
    // Usamos una confirmación estética en lugar de un alert si fuera posible, 
   
    if (!window.confirm('¿Desea registrar el pago total de esta multa?')) return;

    try {
      await fineService.pay(id);
      toast.success('Pago registrado correctamente');
      loadFines();
    } catch (error) {
      toast.error('Error al procesar el pago');
    }
  };

  const formatDate = (date) => {
    if (!date) return '---';
    return new Date(date).toLocaleDateString('es-SV');
  };

  const filteredFines = fines.filter(fine => {
    if (filter === 'pendiente') return fine.estado === 'pendiente';
    if (filter === 'pagada') return fine.estado === 'pagada';
    return true;
  });

  const totalPending = fines
    .filter(f => f.estado === 'pendiente')
    .reduce((sum, f) => sum + (f.monto || 0), 0);

  if (loading) return <div className="loading-state">Cargando estados de cuenta...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">💰 Gestión de Multas</h2>
          <p className="page-description">Control de pagos y saldos de estudiantes</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/fines/create')}
        >
          + Nueva Multa Manual
        </button>
      </div>

      {/* Tarjeta de Resumen de Saldo */}
      <div className="form-card" style={{ marginBottom: '1.5rem', borderLeft: '5px solid #eab308' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ margin: 0, color: '#854d0e' }}>Total Pendiente de Cobro</h4>
            <p style={{ margin: 0, opacity: 0.8 }}>Suma de todas las multas no pagadas</p>
          </div>
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#854d0e' }}>
            ${totalPending.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Sección de Filtros */}
      <div className="filter-section" style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
        <button 
          className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilter('all')}
        >
          Todas
        </button>
        <button 
          className={`btn ${filter === 'pendiente' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilter('pendiente')}
        >
          Pendientes
        </button>
        <button 
          className={`btn ${filter === 'pagada' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilter('pagada')}
        >
          Pagadas
        </button>
      </div>

      <div className="table-card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Concepto / Motivo</th>
                <th>Monto</th>
                <th>Fecha Emisión</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredFines.length > 0 ? (
                filteredFines.map((fine) => (
                  <tr key={fine._id}>
                    <td>
                      <div className="user-info">
                        <span className="user-name">{fine.estudiante?.nombres} {fine.estudiante?.apellidos}</span>
                        <small className="user-sub">{fine.estudiante?.carnet}</small>
                      </div>
                    </td>
                    <td>{fine.motivo}</td>
                    <td style={{ fontWeight: '600' }}>${fine.monto?.toFixed(2)}</td>
                    <td>{formatDate(fine.fecha)}</td>
                    <td>
                      <span className={`status-badge ${fine.estado === 'pendiente' ? 'status-danger' : 'status-active'}`}>
                        {fine.estado === 'pendiente' ? 'Pendiente' : 'Pagada'}
                      </span>
                    </td>
                    <td>
                      {fine.estado === 'pendiente' ? (
                        <button 
                          className="btn btn-success btn-small"
                          onClick={() => handlePay(fine._id)}
                        >
                          💸 Cobrar
                        </button>
                      ) : (
                        <span className="text-success" style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>
                          ✓ Completado
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-data">No se encontraron multas en esta categoría.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinesPage;