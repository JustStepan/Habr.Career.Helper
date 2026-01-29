// App.jsx
import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import axiosInstance from '@/utils/axios';

function App() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);  // ← Данные пользователя
    const [loading, setLoading] = useState(true);  // ← Индикатор загрузки

    // Загружаем данные пользователя при монтировании компонента
    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const response = await axiosInstance.get('/api/auth/me');
                setUser(response.data);  // { id, email, username }
            } catch (error) {
                console.error('Ошибка загрузки пользователя:', error);
                // Если токен невалиден — interceptor сам редиректнет на /login
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);  // ← Пустой массив = выполнить один раз при монтировании

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        setUser(null);  // ← Очистить данные пользователя
        navigate('/login');
    };

    // Показываем индикатор загрузки
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-xl">Загрузка...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <nav className="bg-gray-800 p-4 flex justify-between">
                {/* Левая часть */}
                <div className="flex gap-6 items-center">
                    <NavLink to="/" className={({ isActive }) => 
                        isActive ? "border-b border-red-300 text-blue-400 font-bold" : "text-white hover:text-blue-400"
                    }>
                        Главная
                    </NavLink>
                    <NavLink to="/parser" className={({ isActive }) => 
                        isActive ? "border-b border-red-300 text-blue-400 font-bold" : "text-white hover:text-blue-400"
                    }>
                        Парсить вакансии
                    </NavLink>
                    <NavLink to="/search" className={({ isActive }) => 
                        isActive ? "border-b border-red-300 text-blue-400 font-bold" : "text-white hover:text-blue-400"
                    }>
                        Подобрать вакансии (Habr)
                    </NavLink>
                </div>

                {/* Правая часть */}
                <div className="flex gap-6 items-center">
                    {user ? (
                        <>
                            <span className="text-white">
                                👋 Привет, {user.username}!  {/* ← Показываем имя */}
                            </span>
                            <NavLink to="/favorites" className={({ isActive }) => 
                                isActive ? "border-b border-red-300 text-blue-400 font-bold" : "text-white hover:text-blue-400"
                            }>
                                ⭐ Избранное
                            </NavLink>
                            <NavLink to="/profile" className={({ isActive }) => 
                                isActive ? "border-b border-red-300 text-blue-400 font-bold" : "text-white hover:text-blue-400"
                            }>
                                👤 Профиль
                            </NavLink>
                            <button 
                                onClick={handleLogout}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                Выйти
                            </button>
                        </>
                    ) : (
                        <>
                            <NavLink to="/login" className="text-white hover:text-blue-400">
                                Вход
                            </NavLink>
                            <NavLink to="/register" className="text-white hover:text-blue-400">
                                Регистрация
                            </NavLink>
                        </>
                    )}
                </div>
            </nav>
            
            <main className="flex-1">
                <Outlet />
            </main>
            
            <footer className="bg-gray-100 p-4 text-center">
                <p className="text-gray-600">© 2025 Habr Career Parser</p>
            </footer>
        </div>
    );
}

export default App;