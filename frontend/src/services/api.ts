import axios from 'axios';

// ==========================================
// INTERFACES
// ==========================================
export interface RevenueByRegion {
    region: string;
    total_value: number;
}

export interface TopProduct {
    product_id: string;
    product_name: string;
    category: string;
    quantity: number;
}

export interface SalesByCategory {
    category: string;
    total_value: number;
}

export interface TopBuyer {
    customer_id: string;
    name: string;
    age: number;
    region: string;
    total_value: number;
}

export interface RecentSale {
    date: string;
    name: string;
    product_name: string;
    category: string;
    region: string;
    quantity: number;
    total_value: number;
}

// ==========================================
// AXIOS CLIENT CONFIGURATION
// ==========================================
// create an axios instance with the base URL of the backend API and a reasonable timeout
const apiClient = axios.create({
    baseURL: 'http://localhost:3001/api',
    timeout: 5000,
});

// ==========================================
// SERVICE FUNCTIONS (Data fetching)
// ==========================================

export const getSalesByRegion = async (): Promise<RevenueByRegion[]> => {
    const response = await apiClient.get<RevenueByRegion[]>('/sales-by-region');
    return response.data;
};

export const getTopProducts = async (): Promise<TopProduct[]> => {
    const response = await apiClient.get<TopProduct[]>('/top-products');
    return response.data;
};

export const getSalesByCategory = async (): Promise<SalesByCategory[]> => {
    const response = await apiClient.get<SalesByCategory[]>('/sales-by-category');
    return response.data;
};

export const getTopBuyers = async (): Promise<TopBuyer[]> => {
    const response = await apiClient.get<TopBuyer[]>('/top-buyers');
    return response.data;
};

export const getRecentSales = async (): Promise<RecentSale[]> => {
    const response = await apiClient.get<RecentSale[]>('/recent-sales');
    return response.data;
};