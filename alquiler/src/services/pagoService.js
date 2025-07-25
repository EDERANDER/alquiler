import axios from 'axios';

const API_URL = 'http://localhost:3001/api/pagos';

const getAll = () => {
  return axios.get(API_URL, {
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
};

const getByAlquilerId = (alquilerId) => {
  return axios.get(`${API_URL}?id_alquiler=${alquilerId}`, {
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
};

const create = (data) => {
  return axios.post(API_URL, data);
};

const update = (id, data) => {
  return axios.put(`${API_URL}/${id}`, data);
};

const remove = (id) => {
  return axios.delete(`${API_URL}/${id}`);
};

const pagoService = {
  getAll,
  getByAlquilerId,
  create,
  update,
  remove,
};

export default pagoService;
