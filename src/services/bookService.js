import api from '../api/axiosInstance';

export const bookService = {
    getAll: async (filtros = {}) => {
        const filtrosLimpios = Object.fromEntries(
            Object.entries(filtros).filter(([_, value]) =>
                value !== '' && value !== null && value !== undefined
            )
        );
        return await api.get('/books', { params: filtrosLimpios });
    },
    getById: (id) => api.get(`/books/${id}`),
    create: (bookData) => api.post('/books', bookData),
    update: (id, bookData) => api.put(`/books/${id}`, bookData),
    delete: (id) => api.delete(`/books/${id}`)
};

export default bookService;