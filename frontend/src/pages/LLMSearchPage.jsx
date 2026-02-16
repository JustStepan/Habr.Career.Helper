import { useState } from 'react';
import SkillsAutocomplete from '@/components/search/SkillsAutocomplete';
import axiosInstance from '@/utils/axios';

function LLMSearchPage() {
    const [level, setLevel] = useState('Junior');
    const [skills, setSkills] = useState('');
    const [userQuery, setUserQuery] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResults(null);

        const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s !== "");
        
        try {
            const response = await axiosInstance.post('llm-search', {
                level: level,
                skills: skillsArray,
                user_query: userQuery
            });
            setResults(response.data);
        } catch (err) {
            console.error('Ошибка LLM поиска:', err);
            setError(err.response?.data?.detail || 'Произошла ошибка при поиске вакансий');
        } finally {
            setLoading(false);
        }
    };

    const levelOptions = [
        { value: 'Intern', label: 'Стажер' },
        { value: 'Junior', label: 'Junior' },
        { value: 'Middle', label: 'Middle' },
        { value: 'Senior', label: 'Senior' },
        { value: 'Lead', label: 'Lead' },
    ];

    const getMatchColor = (score) => {
        if (score >= 0.8) return 'bg-green-100 text-green-800 border-green-200';
        if (score >= 0.5) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        return 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const VacancyCard = ({ vacancy, isPrimary = false, rank }) => {
        if (!vacancy) return null;
        
        return (
            <div className={`relative bg-white rounded-xl shadow-lg overflow-hidden border-2 ${isPrimary ? 'border-blue-500 ring-4 ring-blue-100' : 'border-gray-200'}`}>
                {isPrimary && (
                    <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 rounded-bl-xl text-sm font-semibold">
                        #1 Рекомендация
                    </div>
                )}
                {!isPrimary && rank && (
                    <div className="absolute top-0 right-0 bg-gray-400 text-white px-4 py-1 rounded-bl-xl text-sm font-semibold">
                        #{rank} Альтернатива
                    </div>
                )}
                
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                                {vacancy.title}
                            </h3>
                            <p className="text-gray-600 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                {vacancy.company}
                            </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getMatchColor(vacancy.match_score)}`}>
                            {Math.round(vacancy.match_score * 100)}% совпадение
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {vacancy.level}
                        </span>
                        {vacancy.salary && vacancy.salary !== 'ЗП не указана' && (
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {vacancy.salary}
                            </span>
                        )}
                    </div>

                    <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-2">Навыки:</p>
                        <div className="flex flex-wrap gap-2">
                            {vacancy.skills?.slice(0, 8).map((skill, idx) => (
                                <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                    {skill}
                                </span>
                            ))}
                            {vacancy.skills?.length > 8 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">
                                    +{vacancy.skills.length - 8} еще
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <a 
                            href={`/habr-vacancies/vacancy/${vacancy.id}`}
                            className="flex-1 text-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium text-sm"
                        >
                            Подробнее
                        </a>
                        <button className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium text-sm flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            В избранное
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const EmptyState = () => (
        <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Начните поиск вакансий
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
                Заполните форму выше, чтобы найти лучшие вакансии с помощью искусственного интеллекта
            </p>
        </div>
    );

    const NoResults = () => (
        <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Вакансии не найдены
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
                Попробуйте изменить параметры поиска или выбрать другой уровень
            </p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">
                        AI Подбор вакансий
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Расскажите о себе, и наш AI подберет вам вакансию мечты!
                    </p>
                </div>

                {/* Search Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Level */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Уровень
                            </label>
                            <select
                                value={level}
                                onChange={(e) => setLevel(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            >
                                {levelOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Skills */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Навыки (через запятую)
                            </label>
                            <SkillsAutocomplete
                                value={skills}
                                onChange={setSkills}
                            />
                        </div>

                        {/* Query */}
                        <div className="md:col-span-3">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                О себе и желаемой работе
                            </label>
                            <textarea
                                value={userQuery}
                                onChange={(e) => setUserQuery(e.target.value)}
                                placeholder="Например: Хочу работать в дружной команде, интересна удаленка, рассматриваю офис в центре Москвы..."
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-6 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-blue-700 transition transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                AI подбирает вакансии...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                Найти лучшие вакансии
                            </>
                        )}
                    </button>
                </form>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 flex items-center gap-3">
                        <svg className="w-6 h-6 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {/* Results */}
                {results && (
                    <div className="space-y-6">
                        {/* Stats */}
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">
                                Найденные вакансии
                            </h2>
                            <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                Всего найдено: {results.total_found}
                            </span>
                        </div>

                        {/* Primary & Secondary */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <VacancyCard 
                                vacancy={results.primary} 
                                isPrimary={true} 
                            />
                            <VacancyCard 
                                vacancy={results.secondary} 
                                rank={2}
                            />
                        </div>

                        {/* No results */}
                        {!results.primary && !results.secondary && <NoResults />}
                    </div>
                )}

                {/* Initial State */}
                {!results && !loading && !error && <EmptyState />}
            </div>
        </div>
    );
}

export default LLMSearchPage;
