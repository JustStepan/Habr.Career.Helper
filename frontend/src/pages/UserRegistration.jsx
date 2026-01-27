import { useState } from 'react';
import axios from 'axios';
import RegForm from '@/components/RegForm/RegForm';

function UserRegistration() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const handleReg = async (username, email, password, passwordRepeat) => {
        setLoading(true);
        setError(null);

        try {
            const requestData = {
                username: username,
                email: email,
                password: password
            };
            
            console.log('Payload для бэкенда:', requestData);
            const response = await axios.post('http://localhost:8000/api/auth/registration', requestData);
            
            console.log('Получены данные с БД');
            setVacancies(response.data);
            setHasSearched(true);
        } catch (error) {
            setError(error.message);
            console.error('Ошибка', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-8">
            <RegForm onRegister={handleReg}/>
            <hr className="my-8" />
        </div>
    );
}

export default UserRegistration;