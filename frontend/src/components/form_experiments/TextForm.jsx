import { useState } from 'react';

function TextForm() {
    const [inputText, setInputText] = useState('');
    const [displayedText, setDisplayedText] = useState('');

    function handleSubmit(e) {
        e.preventDefault();  // ✅ Предотвращаем перезагрузку
        setDisplayedText(inputText);  // Копируем текст для отображения
        setInputText('');  // Очищаем input (опционально)
    }

    return (
        <div className="max-w-2xl mx-auto p-8">
            <h4 className="font-bold tracking-tight text-slate-400 sm:text-2xl mb-2">Тестируем ввод текста</h4>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-2">
                    {/* flex = расположить в ряд, gap-2 = отступ между элементами */}
                    <input 
                        type="text"
                        value={inputText} 
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Введите текст..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {/* flex-1 = занять всё доступное место, px-4 = отступ слева и справа, py-2 = отступ сверху и снизу, border = граница, rounded = скругленные углы */}
                    <button 
                        type="submit"
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                    >
                        Показать текст
                    </button>
                    {/* bg-blue-500 = синий фон, text-white = белый текст, hover:bg-blue-600 = темнее при наведении */}
                </div>
                
                {displayedText && (
                    <div className="mt-4 p-4 bg-green-50 border rounded">
                        {/* mt-4 = отступ сверху, p-4 = отступ внутри, bg-green-50 = светло-зеленый фон */}
                        <p className="text-gray-700">
                            Отображаемый текст: <b className="text-green-700">{displayedText}</b><br/>
                            Тип: <b className="text-green-700">{typeof displayedText}</b>
                        </p>
                    </div>
                )}
            </form>
        </div>
    );
}

export default TextForm;
