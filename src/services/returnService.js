import axiosInstance from '../api/axiosInstance'; 

const ENDPOINT = '/returns';

export const returnService = {
  getAll: () => axiosInstance.get(ENDPOINT),
  getById: (id) => axiosInstance.get(`${ENDPOINT}/${id}`),
  create: (data) => axiosInstance.post(ENDPOINT, data),
  delete: (id) => axiosInstance.delete(`${ENDPOINT}/${id}`)
};

export default returnService;