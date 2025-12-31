import axios from 'axios';
import Cookies from 'js-cookie';

// Ambil URL dari .env.local atau fallback
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  // Jangan set Content-Type default di sini jika pakai FormData nanti
  // headers: { 'Content-Type': 'application/json' }, 
});

// --- INTERCEPTOR REQUEST (Pasang Token) ---
api.interceptors.request.use(
  (config) => {
    // Cek token di Cookie
    const token = Cookies.get('access_token'); 
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Jika data adalah FormData (Upload File), biarkan browser set Content-Type (multipart/form-data)
    // Jika JSON biasa, set manual
    if (!(config.data instanceof FormData)) {
       config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// --- INTERCEPTOR RESPONSE (Handle 401 Logout) ---
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // PENTING: Hapus Content-Type jika data adalah FormData 
    // (Agar browser otomatis set boundary untuk upload file)
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;