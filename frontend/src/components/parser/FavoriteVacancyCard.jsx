import { useState } from "react";



function FavoriteVacancyCard({ vacancy, DeleteVacancy}) {
    
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
    

    async function HandleDeleteVacancy() {
        console.log(`Передали id = ${vacancy.id} на удаление выше а VacancyList`)
        DeleteVacancy(vacancy.id);
    }


    return (
        <div className="flex flex-col gap-4 bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-xl p-6 m-4">
            {/* Заголовок с акцентом */}
            <div className="border-b border-gray-50 pb-4">
                <h1 className="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors cursor-pointer">
                    {vacancy.title}
                </h1>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                
                {/* Левая колонка: Мета-данные */}
                <div className="flex flex-col gap-3 min-w-[200px] bg-gray-50/50 p-4 rounded-lg"> 
                    <div className="flex items-center gap-2 text-gray-600">
                        <span className="text-lg">📅</span>
                        <span className="text-sm font-medium">{formatDate(vacancy.published_date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                        <span className="text-lg">🎯</span>
                        <span className="text-sm">Уровень: <span className="font-semibold text-gray-800">{vacancy.level}</span></span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1 rounded-full w-fit">
                        <span className="text-sm font-bold tracking-wide">{vacancy.salary}</span>
                    </div>
                </div>

                {/* Средняя колонка: Контент */}
                <div className="flex-1 space-y-4">
                    <div>
                        <label className="text-xs font-bold uppercase text-gray-400 tracking-wider">Описание</label>
                        <div className="mt-1 text-sm text-gray-600 leading-relaxed bg-gray-50 border border-gray-100 rounded-lg p-3">
                            Здесь будет описание вакансии, которое теперь приятно читать.
                        </div>
                    </div>
                    
                    <div>
                        <label className="text-xs font-bold uppercase text-gray-400 tracking-wider text-blue-500">Мои заметки</label>
                        <div className="mt-1 text-sm text-blue-900/80 italic bg-blue-50/30 border border-blue-100 rounded-lg p-3">
                            Здесь мои личные мысли по поводу этой позиции...
                        </div>
                    </div>
                </div>

                {/* Правая колонка: Действия */}
                <div className="flex flex-row lg:flex-col gap-2 justify-end lg:justify-start border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-6">
                    <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
                        Редактировать
                    </button>
                    <button 
                        className="flex-1 px-4 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium rounded-lg transition-colors"
                        type="button"
                        onClick={() => HandleDeleteVacancy()}
                    >
                        Удалить
                    </button>
                </div>

            </div>
        </div>
    );
}

export default FavoriteVacancyCard;
