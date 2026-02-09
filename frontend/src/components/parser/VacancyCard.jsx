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

    const getRepublishBadge = () => {
        if (vacancy.republish_count === 0) {
            return (
                <span className="px-3 py-1 bg-gradient-to-r from-amber-200 to-amber-600 text-amber-900 text-xs font-bold rounded-full">
                    NEW ✨
                </span>
            );
        } else if (vacancy.republish_count >= 2) {
            return (
                <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs font-semibold rounded-full">
                    OLD ♻️
                </span>
            );
        }
        return null;
    };


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
        <div className="relative h-full min-h-[280px]">
            {/* Вся карточка — это ссылка на Хабр */}
            <a 
                href={vacancy.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`
                    flex flex-col justify-between h-full p-6 rounded-2xl border transition-all duration-300 group
                    ${isFavorite 
                        ? 'bg-slate-50 border-slate-200 saturate-[0.3] opacity-90' 
                        : 'bg-blue-50/30 border-blue-100 hover:bg-blue-100/40 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-900/5'
                    }
                `}
            >
                <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                        <h3 className="text-lg font-extrabold text-blue-900 leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {vacancy.title}
                        </h3>
                        {getRepublishBadge()}
                    </div>
                    <p className="text-sm font-semibold text-blue-700/60 truncate italic">
                        {vacancy.company}
                    </p>
                </div>

                <div className="flex flex-col gap-1.5 py-4 border-y border-blue-100/50 my-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-blue-800/70">
                        <span className="w-4">📅</span> {formatDate(vacancy.published_date)}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-blue-800/70">
                        <span className="w-4">🎯</span> {vacancy.level}
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold text-blue-900">
                        <span className="w-4 text-base">💰</span> {vacancy.salary}
                    </div>
                </div>

                <div className="flex justify-end items-center gap-2 mt-auto">
                    <button 
                        onClick={(e) => {
                            e.preventDefault(); // Чтобы не сработала ссылка на Хабр
                            e.stopPropagation();
                            handleVacancyClick();
                        }}
                        className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all"
                    >
                        Детали
                    </button>

                    {token && (
                        <button 
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                HandleAddToFavorites(vacancy.id);
                            }}
                            className={`
                                px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all shadow-sm
                                ${isFavorite 
                                    ? 'bg-slate-200 text-slate-500' 
                                    : 'bg-white border border-blue-200 text-blue-600 hover:border-blue-600'
                                }
                            `}
                        >
                            {isFavorite ? '❤️ Сохранено' : '🤍 Избранное'}
                        </button>
                    )}
                </div>
            </a>
        </div>
    );
}

export default VacancyCard;
