import axios from 'axios';

const baseURL =
  import.meta.env.VITE_BACKEND_URL || 'https://mzee-s-lens.onrender.com';

const api = axios.create({
  baseURL,                  
  withCredentials: true,
});

export default api;
