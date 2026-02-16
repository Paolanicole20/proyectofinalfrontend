import axiosInstance from '../api/axiosInstance';

export const loanService = {
  getAll: async () => {
    const response = await axiosInstance.get('/loans');
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/loans/${id}`);
    return response.data;
  },

  create: async (loanData) => {
    const response = await axiosInstance.post('/loans', loanData);
    return response.data;
  },

  update: async (id, loanData) => {
    const response = await axiosInstance.put(`/loans/${id}`, loanData);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/loans/${id}`);
    return response.data;
  }
};