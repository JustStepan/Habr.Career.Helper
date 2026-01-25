import VacancyCard from './VacancyCard';

function VacancyList({ vacancies }) {
    if (vacancies.length === 0) {
        return (
            <div className="text-center p-8">
                {/* text-center = текст по центру, p-8 = отступ внутри */}
                <p className="text-gray-500 text-lg">
                    {/* text-gray-500 = серый, text-lg = размер 18px */}
                    Вакансии не найдены. Попробуйте изменить параметры поиска.
                </p>
            </div>
        );
    }
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* grid = сетка */}
            {/* grid-cols-1 = одна колонка по умолчанию */}
            {/* md:grid-cols-2 = две колонки на средних экранах */}
            {/* gap-6 = отступ между карточками */}
            
            {vacancies.map((vacancy, index) => (
                <VacancyCard key={index} vacancy={vacancy} />
            ))}
        </div>
    );
}

export default VacancyList;