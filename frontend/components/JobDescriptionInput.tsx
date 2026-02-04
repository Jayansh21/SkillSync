import { useState, ChangeEvent } from 'react';

interface JDInputProps {
    onJobDescriptionChange: (text: string, type: string, file: File | null) => void;
    currentText: string;
}

export default function JobDescriptionInput({ onJobDescriptionChange, currentText }: JDInputProps) {
    const [activeTab, setActiveTab] = useState<'text' | 'pdf' | 'url'>('text');
    const [fileName, setFileName] = useState('');

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>, type: 'pdf') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFileName(file.name);
            onJobDescriptionChange('', type, file);
        }
    };

    const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const val = e.target.value;
        onJobDescriptionChange(val, activeTab, null);
    };

    return (
        <div className="card p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                Job Description
            </h2>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-4 bg-gray-50 rounded-t-lg">
                {['text', 'pdf', 'url'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => { setActiveTab(tab as any); setFileName(''); onJobDescriptionChange('', tab, null); }}
                        className={`flex-1 px-3 py-2 text-xs font-medium capitalize transition-colors border-b-2 
                            ${activeTab === tab
                                ? 'border-blue-600 text-blue-600 bg-white'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Input Areas */}
            <div className="min-h-[150px]">
                {activeTab === 'text' && (
                    <textarea
                        className="input-field h-40 resize-none text-sm font-mono bg-gray-50"
                        placeholder="Paste job description text here (or select another tab for PDF/URL)..."
                        onChange={handleTextChange}
                        value={currentText}
                    />
                )}

                {activeTab === 'url' && (
                    <div className="space-y-2">
                        <label className="text-xs text-gray-500">Job Post URL</label>
                        <input
                            type="url"
                            className="input-field"
                            placeholder="https://linkedin.com/jobs/..."
                            onChange={handleTextChange}
                            value={currentText}
                        />
                        <p className="text-xs text-gray-400">We will extract text from the webpage.</p>
                    </div>
                )}

                {activeTab === 'pdf' && (
                    <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        <label className="cursor-pointer flex flex-col items-center w-full h-full justify-center">
                            <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                            </svg>
                            <span className="text-sm text-gray-600 font-medium">
                                {fileName ? fileName : `Upload Job PDF`}
                            </span>
                            <span className="text-xs text-gray-400 mt-1">
                                Extracts text from PDF
                            </span>
                            <input
                                type="file"
                                className="hidden"
                                accept=".pdf"
                                onChange={(e) => handleFileChange(e, activeTab)}
                            />
                        </label>
                    </div>
                )}
            </div>
        </div>
    );
}
