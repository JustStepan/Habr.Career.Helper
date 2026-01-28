import SearchVacanciesDBForm from '@/components/search/SearchVacanciesDBForm'
import VacancyList from '@/components/parser/VacancyList';
import { useState } from 'react';
import axiosInstance from '@/utils/axios';


function SearchVacancyies() {
    const [vacancies, setVacancies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);
    
    const handleSearch = async (level, skills, date) => {
        setLoading(true);
        setError(null);
        
        console.log('Отправляем:', { level, skills, date });

        try {
            // Формируем объект с правильными именами полей
            const requestData = {
                level: level
            };
            
            if (skills) {
                requestData.skills = skills;
            }
            
            if (date) {
                requestData.date_limit = date;  // ✅ Правильное имя!
            }
            
            console.log('Payload для бэкенда:', requestData);
            
            const response = await axiosInstance.post('api/vacancies', requestData);
            
            console.log('Получены данные с БД');
            setVacancies(response.data);
            setHasSearched(true);
        } catch (error) {
            setError(error.message);
            console.error('Ошибка', error);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="max-w-6xl mx-auto p-8">
            {/* max-w-6xl = широкий контейнер для списка вакансий, mx-auto = центрировать, p-8 = отступ внутри */}
            
            <h1 className="max-w-md mx-auto text-3xl font-bold text-gray-800 mb-6 text-center">
                {/* max-w-md mx-auto = узкая ширина и центрирование, text-center = текст по центру */}
                Поиск вакансий в БД. 
            </h1>

            <SearchVacanciesDBForm onSearchDB={handleSearch} />
            
            {loading && (
                <div className="flex justify-center items-center p-8">
                    <div className="text-lg text-gray-600">
                        ⏳ Загрузка вакансий...
                    </div>
                </div>
            )}
            
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-700">
                        ❌ Ошибка: {error}
                    </p>
                </div>
            )}
            
            {hasSearched && <VacancyList vacancies={vacancies} />}
            {/* ✅ Показываем список только если был хотя бы один запрос */}
        </div>
    );
}


export default SearchVacancyies;


// @app.get("/api/vacancies", response_model=List[VacancyResponse])
// async def get_vacancies(
//     level: Optional[str] = None,
//     skills: Optional[str] = Query(None, description="Через запятую: Python,FastAPI"),
//     date_limit: Optional[datetime] = None,
//     skip: int = 0,
//     limit: int = 10,
//     db: AsyncSession = Depends(get_db)
// ):


// import SearchForm from '@/components/parser/SearchForm';
// import VacancyList from '@/components/parser/VacancyList';


// function ParseVacancies() {
//   const [vacancies, setVacancies] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
  
//   const handleSearch = async (level, maxPages, searchQuery) => {
//     setLoading(true)
//     setError(null)

//     try {
//         const response = await axios.post('http://localhost:8000/api/parse', {
//             level,
//             maxPages,
//             searchQuery
//         });
//         console.log('Получены данные с сайта Хабр')
//         setVacancies(response.data)
//     }   catch (error) {
//         setError(error.message)
//         console.error('Ошибка', error);
//     } finally {
//         setLoading(false);
//     }
//   };
  
//   return (
//     <div className="App">
//       <h1>Habr Career Parser</h1>

//       <SearchForm onSearch={handleSearch}/>
      
//       {/* Отобрази состояние загрузки */}
//       {loading && <p>Загрузка...</p>}
      
//       {/* Отобрази ошибку */}
//       {error && <p style={{ color: 'red' }}>Ошибка: {error}</p>}
      
//       {<VacancyList vacancies={vacancies} />}
//     </div>
//   );
// }

// export default ParseVacancies;