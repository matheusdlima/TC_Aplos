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
        tooltip: `Category: ${product.category}`
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
            <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-800 pb-6">
                {/* left side: title and icon */}
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        {/* decorative icon with translucent background */}
                        <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                            <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        
                        {/* gradient title */}
                        <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-blue-300 to-emerald-400 tracking-tight">
                            Sales Analytics
                        </h1>
                    </div>
                    
                    <p className="text-slate-400 mt-2 text-sm md:text-base ml-13">
                        Overview of business performance and key metrics
                    </p>
                </div>

                {/* right side: actions and status */}
                <div className="flex items-center gap-3 self-start md:self-end ml-13 md:ml-0">
                    {/* Badge "Live Data" simulating a system in real time (idea for future implementation) */}
                    <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-400 bg-[#111827] px-3 py-1.5 rounded-full border border-gray-700 shadow-inner">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Live Data
                    </div>
                    
                    {/* Export button (placeholder, idea for future implementation) */}
                    <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-[0_0_15px_rgba(37,99,235,0.2)] hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] border border-blue-500 cursor-pointer">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export Report
                    </button>
                </div>
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