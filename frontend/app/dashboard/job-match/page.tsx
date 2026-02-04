"use client";

import { useState } from 'react';
import Sidebar from '../../../components/Sidebar';
import ResumeManager from '../../../components/ResumeUpload';
import ResultDashboard from '../../../components/ResultDashboard';
import { analyzeJobDescription } from '../../../services/api';
import JobDescriptionInput from '../../../components/JobDescriptionInput';

export default function JobMatch() {
    const [jobDescription, setJobDescription] = useState('');
    const [jdType, setJdType] = useState('text');
    const [jdFile, setJdFile] = useState<File | null>(null);

    const [loading, setLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [error, setError] = useState('');
    const [selectedResumeId, setSelectedResumeId] = useState<string>('');

    const handleJDChange = (text: string, type: string, file: File | null) => {
        setJobDescription(text);
        setJdType(type);
        setJdFile(file);
    };

    const handleAnalyze = async () => {
        if (!selectedResumeId) {
            setError('Please select a resume to analyze.');
            return;
        }

        if (jdType === 'text' && !jobDescription.trim()) return;
        if (jdType === 'pdf' && !jdFile) return;
        if (jdType === 'url' && !jobDescription.trim()) return;

        setLoading(true);
        setError('');
        setAnalysisResult(null);

        try {
            const result = await analyzeJobDescription(selectedResumeId, jobDescription, jdType as any, jdFile);
            setAnalysisResult(result);
        } catch (err) {
            console.error(err);
            setError('Analysis failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f6f8fa]">
            <Sidebar />

            <div className="ml-20 md:ml-64 p-8 max-w-7xl mx-auto">
                {/* Header */}
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Job Match Analysis</h1>
                        <p className="text-sm text-gray-500 mt-1">Select a resume and match it against a job description</p>
                    </div>
                </header>

                <div className="grid grid-cols-12 gap-8">
                    {/* Left Column: Input Actions (4 cols) */}
                    <div className="col-span-12 lg:col-span-4 space-y-6">

                        {/* Resume Manager Module */}
                        <ResumeManager
                            onSelectResume={setSelectedResumeId}
                            selectedResumeId={selectedResumeId}
                        />

                        {/* JD Input Module */}
                        <div className="space-y-4">
                            <JobDescriptionInput
                                onJobDescriptionChange={handleJDChange}
                                currentText={jobDescription}
                            />

                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={handleAnalyze}
                                    disabled={loading || !selectedResumeId || (jdType === 'text' && !jobDescription.trim()) || (jdType === 'url' && !jobDescription.trim()) || (jdType === 'pdf' && !jdFile)}
                                    title={!selectedResumeId ? "Select a resume first" : "Run Analysis"}
                                    className={`btn-primary w-full flex items-center justify-center gap-2 ${loading ? 'opacity-70' : ''} ${(!selectedResumeId || (jdType === 'text' && !jobDescription.trim()) || (jdType === 'url' && !jobDescription.trim()) || (jdType === 'pdf' && !jdFile)) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            Analyzing...
                                        </>
                                    ) : (
                                        'Run Analysis'
                                    )}
                                </button>
                                {error && <p className="text-xs text-red-500 text-center">{error}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Results (8 cols) */}
                    <div className="col-span-12 lg:col-span-8">
                        <ResultDashboard result={analysisResult} />
                    </div>
                </div>
            </div>
        </div>
    );
}
