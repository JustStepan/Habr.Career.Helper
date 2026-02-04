import { useState, useEffect } from 'react';
import axiosInstance from '@/utils/axios';
import VacancyList from '@/components/parser/VacancyList';

function FavoritesPage() {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axiosInstance.get('/favorite');
            setFavorites(response.data);
        } catch (error) {
            setError(error.message);
            console.error('Ошибка загрузки избранного:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                Мои избранные вакансии
            </h1>

            {loading && <p>Загрузка...</p>}
            {error && <p className="text-red-700">Ошибка: {error}</p>}
            {!loading && <VacancyList vacancies={favorites} />}
        </div>
    );
}

export default FavoritesPage;