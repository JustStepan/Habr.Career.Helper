import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '@/utils/axios';
import VacancyDetail from '@/components/VacancyDetail';

function VacancyDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [vacancy, setVacancy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        loadVacancy();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const loadVacancy = async () => {
        setLoading(true);
        setError(null);

        try {
            // Сначала пробуем загрузить как избранную вакансию
            const token = localStorage.getItem('access_token');

            if (token) {
                try {
                    const favoriteResponse = await axiosInstance.get(`/favorite/${id}`);
                    setVacancy(favoriteResponse.data);
                    setIsFavorite(true);
                    setLoading(false);
                    return;
                } catch (favError) {
                    // Если не найдено в избранном, продолжаем загружать обычную вакансию
                    console.log('Не найдено в избранном, загружаем обычную вакансию');
                }
            }

            // Загружаем обычную вакансию
            const response = await axiosInstance.get(`/vacancies/${id}`);
            setVacancy(response.data);
            setIsFavorite(false);
        } catch (error) {
            setError(error.response?.data?.detail || error.message || 'Ошибка загрузки вакансии');
            console.error('Ошибка загрузки вакансии:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNotesUpdate = async (vacancyId, newNotes) => {
        try {
            await axiosInstance.patch(`/favorite/${vacancyId}`, {
                user_notes: newNotes
            });

            // Обновляем локальное состояние
            setVacancy(prev => ({
                ...prev,
                user_notes: newNotes
            }));
        } catch (error) {
            console.error('Ошибка обновления заметок:', error);
            throw error;
        }
    };

    const handleAddToFavorites = async () => {
        try {
            await axiosInstance.post('/favorite', { favorite_id: vacancy.id });
            setIsFavorite(true);
            // Перезагружаем данные, чтобы получить версию с полями избранного
            loadVacancy();
        } catch (error) {
            console.error('Ошибка добавления в избранное:', error);
        }
    };

    const handleRemoveFromFavorites = async () => {
        try {
            await axiosInstance.delete(`/favorite/${vacancy.id}`);
            setIsFavorite(false);
            // Перезагружаем как обычную вакансию
            loadVacancy();
        } catch (error) {
            console.error('Ошибка удаления из избранного:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-xl text-gray-600">Загрузка вакансии...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto p-8">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                    <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <h2 className="text-2xl font-bold text-red-800 mb-2">Ошибка</h2>
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                    >
                        Вернуться назад
                    </button>
                </div>
            </div>
        );
    }

    if (!vacancy) {
        return (
            <div className="max-w-4xl mx-auto p-8">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
                    <p className="text-xl text-gray-600">Вакансия не найдена</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-4 px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
                    >
                        Вернуться назад
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Хедер с кнопкой назад и действиями */}
            <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                            </svg>
                            <span className="font-medium">Назад</span>
                        </button>

                        <div className="flex items-center gap-3">
                            {localStorage.getItem('access_token') && (
                                isFavorite ? (
                                    <button
                                        onClick={handleRemoveFromFavorites}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition font-medium"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                        </svg>
                                        В избранном
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleAddToFavorites}
                                        className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition font-medium"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                                        </svg>
                                        Добавить в избранное
                                    </button>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Основной контент */}
            <VacancyDetail
                vacancy={vacancy}
                onNotesUpdate={handleNotesUpdate}
                showEditButton={isFavorite}
            />
        </div>
    );
}

export default VacancyDetailPage;
