import SearchVacanciesDBForm from '@/components/search/SearchVacanciesDBForm'
import VacancyList from '@/components/parser/VacancyList';
import { useState } from 'react';
import axiosInstance from '@/utils/axios';
import VacancyCard from '@/components/parser/VacancyCard';


function SearchVacancyies() {
    const [vacancies, setVacancies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [favoritesMap, setFavoritesMap] = useState({});
    
    const handleSearch = async (level, skills, date) => {
        setLoading(true);
        setError(null);
        
        console.log('Отправляем:', { level, skills, date });

        try {
            // Формируем объект с правильными именами полей
            const requestData = {
                level: level
            };
            
            if (skills) {
                requestData.skills = skills;
            }
            
            if (date) {
                requestData.date_limit = date;

            }
            
            console.log('Payload для бэкенда:', requestData);
            
            const response = await axiosInstance.post('vacancies', requestData);
            
            console.log('Получены данные с БД');
            console.log(response)
            console.log(response.data)
            setVacancies(response.data.vacancies);
            setFavoritesMap(response.data.favorites_map);
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
                Поиск вакансий в БД. 
            </h1>

            <SearchVacanciesDBForm onSearchDB={handleSearch} />
            
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
            
            {hasSearched && <VacancyList vacancies={vacancies} favoritesMap={favoritesMap} CardComponent={VacancyCard} />}
        </div>
    );
}


export default SearchVacancyies;
