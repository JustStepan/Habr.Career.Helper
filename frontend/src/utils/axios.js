import axios from 'axios';

// Базовый URL для всех запросов
const axiosInstance = axios.create({
    baseURL: '/habr-vacancies/api'  // ← Теперь можно писать '/api/auth/me' вместо 'http://localhost:8000/api/auth/me'
});

// REQUEST INTERCEPTOR (добавляем токен)
axiosInstance.interceptors.request.use(
    config => {
        const token = localStorage.getItem('access_token');

        // Проверяем что токен существует и не является строкой "undefined" или "null"
        if (token && token !== 'undefined' && token !== 'null') {
            // Инициализируем headers если его нет
            if (!config.headers) {
                config.headers = {};
            }
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// RESPONSE INTERCEPTOR (обработка ошибок)
axiosInstance.interceptors.response.use(
    response => {
        // Успешный ответ — просто возвращаем
        return response;
    },
    error => {
        // Обработка ошибки 401 (токен истёк или невалиден)
        if (error.response?.status === 401) {
            localStorage.removeItem('access_token');
            window.location.href = '/login';
        }
        
        return Promise.reject(error);
    }
);

export default axiosInstance;