import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '@/utils/axios';
import RegForm from '@/components/AuthForm/RegForm';
import { delay } from '@/utils/helpers';


function UserRegistration() {
    const navigate = useNavigate();
    
    const [error, setError] = useState(null);
    const [newUser, setNewUser] = useState(null);
    const [showMessage, setShowMessage] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleReg = async (username, email, password) => {
        setError(null);
        setLoading(true);

        try {
            const requestData = {
                username: username,
                email: email,
                password: password
            };
            
            console.log('Payload для бэкенда:', requestData);
            const response = await axiosInstance.post('api/auth/register', requestData);

            // Сохраняем токен
            localStorage.setItem('access_token', response.data.access_token);

            // Получаем данные пользователя
            const userResponse = await axiosInstance.get('api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${response.data.access_token}`
                }
            });

            setNewUser(userResponse.data);  // { id, email, username }
            setShowMessage(true);
            await delay(3000);

            navigate('/');

        } catch (error) {
            if (error.response?.status === 409) {
                setError('Email или username уже заняты');
            } else {
                setError(error.response?.data?.detail || error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-8">
            <RegForm onRegister={handleReg}/>
            <hr className="my-8" />
            {loading && <p className="text-m text-center">Загрузка...</p>}
            {error && <p className="text-red-600 text-m text-center">Ошибка: {error}</p>}
            {showMessage && newUser && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h2 className="text-green-700 font-bold mb-2">Пользователь успешно зарегистрирован!</h2>
                    <p className="text-green-700">ID: {newUser.id}</p>
                    <p className="text-green-700">Имя: {newUser.username}</p>
                    <p className="text-green-700">Email: {newUser.email}</p>
                </div>)}
        </div>
    );
}

export default UserRegistration;