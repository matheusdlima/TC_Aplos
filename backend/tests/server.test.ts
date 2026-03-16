import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import request from 'supertest';
import app from '../src/server';
import fs from 'fs';

// mock the filesystem so tests do not depend on the real metrics file
jest.mock('fs');

// keep a typed reference to the mocked function for each scenario
const mockedReadFileSync = jest.mocked(fs.readFileSync);

describe('API Endpoints', () => {
    // reset all mock state to keep tests isolated from each other
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/status', () => {
        it('should return 200 OK and health status', async () => {
            const response = await request(app).get('/api/status');
            
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ status: 'OK', message: 'API is running' });
        });
    });

    describe('GET /api/sales-by-region', () => {
        it('should return 200 and the region metrics when JSON file exists', async () => {
            const mockData = {
                revenue_by_region: [
                    { region: 'South', total_value: 5000 },
                    { region: 'North', total_value: 3000 }
                ]
            };
            
            // simulate a valid dashboard JSON file being read by the API.
            mockedReadFileSync.mockReturnValue(JSON.stringify(mockData));

            const response = await request(app).get('/api/sales-by-region');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockData.revenue_by_region);
            expect(response.body.length).toBe(2);
        });

        it('should return 503 Service Unavailable when JSON file is missing (ENOENT)', async () => {
            // reproduce the same error Node throws when the target file does not exist
            const mockError = Object.assign(new Error('File not found'), {
                code: 'ENOENT'
            });
            
            mockedReadFileSync.mockImplementation(() => {
                throw mockError;
            });

            const response = await request(app).get('/api/sales-by-region');

            expect(response.status).toBe(503);
            expect(response.body).toHaveProperty('error', 'Service Unavailable');
            expect(response.body.details).toContain('Metrics data file not found');
        });

        it('should return 503 when JSON file is corrupted (SyntaxError)', async () => {
            // return malformed JSON to verify the API error handling for invalid file contents
            mockedReadFileSync.mockReturnValue('{ "revenue_by_region": [ { region: "South } ]');

            const response = await request(app).get('/api/sales-by-region');

            expect(response.status).toBe(503);
            expect(response.body.details).toContain('corrupted or contains invalid JSON format');
        });
    });

    describe('GET /api/top-products', () => {
        it('should return 200 and the top selling products list', async () => {
            mockedReadFileSync.mockReturnValue(JSON.stringify({
                top_selling_products: [
                    {
                        product_id: 'p1',
                        product_name: 'Laptop',
                        category: 'Electronics',
                        quantity: 8
                    }
                ]
            }));

            const response = await request(app).get('/api/top-products');

            expect(response.status).toBe(200);
            expect(response.body).toEqual([
                {
                    product_id: 'p1',
                    product_name: 'Laptop',
                    category: 'Electronics',
                    quantity: 8
                }
            ]);
        });
    });

    describe('GET /api/sales-by-category', () => {
        it('should return 200 and the sales by category list', async () => {
            mockedReadFileSync.mockReturnValue(JSON.stringify({
                sales_by_category: [
                    {
                        category: 'Electronics',
                        total_value: 3200
                    }
                ]
            }));

            const response = await request(app).get('/api/sales-by-category');

            expect(response.status).toBe(200);
            expect(response.body).toEqual([
                {
                    category: 'Electronics',
                    total_value: 3200
                }
            ]);
        });
    });

    describe('GET /api/top-buyers', () => {
        it('should return 200 and the top buyers list', async () => {
            mockedReadFileSync.mockReturnValue(JSON.stringify({
                top_buyers: [
                    {
                        customer_id: 'c1',
                        name: 'Alice',
                        age: 29,
                        region: 'North',
                        total_value: 4100
                    }
                ]
            }));

            const response = await request(app).get('/api/top-buyers');

            expect(response.status).toBe(200);
            expect(response.body).toEqual([
                {
                    customer_id: 'c1',
                    name: 'Alice',
                    age: 29,
                    region: 'North',
                    total_value: 4100
                }
            ]);
        });
    });
});