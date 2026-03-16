import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware to allow connections from the React frontend (CORS)
app.use(cors());
app.use(express.json());

// ==========================================
// INTERFACES
// ==========================================
interface RevenueByRegion {
    region: string;
    total_value: number;
}

interface TopProduct {
    product_id: string;
    product_name: string;
    category: string;
    quantity: number;
}

interface SalesByCategory {
    category: string;
    total_value: number;
}

interface TopBuyer {
    customer_id: string;
    name: string;
    age: number;
    region: string;
    total_value: number;
}

interface RecentSale {
    date: string;
    name: string;
    product_name: string;
    category: string;
    region: string;
    quantity: number;
    total_value: number;
}

interface DashboardMetrics {
    revenue_by_region: RevenueByRegion[];
    top_selling_products: TopProduct[];
    sales_by_category: SalesByCategory[];
    top_buyers: TopBuyer[];
    recent_sales: RecentSale[];
}

// ==========================================
// DATA ACCESS LAYER
// ==========================================
// function to read the JSON file and parse it into the DashboardMetrics interface
const getMetricsData = (): DashboardMetrics => {
    const jsonPath = path.resolve(__dirname, '../../insight_files/dashboard_metrics.json');
    
    try {
        const fileContent = fs.readFileSync(jsonPath, 'utf-8');
        return JSON.parse(fileContent) as DashboardMetrics;
    } catch (error: any) {
        // to facilitate debugging, are provided more specific error messages
        if (error.code === 'ENOENT') {
            throw new Error("Metrics data file not found. Please run the Python ETL pipeline to generate it.");
        } else if (error instanceof SyntaxError) {
            throw new Error("Metrics data file is corrupted or contains invalid JSON format.");
        }
        throw new Error("An unexpected error occurred while reading the metrics data.");
    }
};

// ==========================================
// HELPER: ERROR HANDLER
// ==========================================
const handleApiError = (res: Response, error: unknown) => {
    // certify that the error is an instance of Error to safely access the message property
    const errorMessage = error instanceof Error ? error.message : "Unknown internal error";
    
    console.error(`[API Error]: ${errorMessage}`);
    
    // returns 503 Service Unavailable, because the API its on but the data is not available
    res.status(503).json({ 
        error: "Service Unavailable", 
        details: errorMessage 
    });
};

// ==========================================
// ENDPOINTS
// ==========================================

app.get('/api/status', (req: Request, res: Response) => {
    res.status(200).json({ status: 'OK', message: 'API is running' });
});

app.get('/api/sales-by-region', (req: Request, res: Response) => {
    try {
        const data = getMetricsData();
        res.status(200).json(data.revenue_by_region);
    } catch (error) {
        handleApiError(res, error);
    }
});

app.get('/api/top-products', (req: Request, res: Response) => {
    try {
        const data = getMetricsData();
        res.status(200).json(data.top_selling_products);
    } catch (error) {
        handleApiError(res, error);
    }
});

app.get('/api/sales-by-category', (req: Request, res: Response) => {
    try {
        const data = getMetricsData();
        res.status(200).json(data.sales_by_category);
    } catch (error) {
        handleApiError(res, error);
    }
});

app.get('/api/top-buyers', (req: Request, res: Response) => {
    try {
        const data = getMetricsData();
        res.status(200).json(data.top_buyers);
    } catch (error) {
        handleApiError(res, error);
    }
});

app.get('/api/recent-sales', (req: Request, res: Response) => {
    try {
        const data = getMetricsData();
        res.status(200).json(data.recent_sales);
    } catch (error) {
        handleApiError(res, error);
    }
});

// ==========================================
// SERVER INIT
// ==========================================
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
        console.log(`Available routes:`);
        console.log(`   GET /api/status`);
        console.log(`   GET /api/sales-by-region`);
        console.log(`   GET /api/top-products`);
        console.log(`   GET /api/sales-by-category`);
        console.log(`   GET /api/top-buyers`);
        console.log(`   GET /api/recent-sales`);
    });
}

export default app; // export the app for testing purposes