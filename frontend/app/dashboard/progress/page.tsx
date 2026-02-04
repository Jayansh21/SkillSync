"use client";

import { useEffect, useState } from 'react';
import Sidebar from '../../../components/Sidebar';
import { getProgress } from '../../../services/api';

interface ProgressItem {
    id: number;
    resume_id: string;
    filename: string;
    ats_score: number;
    timestamp: string;
    summary_bit: string;
}

export default function Progress() {
    const [history, setHistory] = useState<ProgressItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProgress();
    }, []);

    const fetchProgress = async () => {
        try {
            const data = await getProgress();
            setHistory(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-[#f6f8fa]">
            <Sidebar />
            <div className="ml-20 md:ml-64 p-8 max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-2xl font-semibold text-gray-900">Improvement Tracker</h1>
                    <p className="text-sm text-gray-500 mt-1">Track your ATS score improvements over time</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Trend / Timeline */}
                    <div className="lg:col-span-2 space-y-6">
                        {loading ? (
                            <div className="card p-12 text-center text-gray-400">Loading history...</div>
                        ) : history.length === 0 ? (
                            <div className="card p-12 text-center">
                                <p className="text-gray-500">No score history found.</p>
                                <p className="text-sm text-gray-400 mt-2">Run an ATS Check to see your progress here.</p>
                            </div>
                        ) : (
                            <div className="relative border-l-2 border-gray-200 ml-4 pl-8 space-y-8">
                                {history.slice().reverse().map((item, index) => (
                                    <div key={item.id} className="relative">
                                        <div className={`absolute -left-[41px] top-4 w-6 h-6 rounded-full border-2 
                                            ${item.ats_score >= 80 ? 'bg-green-100 border-green-500' :
                                                item.ats_score >= 60 ? 'bg-yellow-100 border-yellow-500' :
                                                    'bg-red-100 border-red-500'}`}>
                                        </div>

                                        <div className="card p-6 hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{item.filename}</h3>
                                                    <p className="text-xs text-gray-500">{formatDate(item.timestamp)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`text-2xl font-bold 
                                                        ${item.ats_score >= 80 ? 'text-green-600' :
                                                            item.ats_score >= 60 ? 'text-yellow-600' :
                                                                'text-red-600'}`}>
                                                        {item.ats_score}
                                                    </span>
                                                    <span className="text-xs text-gray-400 block">ATS Score</span>
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                                                <span className="font-semibold text-gray-500 text-xs uppercase block mb-1">Notes / Issues</span>
                                                {item.summary_bit}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Stats Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="card p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Summary</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Total Checks</p>
                                    <p className="text-2xl font-bold text-gray-900">{history.length}</p>
                                </div>
                                <div className="pt-4 border-t border-gray-100">
                                    <p className="text-xs text-gray-500 uppercase">Highest Score</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {history.length > 0 ? Math.max(...history.map(h => h.ats_score)) : '-'}
                                    </p>
                                </div>
                                <div className="pt-4 border-t border-gray-100">
                                    <p className="text-xs text-gray-500 uppercase">Latest Score</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {history.length > 0 ? history[history.length - 1].ats_score : '-'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
