import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function TimelineChart({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className="text-center text-gray-500 p-8">
                Нет данных для отображения
            </div>
        );
    }
    
    // Форматируем дату для отображения (короткий формат)
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('ru-RU', { 
            day: 'numeric', 
            month: 'short' 
        });
    };
    
    return (
        <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
                📈 Динамика публикаций (последние {data.length} дней)
            </h2>
            
            <ResponsiveContainer width="100%" height={300}>
                <LineChart 
                    data={data}
                    margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    
                    <XAxis 
                        dataKey="date"
                        tickFormatter={formatDate}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                    />
                    
                    <YAxis />
                    
                    <Tooltip 
                        labelFormatter={formatDate}
                        contentStyle={{ 
                            backgroundColor: '#fff',
                            border: '1px solid #ccc',
                            borderRadius: '8px'
                        }}
                        formatter={(value) => [`${value} вакансий`, 'Опубликовано']}
                    />
                    
                    <Line 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6', r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

export default TimelineChart;