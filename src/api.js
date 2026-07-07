// src/api.js
import axios from 'axios';

const DEFAULT_BASE = import.meta.env.VITE_API_BASE_URL || (window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : 'https://flashkindelivery-back-end.onrender.com');

axios.defaults.baseURL = DEFAULT_BASE;
axios.defaults.withCredentials = true;

export default axios;