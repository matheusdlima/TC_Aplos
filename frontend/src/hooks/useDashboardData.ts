import { useState, useEffect } from 'react';
import { 
    getSalesByRegion, 
    getTopProducts, 
    getSalesByCategory, 
    getTopBuyers,
    getRecentSales,
    type RevenueByRegion,
    type TopProduct,
    type SalesByCategory,
    type TopBuyer,
    type RecentSale
} from '../services/api';

// this interface will group all the data we need for the dashboard in a single object
export interface DashboardState {
    revenueByRegion: RevenueByRegion[];
    topProducts: TopProduct[];
    salesByCategory: SalesByCategory[];
    topBuyers: TopBuyer[];
    recentSales: RecentSale[];
}

export const useDashboardData = () => {
    // ==========================================
    // 1. STATE DEFINITIONS
    // ==========================================
    const [data, setData] = useState<DashboardState | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // ==========================================
    // 2. LIFECYCLE EFFECT (DATA FETCHING)
    // ==========================================
    useEffect(() => {
        // create an async function to fetch all data from the APIs
        const fetchAllData = async () => {
            try {
                setLoading(true); // turn on loading state before starting the fetches

                // run all requests in parallel with Promise.all for better performance
                const [regionData, productsData, categoryData, buyersData, recentSalesData] = await Promise.all([
                    getSalesByRegion(),
                    getTopProducts(),
                    getSalesByCategory(),
                    getTopBuyers(),
                    getRecentSales()
                ]);

                // when all requests succeed, update the state with the new data
                setData({
                    revenueByRegion: regionData,
                    topProducts: productsData,
                    salesByCategory: categoryData,
                    topBuyers: buyersData,
                    recentSales: recentSalesData
                });

                setError(null);

            } catch (err: any) {
                console.error("Error fetching dashboard data:", err);
                setError(err.message || "Failed to load dashboard data. Check if the backend is running");
            } finally {
                // turn off loading state
                setLoading(false);
            }
        };

        fetchAllData();
    }, []); // empty array for the effect to run only once on component mount

    // ==========================================
    // 3. RETURN THE HOOK'S API (DATA, LOADING, ERROR)
    // ==========================================
    return { data, loading, error };
};