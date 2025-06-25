import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080', // A URL base do seu backend Go
  // headers: {
  //   'Content-Type': 'application/json',
  // },
});

// Interceptor: Adiciona o token de autenticação a cada requisição
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