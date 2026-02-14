import { useState } from 'react';
import SkillsAutocomplete from '@/components/search/SkillsAutocomplete';
import axiosInstance from '@/utils/axios';

function LLMSearchPage() {
    const [level, setLevel] = useState('Junior');
    const [skills, setSkills] = useState('');
    const [UserQuery, setUserQuery] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        console.log('Отправляем LLM поиск с данными:', { level, skills, UserQuery });

        const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s !== "");
        
        try {
            const response = await axiosInstance.post('llm-search', {
                level: level,
                skills: skillsArray,
                user_query: UserQuery
            });
            console.log('response', response);
            setResults(response.data);
            console.log('LLM Search результат:', response.data);
        } catch (error) {
            console.error('Ошибка LLM поиска:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">LLM Поиск вакансий</h1>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-8">
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
                            <option value="Intern">Стажер</option>
                            <option value="Junior">Junior</option>
                            <option value="Middle">Middle</option>
                            <option value="Senior">Senior</option>
                            <option value="Lead">Lead</option>
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
                            Описание работы / запрос
                        </label>
                        <textarea
                            value={UserQuery}
                            onChange={(e) => setUserQuery(e.target.value)}
                            placeholder="Опишите желаемую работу или требования..."
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition disabled:bg-blue-300"
                    >
                        {loading ? 'Поиск...' : 'Найти вакансии'}
                    </button>
                </div>
            </form>

            {results && (
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Результаты</h2>
                    <pre className="text-sm overflow-auto">{JSON.stringify(results, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}

export default LLMSearchPage;