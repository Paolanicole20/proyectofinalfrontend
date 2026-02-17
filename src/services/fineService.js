import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/fines';

export const fineService = {
  getAll: () => axios.get(BASE_URL),
  pay: (id) => axios.put(`${BASE_URL}/pay/${id}`),
  create: (data) => axios.post(BASE_URL, data),
  delete: (id) => axios.delete(`${BASE_URL}/${id}`)
};

export default fineService;