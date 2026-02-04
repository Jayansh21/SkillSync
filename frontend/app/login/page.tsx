"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginUser } from '../../services/api';

function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = await loginUser(email, password);
            if (data.access_token) {
                localStorage.setItem('token', data.access_token);
                router.push('/dashboard/home');
            }
        } catch (err: any) {
            setError('Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-[350px] space-y-4">
            <div className="text-center mb-8">
                <Link href="/" className="inline-block">
                    <div className="w-12 h-12 bg-[#24292f] rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto hover:opacity-90 transition-opacity">S</div>
                </Link>
                <h2 className="mt-4 text-2xl font-light text-[#24292f]">Sign in to SkillSync</h2>
            </div>

            <div className="bg-white border border-[#d0d7de] rounded-md p-5 shadow-sm">
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-normal text-[#24292f] mb-2">Email address</label>
                        <input
                            id="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-field"
                        />
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label htmlFor="password" className="block text-sm font-normal text-[#24292f]">Password</label>
                            <Link href="/forgot-password" className="text-xs text-[#0969da] hover:underline">Forgot password?</Link>
                        </div>
                        <input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field"
                        />
                    </div>

                    {error && (
                        <div className="text-sm px-3 py-2 rounded-md border border-[rgba(255,129,130,0.4)] bg-[#ffebe9] text-[#cf222e]">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full"
                    >
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>
            </div>

            <div className="border border-[#d0d7de] rounded-md p-4 text-center bg-white text-sm">
                New to SkillSync?{' '}
                <Link href="/signup" className="link-default">
                    Create an account
                </Link>
                .
            </div>

            <div className="text-center mt-8">
                <Link href="/" className="text-sm text-[#57606a] hover:text-[#0969da] flex items-center justify-center gap-1 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Back to Home
                </Link>
            </div>
        </div>
    );
}

export default function Login() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f6f8fa] px-4">
            <LoginForm />
        </div>
    );
}
