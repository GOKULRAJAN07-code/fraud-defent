import axios from 'axios';

const API_URL = 'http://localhost:8000';

const client = axios.create({
  baseURL: API_URL,
});

// Intercept requests to add JWT token if exists
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default client;
export { API_URL };
