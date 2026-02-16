import api from '../api/axiosInstance';

export const studentService = {
    // La página CreateLoan busca "getAll"
    getAll: async (filtros = {}) => {
        const filtrosLimpios = Object.fromEntries(
            Object.entries(filtros).filter(([_, value]) =>
                value !== '' && value !== null && value !== undefined
            )
        );
        return await api.get('/students', { params: filtrosLimpios });
    },
    getById: (id) => api.get(`/students/${id}`),
    create: (data) => api.post('/students', data),
    update: (id, data) => api.put(`/students/${id}`, data),
    delete: (id) => api.delete(`/students/${id}`)
};

export default studentService;