function HomePage() {
    return (
        <div className="max-w-4xl mx-auto p-8">
            {/* max-w-4xl = макс ширина, mx-auto = центрировать, p-8 = отступ внутри */}
            
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
                {/* text-4xl = размер 36px, font-bold = жирный, text-gray-800 = темно-серый, mb-4 = отступ снизу */}
                Habr Career Parser
            </h1>
            
            <p className="text-lg text-gray-600 mb-8">
                {/* text-lg = размер 18px, text-gray-600 = серый, mb-8 = отступ снизу */}
                Инструмент для парсинга и поиска вакансий на Habr Career
            </p>
            
            <div className="grid grid-cols-1 gap-6">
                {/* grid = сетка, grid-cols-1 = одна колонка, gap-6 = отступ между карточками */}
                
                <div className="bg-white p-6 rounded-lg shadow">
                    {/* bg-white = белый фон, p-6 = отступ внутри, rounded-lg = скругленные углы, shadow = тень */}
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        🔍 Парсинг вакансий
                    </h2>
                    <p className="text-gray-600">
                        Спарсите вакансии с Habr Career по заданным параметрам: уровень, количество страниц, ключевые слова
                    </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        🎯 Подбор вакансий
                    </h2>
                    <p className="text-gray-600">
                        Найдите подходящие вакансии из уже спарсенной базы данных
                    </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        🧪 Тестирование форм
                    </h2>
                    <p className="text-gray-600">
                        Экспериментальная страница для тестирования различных форм ввода
                    </p>
                </div>
            </div>
        </div>
    );
}

export default HomePage;