import { useState } from 'react';
import SkillsAutocomplete from '@/components/search/SkillsAutocomplete';

function SearchVacanciesDBForm({ onSearchDB }) {
    const [level, setLevel] = useState('Младший (Junior)');
    const [skills, setSkills] = useState('');
    const [date, setDate] = useState('');

    function handleSubmit(e) {
        e.preventDefault();
        onSearchDB(level, skills, date);
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-6 rounded-lg shadow mb-8">
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
                        <option value="Стажёр (Intern)">Стажёр</option>
                        <option value="Младший (Junior)">Новичок</option>
                        <option value="Средний (Middle)">Середняк</option>
                        <option value="Старший (Senior)">Профи</option>
                        <option value="Ведущий (Lead)">Лидер</option>
                        <option value="Квалификация не указана">Квалификация не указана</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Навыки (начните вводить текст)
                    </label>
                    <SkillsAutocomplete 
                        value={skills}
                        onChange={setSkills}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Дата публикации (от)
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
                    className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition"
                >
                    Искать вакансии
                </button>
            </div>
        </form>
    );
}

export default SearchVacanciesDBForm;