import { useState } from 'react';

function DateForm() {
    const [date, setDate] = useState('');
    const [displayedDate, setDisplayedDate] = useState('');

    function handleSubmit(e) {
        e.preventDefault();
        setDisplayedDate(date);
        setDate('');
    }

    function formatDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        const options = {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        };
        
        return date.toLocaleDateString('ru-RU', options);
    }

    return (
        <div className="max-w-md mx-auto p-8">
            <h4 className="font-bold text-slate-400 text-2xl mb-4">
                Тестируем выбор даты
            </h4>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Выберите дату
                    </label>
                    <input 
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                
                <button 
                    type="submit"
                    disabled={!date}
                    className="w-full px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
                >
                    Показать дату
                </button>
                
                {displayedDate && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-gray-700">
                            Выбранная дата: <b className="text-green-700">{formatDate(displayedDate)}</b><br/>
                            Формат для бэкенда: <b className="text-green-700">{displayedDate}</b><br/>
                            Тип: <b className="text-green-700">{typeof displayedDate}</b> (string)
                        </p>
                    </div>
                )}
            </form>
        </div>
    );
}

export default DateForm;