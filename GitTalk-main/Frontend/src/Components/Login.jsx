import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../api';
import toast from 'react-hot-toast';

const Login = ({ setUser }) => {
    const [isRegister, setIsRegister] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            if (isRegister) {
                if (!formData.username) throw new Error("Username is required");
                await api.register(formData);
                toast.success('Registration successful! Please login.');
                setIsRegister(false);
            } else {
                const { data } = await api.login({ email: formData.email, password: formData.password });
                setUser(data.user);
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Authentication failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-[#0f0f12] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f0f12] to-black font-display p-4">
            <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
                <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl relative overflow-hidden">

                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-2 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>

                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent mb-2">
                            {isRegister ? 'Create Account' : 'Welcome Back'}
                        </h1>
                        <p className="text-slate-400 text-sm">
                            {isRegister ? 'Join RepoTalk to analyze your codebases' : 'Sign in to continue your analysis'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium text-center animate-in slide-in-from-top-2">
                                {error}
                            </div>
                        )}

                        {isRegister && (
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-400 ml-1">Username</label>
                                <input
                                    name="username"
                                    className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                                    placeholder="johndoe"
                                    value={formData.username}
                                    onChange={handleChange}
                                />
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-400 ml-1">Email</label>
                            <input
                                name="email"
                                type="email"
                                className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-400 ml-1">Password</label>
                            <input
                                name="password"
                                type="password"
                                className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <button
                            className="mt-4 w-full bg-gradient-to-r from-primary to-emerald-400 hover:to-emerald-300 text-background-dark font-bold p-3.5 rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Please wait...' : (isRegister ? 'Sign Up' : 'Log In')}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-xs text-slate-500">
                            {isRegister ? 'Already have an account?' : "Don't have an account?"}
                            <button
                                className="ml-2 text-primary hover:text-emerald-300 font-semibold transition-colors focus:outline-none"
                                onClick={() => setIsRegister(!isRegister)}
                            >
                                {isRegister ? 'Sign In' : 'Create One'}
                            </button>
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Login;
