import React, { useState, useEffect, useMemo } from 'react';
import { type RecentSale } from '../services/api';

interface TransactionTableProps {
    data: RecentSale[];
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export const TransactionTable: React.FC<TransactionTableProps> = ({ data }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [regionFilter, setRegionFilter] = useState('All');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 8;
    
    // control of sorting state
    const [sortField, setSortField] = useState<'date' | 'total_value'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // extracting options for filters
    const uniqueRegions = ['All', ...Array.from(new Set(data.map(item => item.region)))];
    const uniqueCategories = ['All', ...Array.from(new Set(data.map(item => item.category)))];

    // applying filtering and sorting with useMemo for performance
    const filteredAndSortedData = useMemo(() => {
        // filter
        let result = data.filter(transaction => {
            const matchesSearch = transaction.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  transaction.product_name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRegion = regionFilter === 'All' || transaction.region === regionFilter;
            const matchesCategory = categoryFilter === 'All' || transaction.category === categoryFilter;
            
            return matchesSearch && matchesRegion && matchesCategory;
        });

        // order
        result.sort((a, b) => {
            if (sortField === 'date') {
                const dateA = new Date(a.date).getTime();
                const dateB = new Date(b.date).getTime();
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            } else {
                return sortOrder === 'asc' ? a.total_value - b.total_value : b.total_value - a.total_value;
            }
        });

        return result;
    }, [data, searchTerm, regionFilter, categoryFilter, sortField, sortOrder]);

    // reset to page 1 if any filter was applied
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, regionFilter, categoryFilter, sortField, sortOrder]);

    // calculate pagination
    const totalPages = Math.ceil(filteredAndSortedData.length / ITEMS_PER_PAGE);
    const paginatedData = filteredAndSortedData.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // aux function to handle sorting when header is clicked
    const handleSort = (field: 'date' | 'total_value') => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('desc');
        }
    };

    return (
        <div className="p-6 rounded-xl shadow-sm border border-gray-700 bg-[#111827] flex flex-col mt-6 w-full overflow-hidden">
            <h2 className="text-2xl font-bold text-white mb-6">Recent Sales</h2>
            
            {/* TOOLBAR: filters and search */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <input 
                    type="text" 
                    placeholder="Search customer or product..." 
                    className="bg-gray-800 text-slate-200 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 grow"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                
                <select 
                    className="bg-gray-800 text-slate-200 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 cursor-pointer"
                    value={regionFilter}
                    onChange={(e) => setRegionFilter(e.target.value)}
                >
                    {uniqueRegions.map(region => (
                        <option key={region} value={region}>{region === 'All' ? 'All Regions' : region}</option>
                    ))}
                </select>

                <select 
                    className="bg-gray-800 text-slate-200 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 cursor-pointer"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                >
                    {uniqueCategories.map(category => (
                        <option key={category} value={category}>{category === 'All' ? 'All Categories' : category}</option>
                    ))}
                </select>
            </div>

            {/* data table */}
            <div className="overflow-x-auto rounded-lg border border-gray-800">
                <table className="w-full text-left border-collapse min-w-max">
                    <thead className="bg-gray-800/50">
                        <tr>
                            <th 
                                className="p-4 border-b border-gray-700 text-gray-400 font-semibold text-md cursor-pointer hover:text-white transition-colors select-none"
                                onClick={() => handleSort('date')}
                            >
                                Date {sortField === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="p-4 border-b border-gray-700 text-gray-400 font-semibold text-md">Customer</th>
                            <th className="p-4 border-b border-gray-700 text-gray-400 font-semibold text-md">Product</th>
                            <th className="p-4 border-b border-gray-700 text-gray-400 font-semibold text-md">Region</th>
                            <th 
                                className="p-4 border-b border-gray-700 text-gray-400 font-semibold text-md cursor-pointer hover:text-white transition-colors select-none text-right"
                                onClick={() => handleSort('total_value')}
                            >
                                Total Value {sortField === 'total_value' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.length > 0 ? (
                            paginatedData.map((tx, index) => (
                                <tr key={index} className="hover:bg-gray-800/30 transition-colors">
                                    <td className="p-4 border-b border-gray-800 text-slate-300 text-md whitespace-nowrap">{tx.date}</td>
                                    <td className="p-4 border-b border-gray-800 text-white font-medium text-md">{tx.name}</td>
                                    <td className="p-4 border-b border-gray-800 text-slate-300 text-md">
                                        <div className="flex flex-col">
                                            <span>{tx.product_name}</span>
                                            <span className="text-sm text-gray-500">{tx.category} • {tx.quantity} un</span>
                                        </div>
                                    </td>
                                    <td className="p-4 border-b border-gray-800 text-slate-300 text-md">
                                        <span className="bg-gray-800 px-2 py-1 rounded text-sm border border-gray-700">{tx.region}</span>
                                    </td>
                                    <td className="p-4 border-b border-gray-800 text-green-400 font-semibold text-md text-right">
                                        {formatCurrency(tx.total_value)}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-500">
                                    No transactions match your filters
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* pagination controls */}
            <div className="mt-4 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-400 gap-4">
                <div>
                    Showing <span className="text-white font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="text-white font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedData.length)}</span> of <span className="text-white font-medium">{filteredAndSortedData.length}</span> transactions
                </div>
                
                <div className="flex gap-2">
                    <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 bg-gray-800 border border-gray-700 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white"
                    >
                        Previous
                    </button>
                    
                    <span className="px-4 py-1 bg-[#0f172a] border border-gray-700 rounded flex items-center justify-center text-white">
                        Page {currentPage} of {totalPages || 1}
                    </span>
                    
                    <button 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="px-3 py-1 bg-gray-800 border border-gray-700 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};