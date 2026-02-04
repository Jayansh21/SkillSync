"use client";

import { useState, useEffect, ChangeEvent, MouseEvent } from 'react';
import { uploadResume, listResumes, deleteResume } from '../services/api';

interface Resume {
    resume_id: string;
    filename: string;
    upload_time: string;
    version_number?: number;
    version_label?: string;
    latest_ats_score?: number;
}

interface ResumeManagerProps {
    onSelectResume?: (resumeId: string) => void;
    selectedResumeId?: string;
}

export default function ResumeManager({ onSelectResume, selectedResumeId }: ResumeManagerProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [status, setStatus] = useState<string>('');

    useEffect(() => {
        fetchResumes();
    }, []);

    const fetchResumes = async () => {
        try {
            const list = await listResumes();
            // Sort by upload time desc
            list.sort((a: any, b: any) => new Date(b.upload_time).getTime() - new Date(a.upload_time).getTime());
            setResumes(list);
        } catch (error) {
            console.error("Failed to fetch resumes", error);
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
            setStatus('');
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        try {
            setIsUploading(true);
            setStatus('Uploading...');
            const result = await uploadResume(file);
            setStatus(`Upload success!`);
            setFile(null); // Clear selection

            await fetchResumes();
            // Auto-select uploaded resume
            if (onSelectResume && result.resume_id) {
                onSelectResume(result.resume_id);
            }

        } catch (error: any) {
            console.error("Upload error:", error);
            if (error.response && error.response.data && error.response.data.detail) {
                setStatus(`Upload failed: ${error.response.data.detail}`);
            } else {
                setStatus('Upload failed. Please try a valid resume PDF.');
            }
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (e: MouseEvent, id: string) => {
        e.stopPropagation(); // Prevent selection when deleting
        if (!confirm('Are you sure you want to delete this resume?')) return;
        try {
            await deleteResume(id);
            // If deleted was selected, clear selection
            if (id === selectedResumeId && onSelectResume) {
                onSelectResume('');
            }
            fetchResumes();
        } catch (error) {
            console.error("Failed to delete", error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Upload Area */}
            <div className="card p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                    Upload New Resume
                </h2>

                <div className="flex flex-col gap-4">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg className="w-8 h-8 mb-3 text-gray-400" fill="none" viewBox="0 0 20 16">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                            </svg>
                            <p className="text-sm text-gray-500"><span className="font-semibold">Click to upload</span> PDF</p>
                            <p className="text-xs text-center text-gray-400 mt-1 max-w-[200px]">Upload your resume (PDF). Documents without resume sections may be rejected.</p>
                        </div>
                        <input type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
                    </label>

                    {file && (
                        <div className="text-xs text-gray-600 bg-gray-100 p-2 rounded flex items-center justify-between">
                            <span>{file.name}</span>
                            <button onClick={handleUpload} disabled={isUploading} className="text-blue-600 font-bold hover:underline">
                                {isUploading ? 'Uploading...' : 'Upload'}
                            </button>
                        </div>
                    )}
                    {status && (
                        <p className={`text-xs text-center ${status.includes('failed') || status.includes('rejected') || status.includes('resume') ? 'text-red-600' : 'text-green-600'}`}>
                            {status}
                        </p>
                    )}
                </div>
            </div>

            {/* Resume List */}
            <div className="card p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    Your Resumes ({resumes.length})
                </h2>

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {resumes.length === 0 ? (
                        <p className="text-sm text-gray-500 italic text-center py-4">No resumes uploaded yet.</p>
                    ) : (
                        resumes.map((resume) => {
                            const isSelected = selectedResumeId === resume.resume_id;
                            const formattedDate = new Date(resume.upload_time).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                            });

                            return (
                                <div
                                    key={resume.resume_id}
                                    className={`group p-3 flex items-center justify-between cursor-pointer transition-all border-l-4 rounded-md border 
                                        ${isSelected
                                            ? 'bg-blue-50 border-blue-100 border-l-blue-600 shadow-sm'
                                            : 'bg-white border-gray-100 border-l-transparent hover:bg-gray-50'}`}
                                    onClick={() => onSelectResume && onSelectResume(resume.resume_id)}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        {/* Icon Logic */}
                                        <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors
                                                ${isSelected ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-400'}`}>
                                            {isSelected ? (
                                                <span className="text-[10px]">PDF</span>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className={`text-sm font-medium truncate ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}>
                                                {resume.filename}
                                            </p>
                                            <p className="text-xs text-gray-500 flex items-center gap-2">
                                                {formattedDate}
                                                {resume.latest_ats_score && (
                                                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${resume.latest_ats_score >= 80 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                        ATS: {resume.latest_ats_score}%
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={(e) => handleDelete(e, resume.resume_id)}
                                        className={`p-1 bg-transparent hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100`}
                                        title="Delete"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
