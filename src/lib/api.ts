import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem('ims_user');
  if (raw) {
    try {
      const user = JSON.parse(raw);
      const token = user?.token;
      if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // ignore
    }
  }
  return config;
});

