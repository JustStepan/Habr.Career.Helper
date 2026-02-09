import { useNavigate } from 'react-router-dom';

function FavoriteVacancyCard({ vacancy, DeleteVacancy}) {
    
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
    
    const handleVacancyClick = () => {
        const route = `/favorite/${vacancy.id}`;
        navigate(route, { 
            state: { vacancy }
        });
    };

    async function HandleDeleteVacancy() {
        console.log(`Передали id = ${vacancy.id} на удаление выше а VacancyList`)
        DeleteVacancy(vacancy.id);
    }


    return (
        <div className="grid grid-cols-12 gap-6 bg-blue-50/20 border border-blue-100 rounded-2xl p-6 transition-all hover:shadow-md hover:border-blue-200">
            
            <div className="col-span-12 border-b border-blue-100/50 pb-3">
                <h3 className="text-xl font-extrabold text-blue-900 tracking-tight">
                    {vacancy.title}
                </h3>
            </div>

            <div className="col-span-3 flex flex-col gap-3 border-r border-blue-100/50 pr-4">
                <div className="flex items-center gap-2 text-blue-800/70">
                    <span className="text-sm">📅</span>
                    <span className="text-xs font-semibold">{formatDate(vacancy.published_date)}</span>
                </div>
                <div className="flex items-center gap-2 text-blue-800/70">
                    <span className="text-sm">🎯</span>
                    <span className="text-xs font-semibold">{vacancy.level}</span>
                </div>
                <div className="mt-auto">
                    <span className="inline-block px-3 py-1 bg-blue-500 text-white rounded-lg text-xs font-black tracking-wider">
                        {vacancy.salary}
                    </span>
                </div>
            </div>

            <div className="col-span-7 flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase text-blue-400 tracking-widest flex items-center gap-1">
                    <span className="text-base">📝</span> Мои заметки
                </label>
                <div className={`
                    flex-1 text-sm border border-blue-100/50 rounded-xl p-4 leading-relaxed shadow-sm
                    ${vacancy.user_notes
                        ? 'font-bold text-blue-900/70'
                        : 'italic text-blue-900/70 bg-white/50'}
                        `}>
                    {vacancy.user_notes || 'Здесь мои будут мои заметки по вакансии...'}
                </div>
            </div>
            <div className="col-span-2 flex flex-col justify-center gap-2">
                <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-sm shadow-blue-200">
                    Изменить
                </button>
                <button 
                    onClick={() => HandleDeleteVacancy()}
                    className="w-full py-2.5 bg-transparent text-slate-400 hover:text-red-500 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-colors"
                >
                    Удалить
                </button>
                <button 
                    onClick={(e) => {
                        handleVacancyClick();
                    }}
                    className="w-full py-2.5 bg-transparent text-slate-400 hover:text-green-500 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-colors"
                >
                    Детали
                </button>
            </div>
        </div>
    );
}

export default FavoriteVacancyCard;
