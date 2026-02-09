import SearchVacanciesDBForm from '@/components/search/SearchVacanciesDBForm'
import VacancyList from '@/components/parser/VacancyList';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axiosInstance from '@/utils/axios';
import VacancyCard from '@/components/parser/VacancyCard';


function SearchVacancies() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [vacancies, setVacancies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [favoritesMap, setFavoritesMap] = useState({});
    const initialLoadDone = useRef(false);

    // Читаем начальные значения из URL
    const initialLevel = searchParams.get('level') || 'Junior';
    const initialSkills = searchParams.get('skills') || '';
    const initialDate = searchParams.get('date') || '';

    const handleSearch = useCallback(async (level, skills, date) => {
        setLoading(true);
        setError(null);

        // Сохраняем параметры в URL
        const params = new URLSearchParams();
        if (level) params.set('level', level);
        if (skills) params.set('skills', skills);
        if (date) params.set('date', date);
        setSearchParams(params, { replace: true });

        try {
            const requestData = { level };
            if (skills) requestData.skills = skills;
            if (date) requestData.date_limit = date;

            const response = await axiosInstance.post('vacancies', requestData);

            setVacancies(response.data.vacancies);
            setFavoritesMap(response.data.favorites_map || {});
            setHasSearched(true);
        } catch (err) {
            setError(err.response?.data?.detail || err.message);
            console.error('Ошибка:', err);
        } finally {
            setLoading(false);
        }
    }, [setSearchParams]);

    // При загрузке страницы - если есть параметры в URL, выполняем поиск
    useEffect(() => {
        if (!initialLoadDone.current && (searchParams.has('level') || searchParams.has('skills') || searchParams.has('date'))) {
            initialLoadDone.current = true;
            handleSearch(initialLevel, initialSkills, initialDate);
        }
    }, [searchParams, handleSearch, initialLevel, initialSkills, initialDate]);

    return (
        <div className="max-w-6xl mx-auto p-8">
            <h1 className="max-w-md mx-auto text-3xl font-bold text-gray-800 mb-6 text-center">
                Поиск вакансий в БД
            </h1>

            <SearchVacanciesDBForm
                onSearchDB={handleSearch}
                initialLevel={initialLevel}
                initialSkills={initialSkills}
                initialDate={initialDate}
            />

            {loading && (
                <div className="flex justify-center items-center p-8">
                    <div className="text-lg text-gray-600">
                        Загрузка вакансий...
                    </div>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-700">Ошибка: {error}</p>
                </div>
            )}

            {hasSearched && !loading && (
                <VacancyList
                    vacancies={vacancies}
                    favoritesMap={favoritesMap}
                    CardComponent={VacancyCard}
                />
            )}
        </div>
    );
}

export default SearchVacancies;
