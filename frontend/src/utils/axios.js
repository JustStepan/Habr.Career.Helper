import axios from 'axios';

const BASE_URL = import.meta.env.DEV 
    ? 'http://localhost:8000/api'
    : '/habr-vacancies/api';

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 30000, // 30 seconds timeout
});

// REQUEST INTERCEPTOR
axiosInstance.interceptors.request.use(
    config => {
        const token = localStorage.getItem('access_token');

        if (token && token !== 'undefined' && token !== 'null' && token !== '') {
            if (!config.headers) {
                config.headers = {};
            }
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        return config;
    },
    error => Promise.reject(error)
);

// RESPONSE INTERCEPTOR
axiosInstance.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem('access_token');
            // Редирект только если не на странице логина
            if (!window.location.pathname.includes('/login') && 
                !window.location.pathname.includes('/register')) {
                window.location.href = '/habr-vacancies/search';
            }
        }
        
        // Таймаут
        if (error.code === 'ECONNABORTED') {
            console.error('Превышен таймаут запроса');
        }
        
        return Promise.reject(error);
    }
);

export default axiosInstance;
