import axios from 'axios';

// Usamos el puerto 5000 para coincidir con tu Backend
const apiUrl = import.meta.env.VITE_APIMANT_URL || 'http://127.0.0.1:5000/api';

const axiosInstance = axios.create({ 
    baseURL: apiUrl,
    timeout: 30000, 
    headers: {
        'Content-Type': 'application/json'
    },
});

// Interceptor para añadir el token (Auth)
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Manejo de errores globales (401 Unauthorized)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;