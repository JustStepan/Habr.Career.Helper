import { useState } from 'react';

function SelectForm() {
    const [level, setLevel] = useState("");
    const [displayedText, setDisplayedText] = useState('');

    function handleSubmit(e) {
        e.preventDefault();
        setDisplayedText(level);
        setLevel("");
    }

    return (
        <div className="max-w-2xl mx-auto p-8">
            <h4 className="font-bold tracking-tight text-slate-400 text-2xl mb-4">
                Тестируем форму выбора значений
            </h4>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-2">
                    <select 
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        // flex-1 = занять всё место, focus:ring-2 = синяя рамка при фокусе
                    >
                        <option value="">Выберите квалификацию</option>
                        <option value="intern">Стажёр</option>
                        <option value="junior">Новичок</option>
                        <option value="middle">Середняк</option>
                        <option value="senior">Профи</option>
                        <option value="lead">Лидер</option>
                    </select>

                    <button 
                        type="submit"
                        disabled={!level}
                        // disabled={!level} = кнопка неактивна если ничего не выбрано
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
                    >
                        Показать значение
                    </button>
                </div>
                
                {displayedText && (
                    <div className="mt-4 p-4 bg-green-50 border rounded">
                        <p className="text-gray-700">
                            Выбранное значение: <b className="text-green-700">{displayedText}</b><br/>
                            Тип: <b className="text-green-700">{typeof displayedText}</b>
                        </p>
                    </div>
                )}
            </form>
        </div>
    );
}

export default SelectForm;