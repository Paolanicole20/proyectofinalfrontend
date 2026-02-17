import api from '../api/axiosInstance';

// Funciones individuales
export const getAll = (filtros = {}) => {
    const filtrosLimpios = Object.fromEntries(
        Object.entries(filtros).filter(([_, value]) =>
            value !== '' && value !== null && value !== undefined
        )
    );
    return api.get('/students', { params: filtrosLimpios });
};

export const getById = (id) => api.get(`/students/${id}`);

export const create = (data) => api.post('/students', data);

export const update = (id, data) => api.put(`/students/${id}`, data);

export const deleteStudent = (id) => api.delete(`/students/${id}`);

// Exportación nombrada (Para evitar el error en CreateLoanPage)
export const studentService = {
    getAll,
    getById,
    create,
    update,
    deleteStudent
};

// Exportación por defecto
export default studentService;