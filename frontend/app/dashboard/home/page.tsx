"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Sidebar from '../../../components/Sidebar';
import { getProgress } from '../../../services/api';

export default function HomePage() {
    const [progressStats, setProgressStats] = useState<any[]>([]);

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const data = await getProgress();
                setProgressStats(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchProgress();
    }, []);
    return (
        <div className="min-h-screen bg-[#f6f8fa]">
            <Sidebar />
            <div className="ml-20 md:ml-64 p-8 max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Welcome to SkillSync</h1>
                    <p className="text-gray-500 mt-2 text-lg">Your AI Career Copilot. What would you like to achieve today?</p>
                </header>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <Link href="/dashboard/job-match" className="card p-6 hover:shadow-md transition-all hover:-translate-y-1 group">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 mb-1">Analyze & Match</h3>
                        <p className="text-sm text-gray-500">Match your resume against a specific job description.</p>
                    </Link>

                    <Link href="/dashboard/ats-check" className="card p-6 hover:shadow-md transition-all hover:-translate-y-1 group">
                        <div className="w-12 h-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-600 group-hover:text-white transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 mb-1">Check ATS Score</h3>
                        <p className="text-sm text-gray-500">Verify your resume's readability by ATS bots.</p>
                    </Link>

                    <Link href="/dashboard/resume-coach" className="card p-6 hover:shadow-md transition-all hover:-translate-y-1 group">
                        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 mb-1">Improve Resume</h3>
                        <p className="text-sm text-gray-500">Get AI-powered suggestions to rewrite content.</p>
                    </Link>

                    <Link href="/dashboard/interview-prep" className="card p-6 hover:shadow-md transition-all hover:-translate-y-1 group">
                        <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 mb-1">Interview Prep</h3>
                        <p className="text-sm text-gray-500">Practice questions tailored to your target role.</p>
                    </Link>
                </div>

                <div className="card p-6 w-full text-left">
                    <div className="w-full">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h2>

                        <div className="mb-2">
                            <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide font-medium">Highest ATS Score</p>
                            <div className="flex items-center justify-start gap-4 mb-3">
                                <span className="text-4xl font-bold text-blue-600">
                                    {progressStats.length > 0 ? Math.max(...progressStats.map(p => p.ats_score)) : 0}%
                                </span>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                                    style={{ width: `${progressStats.length > 0 ? Math.max(...progressStats.map(p => p.ats_score)) : 0}%` }}
                                ></div>
                            </div>

                            <p className="text-sm text-gray-600">Improve your resume to reach 100% ATS compatibility.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
