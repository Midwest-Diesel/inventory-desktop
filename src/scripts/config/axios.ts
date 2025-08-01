import axios from 'axios';

const getUrl = () => {
  if (import.meta.env.PROD) {
    return 'https://inventory-server.up.railway.app';
  } else if (import.meta.env.VITE_NODE_ENV === 'test') {
    return 'http://localhost:8001';
  } else {
    return 'http://localhost:8000';
  }
};

const baseURL = getUrl();

const api = axios.create({
  baseURL,
});

export default api;