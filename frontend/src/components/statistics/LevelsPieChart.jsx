import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Цвета для каждого уровня
const COLORS = {
    'Intern': '#94a3b8',    // Серый
    'Junior': '#3b82f6',    // Синий
    'Middle': '#10b981',    // Зеленый
    'Senior': '#f59e0b',    // Оранжевый
    'Lead': '#8b5cf6',      // Фиолетовый
};

function LevelsPieChart({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className="text-center text-gray-500 p-8">
                Нет данных для отображения
            </div>
        );
    }
    
    // Вычисляем общее количество для процентов
    const total = data.reduce((sum, item) => sum + item.count, 0);
    
    return (
        <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
                🎯 Распределение по уровням
            </h2>
            
            <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="count"
                        nameKey="level"
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        label={({ level, count }) => {
                            const percent = ((count / total) * 100).toFixed(1);
                            return `${level} (${percent}%)`;
                        }}
                        labelLine={true}
                    >
                        {data.map((entry) => (
                            <Cell 
                                key={entry.level} 
                                fill={COLORS[entry.level] || '#64748b'} 
                            />
                        ))}
                    </Pie>
                    
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: '#fff',
                            border: '1px solid #ccc',
                            borderRadius: '8px'
                        }}
                        formatter={(value, name) => {
                            const percent = ((value / total) * 100).toFixed(1);
                            return [`${value} вакансий (${percent}%)`, name];
                        }}
                    />
                    
                    <Legend 
                        verticalAlign="bottom" 
                        height={36}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

export default LevelsPieChart;