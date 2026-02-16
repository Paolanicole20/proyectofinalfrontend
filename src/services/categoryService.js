import api from '../api/axiosInstance';

const categoryService = {
    // Obtener todas las categorías
    getAll: (filtros = {}) => {
        const filtrosLimpios = Object.fromEntries(
            Object.entries(filtros).filter(([_, value]) =>
                value !== '' && value !== null && value !== undefined
            )
        );

        return api.get('/categories', {
            params: filtrosLimpios
        });
    },

    // Obtener categoría por ID
    getById: (id) => api.get(`/categories/${id}`),

    // Crear categoría
    create: (categoryData) => api.post('/categories', categoryData),

    // Actualizar categoría
    update: (id, categoryData) => api.put(`/categories/${id}`, categoryData),

    // Eliminar categoría
    delete: (id) => api.delete(`/categories/${id}`)
};

export { categoryService };
