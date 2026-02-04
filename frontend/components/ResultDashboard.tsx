"use client";

interface MatchResult {
    resume_id: string;
    score: number;
    filename?: string;
    missing_skills: string[];
    strengths: string[];
    improvement_suggestions: string[];
}

interface AnalysisResult {
    match_score: number;
    top_matches: MatchResult[];
    interview_questions: string[];
}

export default function ResultDashboard({ result }: { result: AnalysisResult | null }) {
    if (!result) {
        return (
            <div className="flex flex-col items-center justify-center h-64 border border-dashed border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                <svg className="w-12 h-12 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z"></path></svg>
                <p className="text-sm font-medium">Ready to Analyze</p>
                <p className="text-xs">Paste a JD and click analyze to see insights</p>
            </div>
        );
    }

    const topMatch = result.top_matches[0];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Score Overview */}
            <div className="card p-8 text-center border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Match Score</h3>
                <div className="flex items-center justify-center gap-2">
                    <span className="text-6xl font-bold text-gray-900">{Math.round(result.match_score)}%</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">compatibility with job description</p>
            </div>

            {topMatch && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Keyword Match (was Strengths) */}
                        <div className="card h-full">
                            <div className="px-4 py-3 border-b border-gray-100 bg-green-50/30">
                                <h3 className="text-sm font-semibold text-green-800 flex items-center gap-2 uppercase tracking-wide">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span> Keyword Match
                                </h3>
                            </div>
                            <div className="p-4">
                                {(topMatch.strengths?.length || 0) > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {topMatch.strengths.map((skill, i) => (
                                            <span key={i} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded border border-green-100 font-medium">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 italic">No specific keywords matched.</p>
                                )}
                            </div>
                        </div>

                        {/* Missing Keywords (was Missing Skills) */}
                        <div className="card h-full">
                            <div className="px-4 py-3 border-b border-gray-100 bg-red-50/30">
                                <h3 className="text-sm font-semibold text-red-800 flex items-center gap-2 uppercase tracking-wide">
                                    <span className="w-2 h-2 rounded-full bg-red-500"></span> Missing Keywords
                                </h3>
                            </div>
                            <div className="p-4">
                                {(topMatch.missing_skills?.length || 0) > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {topMatch.missing_skills.map((skill, i) => (
                                            <span key={i} className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded border border-red-100 font-medium">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 italic">No missing keywords found.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Skills Alignment */}
                    <div className="card">
                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 uppercase tracking-wide">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span> Skills Alignment
                            </h3>
                        </div>
                        <div className="p-4">
                            {(topMatch.strengths?.length || 0) > 0 ? (
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {topMatch.strengths.slice(0, 10).map((skill, i) => (
                                        <li key={i} className="text-sm text-gray-700 flex items-center gap-2">
                                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                            {skill}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-500">No skills to display.</p>
                            )}
                        </div>
                    </div>

                    {/* Suggestions */}
                    <div className="card">
                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 uppercase tracking-wide">
                                <span className="w-2 h-2 rounded-full bg-purple-500"></span> Suggestions
                            </h3>
                        </div>
                        <div className="p-4 space-y-3">
                            {(topMatch.improvement_suggestions?.length || 0) > 0 ? (
                                topMatch.improvement_suggestions.map((suggestion, i) => (
                                    <div key={i} className="flex gap-3 text-sm text-gray-700 bg-gray-50 p-3 rounded border border-gray-100">
                                        <span className="text-purple-500 font-bold">•</span>
                                        {suggestion}
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500 italic">No suggestions available.</p>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
