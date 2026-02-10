import { useState, useEffect } from 'react';
import axiosInstance from '@/utils/axios';
import SkillsChart from '@/components/statistics/SkillsChart';
import LevelsPieChart from '@/components/statistics/LevelsPieChart';
import TimelineChart from '@/components/statistics/TimelineChart';
import CompaniesPieChart from '@/components/statistics/CompaniesPieChart';  // ← Добавь

function StatisticsPage() {
    const [stats, setStats] = useState(null);
    const [skillsData, setSkillsData] = useState([]);
    const [levelsData, setLevelsData] = useState([]);
    const [timelineData, setTimelineData] = useState([]);
    const [companiesData, setCompaniesData] = useState([]);  // ← Добавь
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        loadStats();
    }, []);
    
    const loadStats = async () => {
        setLoading(true);
        setError(null);
        
        try {
            // Загружаем пять endpoint'ов параллельно
            const [overviewRes, skillsRes, levelsRes, timelineRes, companiesRes] = await Promise.all([
                axiosInstance.get('/statistics/overview'),
                axiosInstance.get('/statistics/skills?limit=20'),
                axiosInstance.get('/statistics/levels'),
                axiosInstance.get('/statistics/timeline?days=30'),
                axiosInstance.get('/statistics/companies?limit=10')  // ← Добавь
            ]);
            
            setStats(overviewRes.data);
            setSkillsData(skillsRes.data);
            setLevelsData(levelsRes.data);
            setTimelineData(timelineRes.data);
            setCompaniesData(companiesRes.data);  // ← Добавь
        } catch (err) {
            setError(err.message);
            console.error('Ошибка загрузки статистики:', err);
        } finally {
            setLoading(false);
        }
    };
    
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-xl">Загрузка статистики...</p>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="max-w-4xl mx-auto p-8">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <p className="text-red-600">Ошибка: {error}</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="max-w-6xl mx-auto p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                📊 Статистика вакансий
            </h1>
            
            {/* Карточки с основными метриками */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard 
                    title="Всего вакансий" 
                    value={stats.total_vacancies}
                    icon="📝"
                    color="blue"
                />
                <StatCard 
                    title="Активные" 
                    value={stats.active_vacancies}
                    icon="✅"
                    color="green"
                />
                <StatCard 
                    title="Новые сегодня" 
                    value={stats.new_today}
                    icon="🆕"
                    color="amber"
                />
            </div>
            
            {/* График динамики (на всю ширину) */}
            <div className="mb-8">
                <TimelineChart data={timelineData} />
            </div>
            
            <SkillsChart data={skillsData} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <LevelsPieChart data={levelsData} />
                <CompaniesPieChart data={companiesData} />
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, color = "blue" }) {
    const colorClasses = {
        blue: "bg-blue-50 border-blue-200 text-blue-600",
        green: "bg-green-50 border-green-200 text-green-600",
        amber: "bg-amber-50 border-amber-200 text-amber-600",
    };
    
    return (
        <div className={`${colorClasses[color]} border rounded-xl p-6 shadow-sm`}>
            <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{icon}</span>
                <p className="text-sm font-medium text-gray-600">{title}</p>
            </div>
            <p className="text-4xl font-bold">{value.toLocaleString()}</p>
        </div>
    );
}

export default StatisticsPage;