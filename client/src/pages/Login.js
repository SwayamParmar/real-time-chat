import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { Slide } from 'react-toastify';
import config from '../config';
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const Login = () => {
    const navigate = useNavigate();
    const loginStore = useAuthStore((state) => state.login);
    const [isLoaded, setIsLoaded] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [inputErrors, setInputErrors] = useState({
        email: false,
        password: false,
    });

    useEffect(() => setIsLoaded(true), []);

    if (!isLoaded) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setInputErrors({ ...inputErrors, [name]: false });
    };

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleSubmit = async (e) => {
        e.preventDefault();
        let hasErrors = false;

        const showToast = (message, type = 'error') => {
            toast[type](message, {
                position: 'top-right',
                autoClose: 3000,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: type === 'error' ? 'colored' : 'dark',
                transition: Slide,
            });
        };

        if (!formData.email.trim() || !validateEmail(formData.email.trim())) {
            showToast('Please enter a valid email');
            setInputErrors((prev) => ({ ...prev, email: true }));
            hasErrors = true;
        }
        if (!formData.password) {
            showToast('Password is required');
            setInputErrors((prev) => ({ ...prev, password: true }));
            hasErrors = true;
        }

        if (hasErrors) return;

        setLoading(true);
        try {
            const response = await fetch(`${config.API_BASE_URL}/user/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to login');
            } else {
                loginStore(data);
                showToast('Logged in successfully', 'success');
                setTimeout(() => { navigate('/'); }, 500);
            }
        } catch (error) {
            showToast(error.message || 'Something went wrong');
            console.error('Login error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="min-h-screen bg-surface-base flex flex-col items-center justify-center px-4">

            {/* ── Logo ── */}
            <div className="flex items-center gap-2.5 mb-8">
                <div className="w-8 h-8 rounded-[9px] bg-brand flex items-center justify-center text-[15px] shadow-bubble">
                    💬
                </div>
                <span className="text-[19px] font-bold tracking-tight text-chat-primary">
                    Talk<span className="text-brand">Stream</span>
                </span>
            </div>

            {/* ── Card ── */}
            <div className="w-full max-w-sm bg-surface-panel border border-surface-border rounded-2xl p-8 shadow-panel">

                <h1 className="text-xl font-bold text-chat-primary mb-1">Welcome back</h1>
                <p className="text-sm text-chat-faint mb-6">Sign in to continue to TalkStream</p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-semibold text-chat-muted uppercase tracking-widest font-mono">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            className={`w-full px-4 py-2.5 rounded-xl text-sm bg-surface-raised text-chat-primary
                                placeholder:text-chat-ghost border outline-none
                                transition-colors duration-150
                                focus:border-brand focus:ring-2 focus:ring-brand/20
                                ${inputErrors.email
                                    ? 'border-red-500 ring-2 ring-red-500/20'
                                    : 'border-surface-border hover:border-surface-muted'
                                }`}
                        />
                        {inputErrors.email && (
                            <span className="text-[11px] text-red-400 font-mono">Enter a valid email address</span>
                        )}
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                            <label className="text-[11px] font-semibold text-chat-muted uppercase tracking-widest font-mono">
                                Password
                            </label>
                            <NavLink
                                to="#"
                                className="text-[12px] text-brand hover:text-chat-primary font-medium no-underline transition-colors duration-150"
                            >
                                Forgot password?
                            </NavLink>
                        </div>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                className={`w-full px-4 py-2.5 pr-11 rounded-xl text-sm bg-surface-raised text-chat-primary
                                    placeholder:text-chat-ghost border outline-none
                                    transition-colors duration-150
                                    focus:border-brand focus:ring-2 focus:ring-brand/20
                                    ${inputErrors.password
                                        ? 'border-red-500 ring-2 ring-red-500/20'
                                        : 'border-surface-border hover:border-surface-muted'
                                    }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-chat-faint hover:text-brand transition-colors duration-150"
                            >
                                {showPassword ? <FaEye size={13} /> : <FaEyeSlash size={13} />}
                            </button>
                        </div>
                        {inputErrors.password && (
                            <span className="text-[11px] text-red-400 font-mono">Password is required</span>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 rounded-xl text-sm font-semibold text-white
                            bg-brand hover:bg-brand-dark
                            disabled:opacity-60 disabled:cursor-not-allowed
                            transition-colors duration-150
                            flex items-center justify-center gap-2 mt-1"
                    >
                        {loading ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Signing in...
                            </>
                        ) : 'Sign In'}
                    </button>

                </form>
            </div>

            {/* ── Register link ── */}
            <p className="mt-5 text-sm text-chat-faint">
                Don't have an account?{' '}
                <NavLink
                    to="/register"
                    className="text-brand hover:text-chat-primary font-semibold no-underline transition-colors duration-150"
                >
                    Create one free
                </NavLink>
            </p>

        </section>
    );
};

export default Login;