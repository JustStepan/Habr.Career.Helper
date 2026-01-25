import { useState } from 'react';

function NumberForm() {
    const [age, setAge] = useState('');
    const [displayedText, setDisplayedText] = useState('');

    function handleSubmit(e) {
        e.preventDefault();  // ✅ Предотвращаем перезагрузку
        setDisplayedText(age);  // Копируем текст для отображения
        setAge('');  // Очищаем input (опционально)
    }

    return (
        <div className="max-w-2xl mx-auto p-8">
            <h4 className="font-bold tracking-tight text-slate-400 sm:text-2xl mb-2">Тестируем ввод чисел (age: 0-120)</h4>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-2">
                    <input 
                        type="number" 
                        min="0" 
                        max="120"
                        value={age}
                        onChange={(e) => setAge(Number(e.target.value))}
                        placeholder="Возраст..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                    />
                    <button 
                        type="submit"
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                    >
                        Показать возраст
                    </button>
                </div>
                
                {displayedText && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-gray-700">
                            Число: <b className="text-green-700">{displayedText}</b><br/>
                            Тип: <b className="text-green-700">{typeof displayedText}</b>
                        </p>
                    </div>
                )}
            </form>
        </div>
    );
}

export default NumberForm;