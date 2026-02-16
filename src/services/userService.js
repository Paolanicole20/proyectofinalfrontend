import api from '../api/axiosInstance';

// Filtros para la tabla de usuarios
export const getUsers = (filtros) => {
  const filtrosLimpios = Object.fromEntries(
    Object.entries(filtros || {}).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
  );
  return api.get('/users', {
    params: filtrosLimpios 
  });
};

export const getUserById = (id) => api.get(`/users/${id}`);

export const createUser = (userData) => api.post('/users', userData);

export const updateUser = (id, userData) => api.put(`/users/${id}`, userData);

export const deleteUser = (id) => api.delete(`/users/${id}`);

// RUTA CRÍTICA: Coincide con tu Backend (/api/users + /login)
export const loginUser = (userData) => api.post('/users/login', userData);

// RUTA CRÍTICA: Coincide con tu Backend (/api/users + /:id/change-password)
export const changePasswordUser = (id, userData) => api.put(`/users/${id}/change-password`, userData);

export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
