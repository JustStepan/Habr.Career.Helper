import { Link } from 'react-router-dom';

function HomePage() {
    const token = localStorage.getItem('access_token');

    return (
        <div className="max-w-5xl mx-auto p-8">
            {/* Заголовок */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Habr Career Parser
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Агрегатор вакансий с Habr Career. Автоматический сбор, хранение
                    и удобный поиск вакансий для разработчиков.
                </p>
            </div>

            {/* Основные возможности */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {/* Поиск вакансий */}
                <Link
                    to="/search"
                    className="group bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all"
                >
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                            Q
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                Поиск вакансий
                            </h2>
                            <p className="text-gray-600 text-sm">
                                Фильтрация по уровню (Junior, Middle, Senior), навыкам и дате публикации.
                                База обновляется автоматически каждые 2 часа.
                            </p>
                        </div>
                    </div>
                </Link>

                {/* Избранное */}
                <Link
                    to={token ? "/favorites" : "/login"}
                    className="group bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all"
                >
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                            *
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                Избранные вакансии
                            </h2>
                            <p className="text-gray-600 text-sm">
                                Сохраняйте интересные вакансии, добавляйте личные заметки.
                                Вакансии хранятся даже после удаления с Habr.
                            </p>
                            {!token && (
                                <p className="text-xs text-gray-400 mt-2">Требуется авторизация</p>
                            )}
                        </div>
                    </div>
                </Link>

                {/* Детальный просмотр */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                            i
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">
                                Детальный просмотр
                            </h2>
                            <p className="text-gray-600 text-sm">
                                Полное описание вакансии, список требуемых навыков, информация о компании.
                                Быстрый переход на оригинал на Habr Career.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Регистрация */}
                <Link
                    to={token ? "/profile" : "/register"}
                    className="group bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all"
                >
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                            @
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                {token ? "Профиль" : "Регистрация"}
                            </h2>
                            <p className="text-gray-600 text-sm">
                                {token
                                    ? "Управление аккаунтом и настройками."
                                    : "Создайте аккаунт для сохранения вакансий в избранное и добавления заметок."
                                }
                            </p>
                        </div>
                    </div>
                </Link>

                {/* ИИ поиск вакансий */}
                <Link
                    to={token ? "/llm-search" : "/register"}
                    className="group bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all"
                >
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                            LLM
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                {token ? "Подбор вакансий с помощью ИИ" : "Подбор вакансий с помощью ИИ (Необходима регистрация)"}
                            </h2>
                            <p className="text-gray-600 text-sm">
                                {token
                                    ? "Опишите свои навыки, опыт и пожелания к работе. Языковая модель проанализирует базу вакансий и подберет наиболее подходящие предложения."
                                    : "После регистрации вы сможете описать свои навыки и пожелания, а ИИ подберет для вас наиболее подходящие вакансии с объяснением выбора."
                                }
                            </p>
                        </div>
                    </div>
                </Link>

                {/* Статистика */}
                <Link
                    to="/statistics"
                    className="group bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all"
                >
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                            S
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                Статистика вакансий
                            </h2>
                            <p className="text-gray-600 text-sm">
                                Аналитика по вакансиям: распределение по уровням, популярные технологии,
                                тренды языков программирования. Инфографика на основе собранных данных.
                            </p>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Техническая информация */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Как это работает</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                        <p className="font-medium text-gray-800 mb-1">Сбор данных</p>
                        <p>Парсер на Beautiful Soup собирает вакансии с Habr Career каждый час по расписанию.</p>
                    </div>
                    <div>
                        <p className="font-medium text-gray-800 mb-1">Хранение</p>
                        <p>Вакансии сохраняются в PostgreSQL. Автоматическая проверка актуальности ссылок.</p>
                    </div>
                    <div>
                        <p className="font-medium text-gray-800 mb-1">API</p>
                        <p>FastAPI бэкенд с JWT-авторизацией. React фронтенд. Деплой через Docker.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HomePage;
