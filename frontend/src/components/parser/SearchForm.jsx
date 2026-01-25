import { useState } from 'react';

function SearchForm({ onSearch }) {
    const [level, setLevel] = useState("junior");
    const [maxPages, setMaxPages] = useState(2);
    const [searchQuery, setSearchQuery] = useState('');
    
    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(level, maxPages, searchQuery);
    };
    
    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-6 rounded-lg shadow mb-8">
            {/* max-w-md = максимальная ширина 448px, mx-auto = центрировать */}
            
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Уровень квалификации
                    </label>
                    <select 
                        value={level} 
                        onChange={(e) => setLevel(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="intern">Стажер</option>
                        <option value="junior">Junior</option>
                        <option value="middle">Middle</option>
                        <option value="senior">Senior</option>
                        <option value="lead">Lead</option>
                        <option value="all">Все квалификации</option>
                    </select>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ключевые слова (необязательно)
                    </label>
                    <input 
                        type="text" 
                        placeholder="Например: Python, React..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Количество страниц (1-10)
                    </label>
                    <input
                        type="number" 
                        min="1" 
                        max="10" 
                        value={maxPages}
                        onChange={(e) => setMaxPages(Number(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                
                <button 
                    type="submit"
                    className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition"
                >
                    Парсить вакансии
                </button>
            </div>
        </form>
    );
}

export default SearchForm;