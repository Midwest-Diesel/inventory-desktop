import axios from 'axios';

const getUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'https://inventory-server.up.railway.app';
  } else {
    return 'http://localhost:8000';
  }
};

const baseURL = getUrl();

const api = axios.create({
  baseURL,
});

export default api;
