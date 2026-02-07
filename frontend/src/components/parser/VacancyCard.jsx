import { useState } from "react";
import axiosInstance from '@/utils/axios';
import { useNavigate } from 'react-router-dom';


function VacancyCard({ vacancy, favoritesMap }) {
    // Функция форматирования даты
    const token = localStorage.getItem('access_token');
    // сразу находим в списке избранных вакансия или нет, чтобы обобразить правильный статус
    const [isFavorite, setIsFavorite] = useState(() => vacancy.id in (favoritesMap || {}));
    const [favoriteVacId, setFavoriteVacId] = useState(() => favoritesMap?.[vacancy.id] || null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();


    function formatDate(dateString) {
        if (!dateString) return 'Дата не указана';
        
        const date = new Date(dateString);
        
        const options = {
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        return date.toLocaleDateString('ru-RU', options);
    }
    
    const HandleAddToFavorites = async (favorite_id) => {
        setError(null);
        setLoading(true);

        try {
            const response = await axiosInstance.post('favorite', {favorite_id});
            console.log('response --> ', response)
            console.log('ddddd', response.data.id)
            setFavoriteVacId(response.data.id)
            setIsFavorite(true)

        } catch (error) {
            setError(error.message);
            console.error('Ошибка', error);
        } finally {
            setLoading(false);
        }

        console.log('Вакансия добавлена в избранное ID = ', favorite_id);
    }

    const handleVacancyClick = () => {
        // в зависимости от isFavorite формируем маршрут. 
        const route = isFavorite ? `/favorite/${favoriteVacId}` : `/vacancy/${vacancy.id}`;
        navigate(route, { 
            state: { vacancy }
        });
    };


    return (
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200 hover:shadow-lg transition">
            {/* Контейнер с заголовком и бейджем */}
            <div className="flex items-start justify-between gap-4 mb-2">
                {/* Заголовок */}
                <h3 className="text-xl font-bold text-gray-800 flex-1">
                    {vacancy.title}
                </h3>
                
                {/* Бейдж справа */}
                {vacancy.republish_count === 0 ? (
                    <span className="
                        px-2 py-1
                        rounded-full 
                        text-xs font-bold uppercase tracking-wider
                        bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-600 
                        text-amber-900 
                        shadow-sm
                        whitespace-nowrap
                        flex-shrink-0
                    ">
                        NEW ✨
                    </span>
                ) : vacancy.republish_count >= 2 ? (
                    <span className="
                        px-2 py-1
                        rounded-full 
                        text-xs font-semibold
                        bg-gray-200 
                        text-gray-600
                        whitespace-nowrap
                        flex-shrink-0
                    ">
                        ♻️ OLD
                    </span>
                ) : null}
            </div>
            
            <p className="text-lg text-gray-600 mb-3">
                {vacancy.company}
            </p>
            
            <div className="space-y-1 mb-4">
                <p className="text-sm text-gray-500">
                    📅 {formatDate(vacancy.published_date)}
                </p>
                <p className="text-sm text-gray-500">
                    🎯 Уровень: {vacancy.level}
                </p>
                <p className="text-sm text-gray-500">
                    💰 Зарплата: {vacancy.salary}
                </p>
            </div>
            <div className="flex items-start justify-between gap-4 mb-2">
                {!vacancy.is_active 
                ? (<a 
                    href={vacancy.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className=" text-xs font-bold uppercase tracking-wider inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition"
                >
                    На Хабр →
                </a>) : (
                    <p className="text-xs font-bold uppercase tracking-wider inline-block px-4 py-2 bg-gray-500 text-white rounded"
                    >Удалена</p>
                )}
                <div 
                    onClick={handleVacancyClick}  // ← Привязываем обработчик. Все тоже самое делаем для избранных вакансий
                    className="cursor-pointer hover:shadow-lg"
                >
                    <p className=" transition text-xs font-bold uppercase tracking-wider inline-block px-4 py-2 bg-green-500 text-white rounded">
                        Детали →
                    </p>
                </div>
                {token && (isFavorite ? (
                    <p className="text-xs font-bold uppercase tracking-wider inline-block px-4 py-2 bg-gray-500 text-white rounded"
                    >В избранном</p>
                ) : (
                    <button 
                        type="button"
                        onClick={() => HandleAddToFavorites(vacancy.id)}
                        className="text-xs font-bold uppercase tracking-wider inline-block px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700 transition"
                    >
                        В избранное →
                    </button>
                )
                )}

            </div>

        </div>
    );
}

export default VacancyCard;
