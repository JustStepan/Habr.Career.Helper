import { useState, useEffect } from 'react';
import axiosInstance from '@/utils/axios';

function ProfilePage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const response = await axiosInstance.get('/api/auth/me');
                setUser(response.data);
            } catch (error) {
                console.error('Ошибка загрузки профиля:', error);
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    if (loading) {
        return <div className="p-8">Загрузка...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-8">
            <h1 className="text-3xl font-bold mb-4">Профиль</h1>
            <div className="bg-white shadow rounded-lg p-6">
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Username:</strong> {user.username}</p>
            </div>
        </div>
    );
}

export default ProfilePage;