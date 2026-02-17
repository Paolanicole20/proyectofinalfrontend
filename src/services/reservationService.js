import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/reservations';

export const reservationService = {
  getAll: () => axios.get(BASE_URL),
  create: (data) => axios.post(BASE_URL, data),
  cancel: (id) => axios.put(`${BASE_URL}/cancel/${id}`),
  getById: (id) => axios.get(`${BASE_URL}/${id}`)
};

export default reservationService;