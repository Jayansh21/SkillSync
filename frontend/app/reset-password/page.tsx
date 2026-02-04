"use client";

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { resetPassword } from '../../services/api';

function ResetPasswordForm() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            setError('Invalid or missing reset token.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await resetPassword(token, password);
            setSuccess(true);
        } catch (err: any) {
            setError('Failed to reset password. The link may have expired.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="text-center space-y-4">
                <div className="text-green-600 text-sm font-medium">
                    Password has been reset successfully!
                </div>
                <Link href="/login" className="btn-primary w-full block text-center">
                    Sign in with new password
                </Link>
            </div>
        );
    }

    return (
        <form className="space-y-4" onSubmit={handleSubmit}>
            {!token && (
                <div className="text-sm px-3 py-2 rounded-md border border-yellow-200 bg-yellow-50 text-yellow-800 mb-4">
                    Warning: No reset token found in URL.
                </div>
            )}

            <div>
                <label htmlFor="password" className="block text-sm font-normal text-[#24292f] mb-2">New Password</label>
                <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field"
                    placeholder="Enter new password"
                />
            </div>

            <div>
                <label htmlFor="confirmPassword" className="block text-sm font-normal text-[#24292f] mb-2">Confirm Password</label>
                <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field"
                    placeholder="Confirm new password"
                />
            </div>

            {error && (
                <div className="text-sm px-3 py-2 rounded-md border border-[rgba(255,129,130,0.4)] bg-[#ffebe9] text-[#cf222e]">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={loading || !token}
                className="btn-primary w-full"
            >
                {loading ? 'Resetting...' : 'Reset Password'}
            </button>
        </form>
    );
}

export default function ResetPassword() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f6f8fa] px-4">
            <div className="w-full max-w-[350px] space-y-4">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block">
                        <div className="w-12 h-12 bg-[#24292f] rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto hover:opacity-90 transition-opacity">S</div>
                    </Link>
                    <h2 className="mt-4 text-2xl font-light text-[#24292f]">Set new password</h2>
                </div>

                <div className="bg-white border border-[#d0d7de] rounded-md p-5 shadow-sm">
                    <Suspense fallback={<div className="text-center py-4">Loading...</div>}>
                        <ResetPasswordForm />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
