// src/utils/axios.js
import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://laxmipowertech-backend.onrender.com/api',
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // ✅ IMPORTANT
  } else {
    console.warn("🚫 No token found in localStorage");
  }
  return config;
});

export default instance;
