import axios from 'axios';

export const backendUrl = 'http://143.107.45.126:7655';

const apiClient = axios.create({
  baseURL: backendUrl, 
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
