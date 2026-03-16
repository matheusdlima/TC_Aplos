import React from 'react';
import { useDashboardData } from '../hooks/useDashboardData';
import { RevenueChart } from './RevenueChart';
import { GenericPodium, type PodiumItem } from './GenericPodium';
import { SalesByCategoryChart } from './SalesByCategoryChart';
import { TransactionTable } from './TransactionTable';
import { BusinessInsights } from './BusinessInsights';

export const Dashboard: React.FC = () => {
    // custom hook to fetch data from the backend API
    const { data, loading, error } = useDashboardData();

    // ==========================================
    // STATE 1 - LOADING
    // ==========================================
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <p className="text-xl text-gray-600 animate-pulse">Loading metrics from backend...</p>
            </div>
        );
    }

    // ==========================================
    // STATE 2 - ERROR
    // ==========================================
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded shadow-md max-w-lg">
                    <h2 className="font-bold text-lg mb-2">Connection Failed</h2>
                    <p>{error}</p>
                    <p className="mt-4 text-sm text-red-500">Tip: Is the Node.js server (port 3001) running?</p>
                </div>
            </div>
        );
    }

    // extra typescript protection
    if (!data) return null;

    // converting Top Products to Podium
    const topProductsFormatted: PodiumItem[] = data.topProducts.map(product => ({
        id: product.product_id,
        label: product.product_name,
        value: `${product.quantity} un`,
        tooltip: `Region: ${product.category}`
    }));

    // converting Top Buyers to Podium
    const topBuyersFormatted: PodiumItem[] = data.topBuyers.map(buyer => ({
        id: buyer.customer_id,
        label: buyer.name,
        value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(buyer.total_value),
        tooltip: `Age: ${buyer.age} | Region: ${buyer.region}`
    }));

    // ==========================================
    // STATE 3 - SUCCESS (main rendering)
    // ==========================================
    return (
        <div className="min-h-screen bg-gray-800 p-8 font-sans">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-200">Sales Analytics</h1>
                <p className="text-xl text-gray-200 mt-2">Overview of business performance</p>
            </header>
            
            <BusinessInsights />

            {/* main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* pass data to each component via prop */}
                <RevenueChart data={data.revenueByRegion} />
                <GenericPodium title="Top Products" data={topProductsFormatted} />
                <GenericPodium title="Top Buyers" data={topBuyersFormatted} />
                <SalesByCategoryChart data={data.salesByCategory}/>
            </div>
            <TransactionTable data={data.recentSales} />
        </div>
    );
};