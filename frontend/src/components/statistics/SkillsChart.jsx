import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function SkillsChart({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className="text-center text-gray-500 p-8">
                Нет данных для отображения
            </div>
        );
    }
    
    return (
        <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
                🔥 Топ-20 навыков
            </h2>
            
            <ResponsiveContainer width="100%" height={400}>
                <BarChart 
                    data={data}
                    layout="vertical"  // Горизонтальные столбцы
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    
                    <XAxis type="number" />
                    <YAxis 
                        type="category" 
                        dataKey="name"
                        width={90}  // Ширина для длинных названий
                    />
                    
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: '#fff',
                            border: '1px solid #ccc',
                            borderRadius: '8px'
                        }}
                    />
                    
                    <Bar 
                        dataKey="count" 
                        fill="#3b82f6"  // Синий цвет
                        radius={[0, 8, 8, 0]}  // Скругленные края справа
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

export default SkillsChart;