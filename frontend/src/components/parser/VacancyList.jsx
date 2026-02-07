import { useState, useEffect } from "react";
import FavoriteVacancyCard from "./FavoriteVacancyCard";
import VacancyCard from "./VacancyCard";
import axiosInstance from '@/utils/axios';

function VacancyList({ vacancies, favoritesMap, CardComponent = VacancyCard }) {

    const [workVacancies, setWorkVacancies] = useState(vacancies);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // Если пропс vacancies изменился извне, обновляем локальный список
    useEffect(() => {
        setWorkVacancies(vacancies);
    }, [vacancies]);

    const CName = CardComponent === FavoriteVacancyCard 
        ? "flex flex-col gap-4" 
        : "grid grid-cols-1 md:grid-cols-2 gap-6";

    async function DeleteVacancy(id) {
        setError(null);
        setLoading(true);

        try {
            const response = await axiosInstance.delete('favorite', { 
                data: { favorite_id: id } 
            });
            
            if (response.data.result) {
                // 3. Фильтруем локальное состояние (компонент перерисуется и карточка исчезнет)
                setWorkVacancies(prev => prev.filter(v => v.id !== id));
            }
        } catch (error) {
            setError(error.message);
            console.error('Ошибка', error);
        } finally {
            setLoading(false);
        }
    }

    if (workVacancies.length === 0) {
        return (
            <div className="text-center p-8 text-gray-500 text-lg">
                Вакансии не найдены.
            </div>
        );
    }

    return (
        <div className={CName}>
            {workVacancies.map((vacancy) => (
                <CardComponent 
                    key={vacancy.id} 
                    vacancy={vacancy} 
                    favoritesMap={favoritesMap} 
                    DeleteVacancy={DeleteVacancy}
                />
            ))}
        </div>
    );
}

export default VacancyList;