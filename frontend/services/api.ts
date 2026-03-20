import axios from 'axios';
import { supabase } from '../utils/supabaseClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
    baseURL: API_URL,
    // withCredentials: true, // Removed, we use Bearer header now
});

// Add a request interceptor to attach the Supabase token
api.interceptors.request.use(async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export const healthCheck = async () => {
    const response = await api.get('/health');
    return response.data;
};

export const uploadResume = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/resume/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const listResumes = async () => {
    const response = await api.get('/resume/list');
    return response.data;
};

export const deleteResume = async (resumeId: string) => {
    const response = await api.delete(`/resume/${resumeId}`);
    return response.data;
};

// Helper to build Form Data
const buildJDFormData = (resumeId: string, jdText: string, type: 'text' | 'url' | 'pdf' | 'image' | string, file: File | null) => {
    const formData = new FormData();
    formData.append('resume_id', resumeId);

    if (type === 'text') {
        formData.append('jd_text', jdText);
    } else if (type === 'url') {
        formData.append('jd_url', jdText); // In URL mode, text input holds URL
    } else if ((type === 'pdf' || type === 'image') && file) {
        formData.append('jd_file', file);
    }

    return formData;
};

export const analyzeJobDescription = async (
    resumeId: string,
    jdText: string,
    type: 'text' | 'url' | 'pdf' | 'image' = 'text',
    file: File | null = null
) => {
    const formData = buildJDFormData(resumeId, jdText, type, file);
    formData.append('top_k', '3');

    const response = await api.post('/analysis/match', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

// Re-adding omitted methods
export const checkATS = async (resumeId: string) => {
    const response = await api.post('/ats/check', { resume_id: resumeId });
    return response.data;
};

export const coachResume = async (resumeId: string) => {
    const response = await api.post('/resume/coach', { resume_id: resumeId });
    return response.data;
};

export const getProgress = async () => {
    const response = await api.get('/progress/');
    return response.data;
};

export const generateInterviewQuestions = async (
    resumeId: string,
    jdText: string,
    type: 'text' | 'url' | 'pdf' | 'image' = 'text',
    file: File | null = null
) => {
    const formData = buildJDFormData(resumeId, jdText, type, file);

    const response = await api.post('/interview/prep', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

// Auth functions now handled by Frontend Supabase SDK mostly, but we might keep these or remove if unused.
// If you want to sync user or just login, we can keep them for now, but UI should switch to Supabase.
// Assuming UI will be updated to use supabase.auth directly in components, 
// OR we wrap supabase.auth here. Let's wrap it here for consistency if UI calls these.

export const registerUser = async (email: string, password: string) => {
    // Check if we should use Supabase SDK directly
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });
    if (error) throw error;

    // Optional: Call backend to ensure user is synced immediately, 
    // although the backend will sync on first request anyway.
    return data;
};

export const loginUser = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    if (error) throw error;
    return data.session;
};

export const forgotPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    return { message: "Password reset email sent" };
};

export const resetPassword = async (token: string, new_password: string) => {
    // This flow is different in Supabase (User clicks link -> gets session -> updates user).
    // Typically handled in a ResetPassword page.
    const { error } = await supabase.auth.updateUser({ password: new_password });
    if (error) throw error;
    return { message: "Password updated" };
};

export default api;
