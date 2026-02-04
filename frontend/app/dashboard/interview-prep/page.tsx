"use client";

import { useState } from 'react';
import Sidebar from '../../../components/Sidebar';
import ResumeManager from '../../../components/ResumeUpload';
import { generateInterviewQuestions } from '../../../services/api';
import JobDescriptionInput from '../../../components/JobDescriptionInput';

export default function InterviewPrep() {
    const [selectedResumeId, setSelectedResumeId] = useState<string>('');
    const [jobDescription, setJobDescription] = useState('');
    const [jdType, setJdType] = useState('text');
    const [jdFile, setJdFile] = useState<File | null>(null);

    const [loading, setLoading] = useState(false);
    const [questions, setQuestions] = useState<string[]>([]);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');

    const handleJDChange = (text: string, type: string, file: File | null) => {
        setJobDescription(text);
        setJdType(type);
        setJdFile(file);
    };

    const handleGenerate = async () => {
        if (!selectedResumeId) return;

        if (jdType === 'text' && !jobDescription.trim()) return;
        if ((jdType === 'pdf' || jdType === 'image') && !jdFile) return;
        if (jdType === 'url' && !jobDescription.trim()) return;

        setLoading(true);
        setError('');
        setQuestions([]);
        setResult(null);

        try {
            const data = await generateInterviewQuestions(selectedResumeId, jobDescription, jdType as any, jdFile);
            if (data.questions) {
                setQuestions(data.questions);
            }
            setResult(data);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.detail || 'Failed to generate interview questions. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f6f8fa]">
            <Sidebar />
            <div className="ml-20 md:ml-64 p-8 max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-2xl font-semibold text-gray-900">Interview Preparation</h1>
                    <p className="text-sm text-gray-500 mt-1">Practice with AI-generated questions tailored to your target job</p>
                </header>

                <div className="grid grid-cols-12 gap-8">
                    {/* Left: Input */}
                    <div className="col-span-12 lg:col-span-4 space-y-6">
                        <ResumeManager
                            onSelectResume={setSelectedResumeId}
                            selectedResumeId={selectedResumeId}
                        />

                        {/* JD Input */}
                        <div className="space-y-4">
                            <JobDescriptionInput
                                onJobDescriptionChange={handleJDChange}
                                currentText={jobDescription}
                            />

                            <button
                                onClick={handleGenerate}
                                disabled={loading || !selectedResumeId || (jdType === 'text' && !jobDescription.trim()) || (jdType === 'url' && !jobDescription.trim()) || ((jdType === 'pdf' || jdType === 'image') && !jdFile)}
                                className={`btn-primary w-full flex items-center justify-center gap-2 ${loading ? 'opacity-70' : ''} ${(!selectedResumeId || (jdType === 'text' && !jobDescription.trim()) || (jdType === 'url' && !jobDescription.trim()) || ((jdType === 'pdf' || jdType === 'image') && !jdFile)) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Generating...
                                    </>
                                ) : (
                                    'Generate Questions'
                                )}
                            </button>
                            {error && <p className="text-xs text-red-500 text-center mt-2">{error}</p>}
                        </div>
                    </div>

                    {/* Right: Results */}
                    <div className="col-span-12 lg:col-span-8">
                        {(!result && !loading) ? (
                            <div className="flex flex-col items-center justify-center h-full min-h-[400px] border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                                <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                                <p className="text-gray-500 font-medium">Ready for your mock interview?</p>
                                <p className="text-sm text-gray-400 mt-1">Select a resume and add a JD to start.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {result && (
                                    <>
                                        {/* Context Cards */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="card p-4 bg-blue-50 border-blue-100">
                                                <h3 className="text-sm font-semibold text-blue-800 mb-2">Company Overview</h3>
                                                <p className="text-xs text-blue-900 leading-relaxed">{result.company_overview}</p>
                                            </div>
                                            <div className="card p-4 bg-purple-50 border-purple-100">
                                                <h3 className="text-sm font-semibold text-purple-800 mb-2">Role Expectations</h3>
                                                <p className="text-xs text-purple-900 leading-relaxed">{result.role_expectations}</p>
                                            </div>
                                        </div>

                                        <div className="card p-4 bg-orange-50 border-orange-100">
                                            <h3 className="text-sm font-semibold text-orange-800 mb-2">Key Focus Areas</h3>
                                            <p className="text-xs text-orange-900 leading-relaxed">{result.interview_focus}</p>
                                        </div>
                                    </>
                                )}

                                <div className="card p-8">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                        <span className="w-8 h-8 bg-orange-100 text-orange-600 rounded flex items-center justify-center text-sm">Q</span>
                                        Interview Questions
                                    </h2>

                                    <div className="space-y-4">
                                        {loading ? (
                                            <>
                                                <div className="h-16 bg-gray-100 rounded animate-pulse"></div>
                                                <div className="h-16 bg-gray-100 rounded animate-pulse"></div>
                                                <div className="h-16 bg-gray-100 rounded animate-pulse"></div>
                                            </>
                                        ) : (
                                            questions.map((q, i) => (
                                                <div key={i} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow group">
                                                    <div className="flex gap-4">
                                                        <span className="text-gray-300 font-bold text-lg group-hover:text-orange-500 transition-colors">0{i + 1}</span>
                                                        <p className="text-gray-800 font-medium pt-1">{q}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {result?.disclaimer && (
                                        <p className="text-xs text-gray-400 mt-6 text-center italic">{result.disclaimer}</p>
                                    )}

                                    {!loading && questions.length > 0 && (
                                        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                                            <button
                                                onClick={() => navigator.clipboard.writeText(questions.join('\n\n'))}
                                                className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                                                Copy Questions
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
