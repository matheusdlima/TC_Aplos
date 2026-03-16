import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { type RevenueByRegion } from '../services/api';

interface RevenueChartProps {
    data: RevenueByRegion[];
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
    return (
        <div className="p-6 rounded-xl shadow-sm border bg-[#111827] border-gray-200">
            <h2 className="text-2xl font-bold text-white mb-4">Revenue x Region</h2>

            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />

                        <XAxis
                            dataKey="region"
                            tick={{ fill: '#f9fafb', fontSize: 20 }}
                            axisLine={{ stroke: '#d1d5db' }}
                            tickLine={{ stroke: '#d1d5db' }}
                        />

                        <YAxis
                            tickFormatter={(value) => `R$ ${value / 1000}k`}
                            tick={{ fill: '#f9fafb', fontSize: 18 }}
                            axisLine={{ stroke: '#d1d5db' }}
                            tickLine={{ stroke: '#d1d5db' }}
                            width={80}
                        />

                        <Tooltip
                            formatter={(value) => [formatCurrency(Number(value ?? 0)), 'Revenue']}
                            labelFormatter={(label) => `Region: ${label}`}
                            contentStyle={{
                                backgroundColor: '#111827',
                                border: '1px solid #374151',
                                borderRadius: '12px',
                                color: '#f9fafb'
                            }}
                            labelStyle={{ color: '#f9fafb', fontWeight: 700 }}
                            itemStyle={{ color: '#cbd5e1' }}
                        />

                        <Bar
                            dataKey="total_value"
                            fill="#3b82f6"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
