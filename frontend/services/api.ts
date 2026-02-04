import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
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

export const registerUser = async (email: string, password: string) => {
    const params = new URLSearchParams();
    // OAuth2PasswordRequestForm usually expects form data, but our Pydantic model UserCreate expects JSON.
    // Wait, the backend route uses UserCreate Pydantic model. Sending JSON is correct.
    const response = await api.post('/auth/register', { email, password });
    return response.data;
};

export const loginUser = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
};

export const forgotPassword = async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
};

export const resetPassword = async (token: string, new_password: string) => {
    const response = await api.post('/auth/reset-password', { token, new_password });
    return response.data;
};



export default api;
