import React from 'react';

export const BusinessInsights: React.FC = () => {
    // select the 3 most impactful insights based on the data analysis (they are complete on the readme file)
    const insights = [
        {
            id: 1,
            icon: '🛒',
            title: 'Volume vs. Revenue',
            observation: 'Groceries lead total revenue, but Home & Toys dominate the sales volume (quantity).',
            action: 'Implement cross-selling: offer grocery discounts at the checkout of top Home & Toy products.'
        },
        {
            id: 2,
            icon: '💎',
            title: 'VIP Opportunities',
            observation: 'The East leads overall sales, but the highest-spending VIP buyers are located in the North and West.',
            action: 'Launch Premium retention programs targeting high-ticket buyers specifically in North/West regions.'
        },
        {
            id: 3,
            icon: '🎯',
            title: 'Demographic Shift',
            observation: 'Central region Top Buyers are younger (Gen Z/Millennials), while other regions are dominated by Gen X (38-50yo).',
            action: 'Personalize marketing: use trend-focused copy in Central and family-oriented copy elsewhere.'
        }
    ];

    return (
        <div className="mb-8 animate-[slideUp_0.3s_ease-out]">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-yellow-400">💡</span> Key Business Insights
            </h2>
            
            {/* responsive grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {insights.map(insight => (
                    <div 
                        key={insight.id} 
                        className="bg-[#1e293b] border border-gray-700 p-5 rounded-xl shadow-sm hover:border-gray-500 transition-colors flex flex-col h-full"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-2xl bg-gray-800 p-2 rounded-lg border border-gray-700">{insight.icon}</span>
                            <h3 className="text-lg font-bold text-slate-200">{insight.title}</h3>
                        </div>
                        
                        <p className="text-sm text-slate-200 mb-4 grow leading-relaxed">
                            {insight.observation}
                        </p>
                        
                        {/* recommended action box with visual highlight */}
                        <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-3 mt-auto">
                            <span className="text-[12px] font-bold text-blue-400 uppercase tracking-wider mb-1 block">
                                Recommended Action
                            </span>
                            <p className="text-sm text-blue-100 font-medium">
                                {insight.action}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};