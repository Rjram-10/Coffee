import React, { useState } from 'react';
import api from '../api';
import type { Worker, AuthResponse } from '../types';
import { Coffee, KeyRound, User } from 'lucide-react';

interface LoginScreenProps {
    onLogin: (worker: Worker) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const res = await api.post<AuthResponse>('/auth/login', { username, password });
            localStorage.setItem('auth_token', res.data.token);
            localStorage.setItem('auth_worker', JSON.stringify({
                id: res.data.id,
                username: res.data.username,
                role: res.data.role
            }));
            onLogin({ id: res.data.id, username: res.data.username, role: res.data.role });
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-zinc-900/50 backdrop-blur-sm p-8 rounded-2xl border border-zinc-800 shadow-2xl">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-coffee-500 to-coffee-700 rounded-full mb-4 shadow-lg shadow-coffee-900/50">
                        <Coffee className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-coffee-200 to-coffee-600 mb-2">
                        BEAN<span className="text-coffee-500">&</span>BREW
                    </h1>
                    <p className="text-zinc-500 text-sm tracking-widest uppercase">Staff Access Portal</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Username</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 w-5 h-5 text-zinc-600" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2.5 pl-10 pr-4 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-coffee-500 transition-all"
                                placeholder="Enter staff ID"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Password</label>
                        <div className="relative">
                            <KeyRound className="absolute left-3 top-3 w-5 h-5 text-zinc-600" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2.5 pl-10 pr-4 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-coffee-500 transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-400 text-sm text-center bg-red-900/20 py-2 rounded-lg border border-red-900/50">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-coffee-600 to-coffee-500 hover:from-coffee-500 hover:to-coffee-400 text-white font-bold py-3 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Access Dashboard
                    </button>

                    <div className="text-center text-xs text-zinc-600 mt-4">
                        <p>Restricted Area. Authorized Personnel Only.</p>
                        <p className="mt-1">Use admin / admin for demo</p>
                    </div>
                </form>
            </div>
        </div>
    );
};
