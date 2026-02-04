"use client";

import Link from 'next/link';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 py-4">
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#24292f] rounded-lg flex items-center justify-center text-white font-bold">S</div>
                        <span className="text-xl font-bold text-gray-900 tracking-tight">SkillSync</span>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2">
                            Login
                        </Link>
                        <Link href="/signup" className="bg-green-600 text-white font-medium px-6 py-2 rounded-full hover:bg-green-700 transition">
                            Get Started
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <main className="flex-grow">
                <section className="bg-white pb-20 pt-20">
                    <div className="max-w-7xl mx-auto px-6 text-center">
                        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
                            Your Personal <span className="text-green-600">AI Career Coach</span>
                        </h1>
                        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
                            Optimize your resume for ATS, prep for interviews, and land your dream job faster with intelligent tools.
                        </p>
                        <div className="flex justify-center gap-4">
                            <Link href="/signup" className="px-8 py-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition shadow-lg shadow-green-200">
                                Start Your Journey
                            </Link>
                            <Link href="/login" className="px-8 py-4 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition">
                                Existing User?
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section className="py-20 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            {/* Feature 1 */}
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 mb-6">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">ATS Resume Check</h3>
                                <p className="text-gray-500">
                                    Instant feedback on how well-formatted your resume is for robotic screening systems.
                                </p>
                            </div>

                            {/* Feature 2 */}
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-6">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Job Match Analysis</h3>
                                <p className="text-gray-500">
                                    Paste a JD and see exactly where you match, and where gaps exist.
                                </p>
                            </div>

                            {/* Feature 3 */}
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mb-6">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Interview Coach</h3>
                                <p className="text-gray-500">
                                    Get AI-generated questions tailored specifically to the job you want.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="bg-gray-900 text-gray-400 py-10">
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                    <p>© 2026 SkillSync. All rights reserved.</p>

                </div>
            </footer>
        </div>
    );
}
