function VacancyCard({ vacancy }) {
    // Функция форматирования даты
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
    
    return (
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200 hover:shadow-lg transition">
            {/* Контейнер с заголовком и бейджем */}
            <div className="flex items-start justify-between gap-4 mb-2">
                {/* Заголовок */}
                <h3 className="text-xl font-bold text-gray-800 flex-1">
                    {vacancy.title}
                </h3>
                
                {/* Бейдж справа */}
                {vacancy.republish_count === 0 ? (
                    <span className="
                        px-2 py-1
                        rounded-full 
                        text-xs font-bold uppercase tracking-wider
                        bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-600 
                        text-amber-900 
                        shadow-sm
                        whitespace-nowrap
                        flex-shrink-0
                    ">
                        NEW ✨
                    </span>
                ) : vacancy.republish_count >= 2 ? (
                    <span className="
                        px-2 py-1
                        rounded-full 
                        text-xs font-semibold
                        bg-gray-200 
                        text-gray-600
                        whitespace-nowrap
                        flex-shrink-0
                    ">
                        ♻️ OLD
                    </span>
                ) : null}
            </div>
            
            <p className="text-lg text-gray-600 mb-3">
                {vacancy.company}
            </p>
            
            <div className="space-y-1 mb-4">
                <p className="text-sm text-gray-500">
                    📅 {formatDate(vacancy.published_date)}
                </p>
                <p className="text-sm text-gray-500">
                    🎯 Уровень: {vacancy.level}
                </p>
                <p className="text-sm text-gray-500">
                    💰 Зарплата: {vacancy.salary}
                </p>
            </div>
            
            <a 
                href={vacancy.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
                Подробнее →
            </a>
        </div>
    );
}

export default VacancyCard;
