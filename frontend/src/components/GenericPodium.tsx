import React from 'react';

export interface PodiumItem {
    id: string;
    label: string;
    value: string;
    tooltip?: string; // optional tooltip for extra info on hover
}

interface GenericPodiumProps {
    title: string;
    data: PodiumItem[];
}

export const GenericPodium: React.FC<GenericPodiumProps> = ({ title, data }) => {
    return (
        <div className="p-6 rounded-xl shadow-sm border bg-[#111827] border-gray-200 flex flex-col">
            {/* dinamic title */}
            <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
            
            <div className="h-80 w-full flex flex-col justify-end">
                {/* podium to Top 3 */}
                <div className="flex items-end justify-center gap-2 sm:gap-4 h-3/4 pb-4">
                    
                    {/* 2º (silver) - on the left */}
                    {data[1] && (
                        <div className={`relative group flex flex-col items-center w-1/3 animate-[slideUp_0.7s_ease-out] ${data[1].tooltip ? 'cursor-help' : ''}`}>
                            
                            {/* customized tooltip */}
                            {data[1].tooltip && (
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-slate-200 text-sm px-3 py-1.5 rounded-md border border-gray-600 shadow-xl pointer-events-none whitespace-nowrap z-10">
                                    {data[1].tooltip}
                                </div>
                            )}

                            <span className="text-slate-300 font-bold text-sm sm:text-xl text-center truncate w-full">
                                {data[1].label}
                            </span>
                            <span className="text-base text-slate-400 mb-2">{data[1].value}</span>
                            <div className="w-full bg-linear-to-t from-slate-400 to-slate-200 h-24 rounded-t-lg flex justify-center items-start pt-2 shadow-[0_0_15px_rgba(148,163,184,0.3)] border border-slate-300">
                                <span className="text-slate-800 font-black text-2xl">2</span>
                            </div>
                        </div>
                    )}

                    {/* 1º (gold) - middle and higher */}
                    {data[0] && (
                        <div className={`relative group flex flex-col items-center w-1/3 animate-[slideUp_0.5s_ease-out] ${data[0].tooltip ? 'cursor-help' : ''}`}>
                            {data[0].tooltip && (
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-slate-200 text-sm px-3 py-1.5 rounded-md border border-gray-600 shadow-xl pointer-events-none whitespace-nowrap z-10">
                                    {data[0].tooltip}
                                </div>
                            )}

                            <span className="text-yellow-400 font-bold text-base sm:text-2xl text-center truncate w-full">
                                {data[0].label}
                            </span>
                            <span className="text-lg text-yellow-500 mb-2">{data[0].value}</span>
                            <div className="w-full bg-linear-to-t from-yellow-600 to-yellow-400 h-36 rounded-t-lg flex justify-center items-start pt-2 shadow-[0_0_20px_rgba(250,204,21,0.5)] border border-yellow-300">
                                <span className="text-yellow-900 font-black text-3xl">1</span>
                            </div>
                        </div>
                    )}

                    {/* 3º (bronze) - on the right and lower*/}
                    {data[2] && (
                        <div className={`relative group flex flex-col items-center w-1/3 animate-[slideUp_1s_ease-out] ${data[2].tooltip ? 'cursor-help' : ''}`}>
                            {data[2].tooltip && (
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-slate-200 text-sm px-3 py-1.5 rounded-md border border-gray-600 shadow-xl pointer-events-none whitespace-nowrap z-10">
                                    {data[2].tooltip}
                                </div>
                            )}

                            <span className="text-amber-600 font-bold text-sm sm:text-lg text-center truncate w-full">
                                {data[2].label}
                            </span>
                            <span className="text-base text-amber-700 mb-2">{data[2].value}</span>
                            <div className="w-full bg-linear-to-t from-amber-800 to-amber-600 h-16 rounded-t-lg flex justify-center items-start pt-2 shadow-[0_0_15px_rgba(217,119,6,0.3)] border border-amber-500">
                                <span className="text-amber-100 font-black text-xl">3</span>
                            </div>
                        </div>
                    )}

                </div>

                {/* 4º and 5º */}
                <div className="flex justify-around items-center h-1/4 border-t border-gray-700 pt-2">
                    {data[3] && (
                        <div className={`relative group text-slate-300 text-base bg-gray-800 px-3 py-1 rounded-full border border-gray-700 flex items-center gap-2 max-w-[45%] min-w-0 ${data[3].tooltip ? 'cursor-help' : ''}`}>
                            {data[3].tooltip && (
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-slate-200 text-sm px-3 py-1.5 rounded-md border border-gray-600 shadow-xl pointer-events-none whitespace-nowrap z-10">
                                    {data[3].tooltip}
                                </div>
                            )}

                            <span className="font-bold text-gray-500">4º</span> 
                            <span className="truncate">{data[3].label}</span>
                            <span className="text-gray-300">({data[3].value})</span>
                        </div>
                    )}
                    {data[4] && (
                        <div className={`relative group text-slate-300 text-base bg-gray-800 px-3 py-1 rounded-full border border-gray-700 flex items-center gap-2 max-w-[45%] min-w-0 ${data[4].tooltip ? 'cursor-help' : ''}`}>
                            {data[4].tooltip && (
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-slate-200 text-sm px-3 py-1.5 rounded-md border border-gray-600 shadow-xl pointer-events-none whitespace-nowrap z-10">
                                    {data[4].tooltip}
                                </div>
                            )}

                            <span className="font-bold text-gray-500">5º</span> 
                            <span className="truncate">{data[4].label}</span>
                            <span className="text-gray-300">({data[4].value})</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};