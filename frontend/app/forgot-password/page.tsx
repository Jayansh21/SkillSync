"use client";

import { useState } from 'react';
import Link from 'next/link';
import { forgotPassword } from '../../services/api';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            await forgotPassword(email);
            setMessage('A password reset link has been sent to your email.');
        } catch (err: any) {
            if (err.response?.status === 404) {
                setError('User does not exist. Please sign up first.');
            } else {
                setError('Failed to process request. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f6f8fa] px-4">
            <div className="w-full max-w-[350px] space-y-4">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block">
                        <div className="w-12 h-12 bg-[#24292f] rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto hover:opacity-90 transition-opacity">S</div>
                    </Link>
                    <h2 className="mt-4 text-2xl font-light text-[#24292f]">Reset your password</h2>
                </div>

                <div className="bg-white border border-[#d0d7de] rounded-md p-5 shadow-sm">
                    {message ? (
                        <div className="text-center space-y-4">
                            <div className="text-green-600 text-sm font-medium">{message}</div>
                            <Link href="/login" className="btn-primary w-full block text-center">
                                Return to login
                            </Link>
                        </div>
                    ) : (
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="email" className="block text-sm font-normal text-[#24292f] mb-2">
                                    Enter your email address and we will send you a link to reset your password.
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    autoFocus
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-field"
                                    placeholder="Enter your email address"
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
                                {loading ? 'Sending link...' : 'Send password reset email'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
