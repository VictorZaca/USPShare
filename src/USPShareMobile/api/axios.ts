import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Substitua o IP pelo IP da SUA máquina na rede local
export const API_URL = 'http://192.168.15.10:8080'; 

const apiClient = axios.create({
  baseURL: API_URL,
});
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
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