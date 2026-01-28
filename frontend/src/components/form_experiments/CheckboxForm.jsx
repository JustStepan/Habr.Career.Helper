import { useState } from 'react';

function CheckboxForm() {
    const [agreed, setAgreed] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    function handleSubmit(e) {
        e.preventDefault();
        setSubmitted(true);
    }

    function refresh() {
        setAgreed(false)
        setSubmitted(false)
    }

    return (
        <div className="max-w-2xl mx-auto p-8">
            <h4 className="font-bold tracking-tight text-slate-400 text-2xl mb-4">
                {/* text-2xl = размер 24px, mb-4 = отступ снизу */}
                Тестируем checkbox
            </h4>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* space-y-4 = вертикальные отступы между элементами */}
                
                <label className="flex items-center gap-2">
                    {/* flex = расположить в ряд, items-center = выровнять по вертикали, gap-2 = отступ между элементами */}
                    <input 
                        type="checkbox" 
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        className="w-4 h-4"
                        // w-4 = ширина 16px, h-4 = высота 16px
                    />
                    <span>Я согласен парсить данные</span>
                </label>
                
                <button 
                    type="submit"
                    disabled={!agreed}
                    className="px-6 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                    // disabled:bg-gray-300 = серый фон если кнопка disabled
                >
                    Отправить
                </button>
                <button
                type="button" // Важно! поскольку кнопка в форме указывать "button" тип необходимо. 
                    onClick={refresh}
                    className="px-6 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                    // disabled:bg-gray-300 = серый фон если кнопка disabled
                >
                    Сбросить
                </button>
                
                {submitted ? (
                    <div className="mt-4 p-4 bg-green-50 border rounded">
                        {/* mt-4 = отступ сверху, p-4 = отступ внутри, bg-green-50 = светло-зеленый фон */}
                        <p className="text-gray-700">
                            ✅ Спасибо, что согласились!<br/>
                            Тип checkbox: <b className="text-green-700">{typeof agreed}</b> (boolean)
                        </p>
                    </div>) : (
                    <div className="mt-4 p-4 bg-green-50 border rounded">
                        {/* mt-4 = отступ сверху, p-4 = отступ внутри, bg-green-50 = светло-зеленый фон */}
                        <p className="text-gray-700">
                            ℹ️ Пожалуйста, подтвердите согласие<br/>
                            Тип checkbox: <b className="text-green-700">{typeof agreed}</b> (boolean)
                        </p>
                    </div>
                    )
                }
            </form>
        </div>
    );
}

export default CheckboxForm;