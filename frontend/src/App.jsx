import { NavLink, Outlet } from 'react-router-dom';

function App() {
    return (
        <div className="min-h-screen flex flex-col">
            {/* min-h-screen = минимальная высота = высота экрана */}
            {/* flex = flexbox контейнер */}
            {/* flex-col = колонка (элементы друг под другом) */}
            
            <nav className="bg-gray-800 p-4 flex gap-6">
                {/* Навигация без изменений */}
                <NavLink 
                    to="/" 
                    className={({ isActive }) => 
                        isActive 
                            ? "text-blue-400 font-bold"
                            : "text-white hover:text-blue-400"
                    }
                >
                    Главная
                </NavLink>
                
                <NavLink 
                    to="/parser" 
                    className={({ isActive }) => 
                        isActive 
                            ? "text-blue-400 font-bold"
                            : "text-white hover:text-blue-400"
                    }
                >
                    Парсить вакансии
                </NavLink>
                
                <NavLink 
                    to="/search" 
                    className={({ isActive }) => 
                        isActive 
                            ? "text-blue-400 font-bold"
                            : "text-white hover:text-blue-400"
                    }
                >
                    Подобрать вакансии
                </NavLink>
                
                <NavLink 
                    to="/experiments" 
                    className={({ isActive }) => 
                        isActive 
                            ? "text-blue-400 font-bold"
                            : "text-white hover:text-blue-400"
                    }
                >
                    Формы ввода
                </NavLink>

                <NavLink 
                    to="/registration" 
                    className={({ isActive }) => 
                        isActive 
                            ? "text-blue-400 font-bold"
                            : "text-white hover:text-blue-400"
                    }
                >
                    👤 Регистрация
                </NavLink>
            </nav>
            
            <main className="flex-1">
                {/* flex-1 = занять всё свободное место */}
                <Outlet />
            </main>
            
            <footer className="bg-gray-100 p-4 text-center">
                {/* bg-gray-100 = светло-серый фон, p-4 = отступ внутри, text-center = текст по центру */}
                <p className="text-gray-600">© 2025 Habr Career Parser</p>
            </footer>
        </div>
    );
}

export default App;