import axios from 'axios';

const api = axios.create({
  baseURL: 'https://mzee-s-lens.onrender.com', // Your backend server URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
