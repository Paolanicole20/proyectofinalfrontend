import api from '../api/axiosInstance';

// Obtener todas las multas con filtros (por ejemplo, filtrar por estado 'pendiente')
export const getFines = (filtros = {}) => {
    const filtrosLimpios = Object.fromEntries(
        Object.entries(filtros).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
    );
    return api.get('/fines', {
        params: filtrosLimpios 
    });
};

export const getFineById = (id) => api.get(`/fines/${id}`);

export const createFine = (fineData) => api.post('/fines', fineData);

// Función especial para procesar el pago de la multa
export const payFine = (id) => api.put(`/fines/${id}/pay`);

export const deleteFine = (id) => api.delete(`/fines/${id}`);