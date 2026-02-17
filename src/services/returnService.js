import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/returns';

export const returnService = {
  getAll: () => axios.get(BASE_URL),
  getById: (id) => axios.get(`${BASE_URL}/${id}`),
  create: (data) => axios.post(BASE_URL, data),
  delete: (id) => axios.delete(`${BASE_URL}/${id}`)
};

export default returnService;