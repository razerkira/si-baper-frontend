import axios from 'axios';
import Cookies from 'js-cookie';

// Buat instance axios dengan baseURL backend Go kita
const api = axios.create({
  baseURL: 'http://187.77.113.89:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor Request: Berjalan setiap kali frontend akan mengirim data ke backend
api.interceptors.request.use(
  (config) => {
    // Ambil token dari cookie browser
    const token = Cookies.get('token'); 
    
    // --- LOG DEBUGGING UNTUK KONSOL BROWSER ---
    console.log(`[API Request] Mengirim ke: ${config.url}`);
    if (token) {
      console.log(`[API Request] Token ditemukan: ${token.substring(0, 15)}... (disembunyikan sebagian)`);
      // Sisipkan token ke header Authorization
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("[API Request] PERINGATAN: Token KOSONG di Cookies!");
    }
    // ------------------------------------------

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor Response: Berjalan setiap kali frontend menerima balasan dari backend
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Jika backend menolak dengan status 401 (Unauthorized)
    if (error.response && error.response.status === 401) {
      console.error("[API Response] Akses ditolak (401). Sesi berakhir atau token tidak valid.");
      
      // Hapus data sesi yang usang
      Cookies.remove('token');
      Cookies.remove('user');
      
      // Tendang kembali ke halaman login (hanya jika berjalan di browser)
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;