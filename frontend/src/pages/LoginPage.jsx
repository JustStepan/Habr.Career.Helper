import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '@/utils/axios';
import LoginForm from '@/components/AuthForm/LoginForm';
import { delay } from '@/utils/helpers';


function UserLogin() {
    const navigate = useNavigate();
    
    const [error, setError] = useState(null);
    const [showMessage, setShowMessage] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (email, password) => {
        setError(null);
        setLoading(true);

        try {
            const requestData = {
                email: email,
                password: password
            };
            
            console.log('Payload для бэкенда:', requestData);
            const response = await axiosInstance.post('api/auth/login', requestData);

            // Сохраняем токен (с проверкой)
            if (response.data?.access_token) {
                localStorage.setItem('access_token', response.data.access_token);
            } else {
                throw new Error('Токен не получен от сервера');
            }

            setShowMessage(true);
            await delay(3000);
            navigate('/');

        } catch (error) {
            if (error.response?.status === 401) {
                setError('Неверные учётные данные');
            } else {
                setError(error.response?.data?.detail || error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-8">
            <LoginForm onLogin={handleLogin}/>
            <hr className="my-8" />
            {loading && <p className="text-m text-center">Проверка данных...</p>}
            {error && <p className="text-red-600 text-m text-center">Ошибка: {error}</p>}
            {showMessage && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h2 className="text-green-700 font-bold mb-2">Авторизация успешна. Перенаправляем на главную страницу!</h2>
                </div>)}
        </div>
    );
}

export default UserLogin;