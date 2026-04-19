// src/lib/api.ts
import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token'); 
    
    console.log(`[API Request] Mengirim ke: ${config.url}`);
    if (token) {
      console.log(`[API Request] Token ditemukan: ${token.substring(0, 15)}... (disembunyikan sebagian)`);
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("[API Request] PERINGATAN: Token KOSONG di Cookies!");
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("[API Response] Akses ditolak (401). Sesi berakhir atau token tidak valid.");
      
      Cookies.remove('token');
      Cookies.remove('user');
      
      // PERBAIKAN: Hanya paksa redirect ke /login JIKA user TIDAK sedang berada di Beranda (/)
      if (typeof window !== 'undefined' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;