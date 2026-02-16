import api from '../api/axiosInstance';

// Obtener todas las reservaciones con filtros (ej: por estado 'pendiente' o 'disponible')
export const getReservations = (filtros = {}) => {
    const filtrosLimpios = Object.fromEntries(
        Object.entries(filtros).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
    );
    return api.get('/reservations', {
        params: filtrosLimpios 
    });
};

export const getReservationById = (id) => api.get(`/reservations/${id}`);

export const createReservation = (reservationData) => api.post('/reservations', reservationData);

// Función específica para cancelar 
export const cancelReservation = (id) => api.put(`/reservations/${id}/cancel`);

export const deleteReservation = (id) => api.delete(`/reservations/${id}`);