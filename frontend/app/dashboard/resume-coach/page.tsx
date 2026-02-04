"use client";

import { useState } from 'react';
import Sidebar from '../../../components/Sidebar';
import ResumeManager from '../../../components/ResumeUpload';
import { coachResume } from '../../../services/api';

interface Improvement {
    original: string;
    improved: string;
    reason: string;
}

interface CoachResult {
    improvements: Improvement[];
    general_suggestions: string[];
}

export default function ResumeCoach() {
    const [selectedResumeId, setSelectedResumeId] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<CoachResult | null>(null);
    const [error, setError] = useState('');

    const handleCoach = async () => {
        if (!selectedResumeId) return;

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const data = await coachResume(selectedResumeId);
            setResult(data);
        } catch (err: any) {
            console.error(err);
            setError('Failed to run Resume Coach. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f6f8fa]">
            <Sidebar />
            <div className="ml-20 md:ml-64 p-8 max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-2xl font-semibold text-gray-900">AI Resume Coach</h1>
                    <p className="text-sm text-gray-500 mt-1">Transform your bullet points into punchy, result-oriented statements</p>
                </header>

                <div className="grid grid-cols-12 gap-8">
                    {/* Left: Input */}
                    <div className="col-span-12 lg:col-span-4 space-y-6">
                        <ResumeManager
                            onSelectResume={setSelectedResumeId}
                            selectedResumeId={selectedResumeId}
                        />

                        <div className="card p-6">
                            <h3 className="font-semibold text-gray-900 mb-2">Improve Your Impact</h3>
                            <p className="text-sm text-gray-500 mb-4">Our AI will identify weak sections in your experience and rewrite them to highlight your achievements.</p>

                            <button
                                onClick={handleCoach}
                                disabled={loading || !selectedResumeId}
                                className={`btn-primary w-full flex items-center justify-center gap-2 ${(!selectedResumeId) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Coaching...
                                    </>
                                ) : (
                                    'Start Coaching Session'
                                )}
                            </button>
                            {error && <p className="text-xs text-red-500 text-center mt-2">{error}</p>}
                        </div>
                    </div>

                    {/* Right: Results */}
                    <div className="col-span-12 lg:col-span-8">
                        {!result ? (
                            <div className="flex flex-col items-center justify-center h-full min-h-[400px] border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                                <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                                <p className="text-gray-500 font-medium">Select a resume and start coaching</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Suggestions */}
                                <div className="card p-6 bg-gradient-to-r from-purple-50 to-white border-purple-100">
                                    <h3 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                        Key Strategies for You
                                    </h3>
                                    <ul className="space-y-2">
                                        {result.general_suggestions.map((suggestion, i) => (
                                            <li key={i} className="text-sm text-purple-800 flex items-start gap-2">
                                                <span className="text-purple-400 mt-1">•</span> {suggestion}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Deep Dive Improvements */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-gray-900">Bullet Point Rewrites</h3>
                                    {result.improvements.map((item, i) => (
                                        <div key={i} className="card p-0 overflow-hidden border border-gray-200">
                                            <div className="p-4 bg-gray-50 border-b border-gray-100">
                                                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">Original</p>
                                                <p className="text-gray-600 italic text-sm">"{item.original}"</p>
                                            </div>
                                            <div className="p-4 bg-white">
                                                <p className="text-xs text-green-600 uppercase tracking-wide font-semibold mb-2 flex items-center gap-1">
                                                    Improved Version
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                                </p>
                                                <p className="text-gray-900 font-medium text-sm mb-3">"{item.improved}"</p>
                                                <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded inline-block">
                                                    <strong>Why:</strong> {item.reason}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
