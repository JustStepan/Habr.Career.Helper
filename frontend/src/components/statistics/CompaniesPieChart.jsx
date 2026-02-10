import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Цвета для компаний (более разнообразная палитра)
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

function CompaniesPieChart({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className="text-center text-gray-500 p-8">
                Нет данных для отображения
            </div>
        );
    }
    
    // Берем только топ-5
    const top5 = data.slice(0, 5);
    
    // Вычисляем общее количество для процентов
    const total = top5.reduce((sum, item) => sum + item.count, 0);
    
    return (
        <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
                🏢 Топ-5 компаний
            </h2>
            
            <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                    <Pie
                        data={top5}
                        dataKey="count"
                        nameKey="company"
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        label={({ company, count }) => {
                            const percent = ((count / total) * 100).toFixed(1);
                            return `${company} (${percent}%)`;
                        }}
                        labelLine={true}
                    >
                        {top5.map((entry, index) => (
                            <Cell 
                                key={entry.company} 
                                fill={COLORS[index % COLORS.length]} 
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

export default CompaniesPieChart;