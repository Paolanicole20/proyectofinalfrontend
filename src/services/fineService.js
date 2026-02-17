import axiosInstance from '../api/axiosInstance'; 

const ENDPOINT = '/fines';

export const fineService = {
  getAll: () => axiosInstance.get(ENDPOINT),
  // Ajustado para que coincida con la ruta estándar: /fines/:id/pay
  pay: (id) => axiosInstance.put(`${ENDPOINT}/${id}/pay`),
  create: (data) => axiosInstance.post(ENDPOINT, data),
  delete: (id) => axiosInstance.delete(`${ENDPOINT}/${id}`)
};

export default fineService;