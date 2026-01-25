import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function SkillsAutocomplete({ value, onChange }) {
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef(null);

    // Закрываем dropdown при клике вне компонента
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounce: запрос к API через 300мс после последнего ввода
    useEffect(() => {
        // Получаем последнее слово из строки (после последней запятой)
        const words = value.split(',');
        const lastWord = words[words.length - 1].trim();
        
        setInputValue(lastWord);

        if (lastWord.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const response = await axios.get(
                    `http://localhost:8000/api/skills/search?query=${lastWord}`
                );
                setSuggestions(response.data);
                setShowSuggestions(response.data.length > 0);
            } catch (error) {
                console.error('Ошибка загрузки навыков:', error);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [value]);

    function handleSelectSkill(skill) {
        // Заменяем последнее слово выбранным навыком
        const words = value.split(',');
        words[words.length - 1] = skill;
        onChange(words.join(', ') + ', ');
        setShowSuggestions(false);
    }

    return (
        <div ref={wrapperRef} className="relative">
            <input 
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Навыки через запятую (опционально)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            {showSuggestions && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {loading ? (
                        <div className="p-3 text-center text-gray-500">
                            Загрузка...
                        </div>
                    ) : (
                        suggestions.map((skill, index) => (
                            <div
                                key={index}
                                onClick={() => handleSelectSkill(skill)}
                                className="px-4 py-2 hover:bg-blue-50 cursor-pointer transition"
                            >
                                {skill}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

export default SkillsAutocomplete;