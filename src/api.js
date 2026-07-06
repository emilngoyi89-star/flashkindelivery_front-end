// src/api.js
import axios from 'axios';

const api = axios.create({
  // Si le site est sur ton PC, il utilise localhost. 
  // Sinon (donc sur Netlify), il utilise Render.
  baseURL: window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : 'https://flashkindelivery-back-end.onrender.com', 
  withCredentials: true 
});

export default api;