// DetailVacancyPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '@/utils/axios';

function DetailVacancyPage({ type }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [isSaving, setIsSaving] = useState(false);
    const isFavorite = type === 'favorite';
    const [vacancy, setVacancy] = useState(location.state?.vacancy || null);
    const [loading, setLoading] = useState(!vacancy);
    const [error, setError] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editedNotes, setEditedNotes] = useState('');

    useEffect(() => {
        if (!vacancy) {
            loadVacancy();
        } else {
            setEditedNotes(vacancy.user_notes || '');
        }
    }, [id]);

    const loadVacancy = async () => {
        setLoading(true);
        setError(null);

        try {
            const endpoint = isFavorite ? `/favorites/${id}` : `/vacancies/${id}`;
            const response = await axiosInstance.get(endpoint);
            setVacancy(response.data);
            setEditedNotes(response.data.user_notes || '');
        } catch (error) {
            setError(error.response?.data?.detail || 'Ошибка загрузки');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveNotes = async () => {
        setIsSaving(true);  // ← Показываем "Сохранение..."
        console.log('editedNotes', editedNotes)
        
        try {
            const response = await axiosInstance.patch(`/favorite/${id}`, {
                user_notes: editedNotes
            });
            console.log('Ответ от сервера при сохранении заметок:', response);
            setVacancy(response.data);
            setIsEditModalOpen(false);
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            alert('Не удалось сохранить заметки');  // ← Уведомление об ошибке
        } finally {
            setIsSaving(false);  // ← Скрываем индикатор
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Удалить из избранного?')) return;
        
        try {
            await axiosInstance.delete(`/favorites/${id}`);
            navigate('/favorites');  // Вернуться к списку избранного
        } catch (error) {
            console.error('Ошибка удаления:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-xl">Загрузка...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto p-8">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <p className="text-red-600">{error}</p>
                    <button 
                        onClick={() => navigate(-1)}
                        className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg"
                    >
                        Назад
                    </button>
                </div>
            </div>
        );
    }

    if (!vacancy) return null;

    // Форматирование даты
    const formatDate = (dateString) => {
        if (!dateString) return 'Дата не указана';
        return new Date(dateString).toLocaleDateString('ru-RU', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    // Бейдж в зависимости от republish_count
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
                    ♻️ OLD
                </span>
            );
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Хедер с кнопкой назад */}
            <div className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                        </svg>
                        Назад
                    </button>

                    {/* Действия только для избранного */}
                    {isFavorite && (
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg"
                            >
                                Редактировать заметки
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                            >
                                Удалить
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Основной контент */}
            <div className="max-w-5xl mx-auto p-8">
                <div className="bg-white rounded-xl shadow-lg p-8">
                    {/* Заголовок с бейджем */}
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                {vacancy.title}
                            </h1>
                            <p className="text-gray-400 text-sm">
                                {formatDate(vacancy.published_date)}
                            </p>
                        </div>
                        {getRepublishBadge()}
                    </div>

                    {/* Свойства */}
                    <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
                        <div>
                            <span className="font-semibold text-gray-700">Уровень:</span>
                            <span className="ml-2 text-gray-600">{vacancy.level}</span>
                        </div>
                        <div>
                            <span className="font-semibold text-gray-700">Компания:</span>
                            <span className="ml-2 text-gray-600">{vacancy.company}</span>
                        </div>
                        <div>
                            <span className="font-semibold text-gray-700">Зарплата:</span>
                            <span className="ml-2 text-gray-600">{vacancy.salary}</span>
                        </div>
                        {isFavorite && vacancy.original_vacancy_id && (
                            <div>
                                <a
                                    href={`/vacancy/${vacancy.original_vacancy_id}`}
                                    className="text-blue-600 hover:underline"
                                >
                                    → Оригинальная вакансия
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Кнопка на Habr */}
                    {vacancy.url && (
                        <a
                            href={vacancy.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mb-6 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                        >
                            Открыть на Habr →
                        </a>
                    )}
                    {/* Навыки */}
                    {vacancy.skills && vacancy.skills.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                                Ключевые навыки
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {vacancy.skills.map((skill, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                                    >
                                        {typeof skill === 'string' ? skill : skill.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Заметки (только для избранного) */}
                    {isFavorite && vacancy.user_notes && (
                        <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                            <h3 className="font-bold text-lg text-yellow-800 mb-2">
                                Мои заметки
                            </h3>
                            <p className="text-yellow-900 whitespace-pre-wrap">
                                {vacancy.user_notes}
                            </p>
                        </div>
                    )}

                    {/* Описание */}
                    <div className="border-t pt-8">
                        <h3 className="text-xl font-semibold mb-4">Описание</h3>
                        <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 p-6 rounded-lg">
                            {vacancy.description}
                        </div>
                    </div>
                </div>
            </div>

            {/* Модальное окно редактирования заметок */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
                        <div className="p-6 border-b">
                            <h2 className="text-2xl font-bold">Редактировать заметки</h2>
                        </div>
                        <div className="p-6">
                            <textarea
                                value={editedNotes}
                                onChange={(e) => setEditedNotes(e.target.value)}
                                placeholder="Добавьте свои заметки..."
                                className="w-full h-48 p-4 border rounded-lg focus:ring-2 focus:ring-yellow-500"
                            />
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={handleSaveNotes}
                                    disabled={isSaving}
                                    className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white font-semibold rounded-lg"
                                >
                                    {isSaving ? 'Сохранение...' : 'Сохранить'}
                                </button>
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg"
                                >
                                    Отмена
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DetailVacancyPage;