import { useState } from 'react';
import axiosInstance from '@/utils/axios';
import SearchForm from '@/components/parser/SearchForm';
import VacancyList from '@/components/parser/VacancyList';

function ParseVacancies() {
    const [vacancies, setVacancies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);
    
    const handleSearch = async (level, maxPages, searchQuery) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axiosInstance.post('parse', {
                level,
                maxPages,
                searchQuery
            });
            console.log('Получены данные с сайта Хабр');
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
            {/* max-w-6xl = широкий контейнер для списка вакансий, mx-auto = центрировать, p-8 = отступ внутри */}
            
            <h1 className="max-w-md mx-auto text-3xl font-bold text-gray-800 mb-6 text-center">
                {/* max-w-md mx-auto = узкая ширина и центрирование, text-center = текст по центру */}
                Парсинг вакансий с Habr Career
            </h1>

            <SearchForm onSearch={handleSearch} />
            
            {loading && (
                <div className="flex justify-center items-center p-8">
                    <div className="text-lg text-gray-600">
                        ⏳ Загрузка вакансий...
                    </div>
                </div>
            )}
            
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-700">
                        ❌ Ошибка: {error}
                    </p>
                </div>
            )}
            
            {hasSearched && <VacancyList vacancies={vacancies} />}
            {/* ✅ Показываем список только если был хотя бы один запрос */}
        </div>
    );
}

export default ParseVacancies;