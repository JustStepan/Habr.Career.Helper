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
            {/* Для того чтобы ознакомиться с комментарием к стилю мотай ниже */}
            <h3 className="text-xl font-bold text-gray-800 mb-2">
                {vacancy.title}
            </h3>
            
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

// function VacancyCard({ vacancy }) {
//     return (
//         <div className="bg-white p-6 rounded-lg shadow border border-gray-200 hover:shadow-lg transition">
//             {/* bg-white = белый фон, p-6 = отступ внутри, rounded-lg = скругленные углы, shadow = тень, border = граница, hover:shadow-lg = больше тени при наведении */}
            
//             <h3 className="text-xl font-bold text-gray-800 mb-2">
//                 {/* text-xl = размер 20px, font-bold = жирный, mb-2 = отступ снизу */}
//                 {vacancy.title}
//             </h3>
            
//             <p className="text-lg text-gray-600 mb-3">
//                 {/* text-lg = размер 18px, text-gray-600 = серый, mb-3 = отступ снизу */}
//                 {vacancy.company}
//             </p>
            
//             <div className="space-y-1 mb-4">
//                 {/* space-y-1 = небольшие вертикальные отступы, mb-4 = отступ снизу */}
                
//                 <p className="text-sm text-gray-500">
//                     {/* text-sm = маленький размер, text-gray-500 = светло-серый */}
//                     📅 {vacancy.published_date || 'Дата не указана'}
//                 </p>
                
//                 <p className="text-sm text-gray-500">
//                     🎯 Уровень: {vacancy.level}
//                 </p>
                
//                 <p className="text-sm text-gray-500">
//                     💰 Зарплата: {vacancy.salary}
//                 </p>
//             </div>
            
//             <a 
//                 href={vacancy.url} 
//                 target="_blank" 
//                 rel="noopener noreferrer"
//                 className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
//                 {/* inline-block = можно задать отступы, px-4 py-2 = отступы внутри, bg-blue-500 = синий фон, hover:bg-blue-600 = темнее при наведении */}
//             >
//                 Подробнее →
//             </a>
//         </div>
//     );
// }

// export default VacancyCard;