import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const email = localStorage.getItem('userEmail');
    if (email) {
      config.headers['X-Email'] = email;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;