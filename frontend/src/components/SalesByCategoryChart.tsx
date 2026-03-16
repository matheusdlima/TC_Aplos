import React from 'react';
import { PieChart, Pie, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { type SalesByCategory } from '../services/api';

interface SalesByCategoryChartProps {
    data: SalesByCategory[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#ef4444'];

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export const SalesByCategoryChart: React.FC<SalesByCategoryChartProps> = ({ data }) => {
    const chartData = data.map((item, index) => ({
        ...item,
        fill: COLORS[index % COLORS.length],
    }));

    return (
        <div className="p-6 rounded-xl shadow-sm border border-gray-200 bg-[#111827] flex flex-col">
            <h2 className="text-2xl font-bold text-white mb-4">Sales by Category</h2>

            <div className="h-80 w-full grow">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            dataKey="total_value"
                            nameKey="category"
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={110}
                            paddingAngle={5}
                            stroke="none"
                        />

                        <Tooltip
                            formatter={(value) => [formatCurrency(Number(value ?? 0)), 'Revenue']}
                            contentStyle={{
                                backgroundColor: '#111827',
                                border: '1px solid #374151',
                                borderRadius: '12px',
                                color: '#f9fafb'
                            }}
                            itemStyle={{ color: '#cbd5e1', fontWeight: 600 }}
                        />

                        <Legend
                            verticalAlign="bottom"
                            height={40}
                            iconType="circle"
                            wrapperStyle={{ color: '#cbd5e1', fontSize: '20px' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};