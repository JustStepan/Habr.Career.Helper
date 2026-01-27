import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import RegForm from '@/components/RegForm/RegForm';

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
            const response = await axios.post('http://localhost:8000/api/auth/register', requestData);
            
            setNewUser(response.data);
            setLoading(false);
            setShowMessage(true);
            await new Promise(resolve => setTimeout(resolve, 3000));
            // await setTimeout(() => {
            //     setShowMessage(false);
            // }, 3000);

            navigate('/login');
        } catch (error) {
            setError(error.message);
            console.error('Ошибка', error);
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