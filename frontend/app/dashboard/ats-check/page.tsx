"use client";

import { useState } from 'react';
import Sidebar from '../../../components/Sidebar';
import ResumeManager from '../../../components/ResumeUpload';
import { checkATS } from '../../../services/api';

interface ATSResult {
    ats_score: number;
    missing_sections: string[];
    hard_skills_found: string[];
    soft_skills_found: string[];
    formatting_issues: string[];
    improvement_suggestions: string[];
}

export default function ATSCheck() {
    const [selectedResumeId, setSelectedResumeId] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ATSResult | null>(null);
    const [error, setError] = useState('');

    const handleCheck = async () => {
        if (!selectedResumeId) return;

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const data = await checkATS(selectedResumeId);
            setResult(data);
        } catch (err: any) {
            console.error(err);
            setError('Failed to calculate ATS score. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div className="min-h-screen bg-[#f6f8fa]">
            <Sidebar />
            <div className="ml-20 md:ml-64 p-8 max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-2xl font-semibold text-gray-900">ATS Compatibility Check</h1>
                    <p className="text-sm text-gray-500 mt-1">Verify if your resume is readable by Applicant Tracking Systems</p>
                </header>

                <div className="grid grid-cols-12 gap-8">
                    {/* Left: Input */}
                    <div className="col-span-12 lg:col-span-4 space-y-6">
                        <ResumeManager
                            onSelectResume={setSelectedResumeId}
                            selectedResumeId={selectedResumeId}
                        />

                        <div className="card p-6">
                            <h3 className="font-semibold text-gray-900 mb-2">Ready to Check?</h3>
                            <p className="text-sm text-gray-500 mb-4">We will scan your selected resume for formatting issues, keyword density, and structural completeness.</p>

                            <button
                                onClick={handleCheck}
                                disabled={loading || !selectedResumeId}
                                className={`btn-primary w-full flex items-center justify-center gap-2 ${(!selectedResumeId) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Scanning...
                                    </>
                                ) : (
                                    'Run ATS Scan'
                                )}
                            </button>
                            {error && <p className="text-xs text-red-500 text-center mt-2">{error}</p>}
                        </div>
                    </div>

                    {/* Right: Results */}
                    <div className="col-span-12 lg:col-span-8">
                        {!result ? (
                            <div className="flex flex-col items-center justify-center h-full min-h-[400px] border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                                <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                <p className="text-gray-500 font-medium">Select a resume and run scan</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Score Card */}
                                <div className="card p-8 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">ATS Compatibility Score</h2>
                                        <p className="text-sm text-gray-500">Based on industry standard parsing rules</p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className={`text-5xl font-bold ${getScoreColor(result.ats_score)}`}>{result.ats_score}/100</span>
                                        <span className="text-xs text-gray-400 mt-1 uppercase tracking-wide">Overall Rating</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Formatting Issues */}
                                    <div className="card p-6">
                                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                            Formatting & Parser Checks
                                        </h3>
                                        <ul className="space-y-2">
                                            {result.formatting_issues.length > 0 ? (
                                                result.formatting_issues.map((issue, i) => (
                                                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                                        <span className="text-red-400 mt-1">•</span> {issue}
                                                    </li>
                                                ))
                                            ) : (
                                                <li className="text-sm text-green-600">No formatting issues found. Excellent!</li>
                                            )}
                                        </ul>
                                    </div>

                                    {/* Missing Sections */}
                                    <div className="card p-6">
                                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                            Critical Sections
                                        </h3>
                                        <ul className="space-y-2">
                                            {result.missing_sections.length > 0 ? (
                                                result.missing_sections.map((section, i) => (
                                                    <li key={i} className="text-sm text-red-600 flex items-start gap-2">
                                                        <span className="font-bold">Missing:</span> {section}
                                                    </li>
                                                ))
                                            ) : (
                                                <li className="text-sm text-green-600">All standard sections detected.</li>
                                            )}
                                        </ul>
                                    </div>
                                </div>

                                {/* Skills Detected */}
                                <div className="card p-6">
                                    <h3 className="font-semibold text-gray-900 mb-4">Skills Detected</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {result.hard_skills_found.map((skill, i) => (
                                            <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-100">{skill}</span>
                                        ))}
                                        {result.soft_skills_found.map((skill, i) => (
                                            <span key={i} className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded border border-purple-100">{skill}</span>
                                        ))}
                                    </div>
                                </div>

                                {/* Suggestions */}
                                <div className="card p-6">
                                    <h3 className="font-semibold text-gray-900 mb-4 text-purple-700">Improvement Suggestions</h3>
                                    <ul className="space-y-3">
                                        {result.improvement_suggestions.map((suggestion, i) => (
                                            <li key={i} className="p-3 bg-purple-50 rounded text-sm text-purple-900 border border-purple-100">
                                                {suggestion}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
