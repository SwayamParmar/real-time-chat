import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { FiEye, FiEyeOff, FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { Slide } from 'react-toastify';
import config from '../config';
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import AuthShell from '../components/AuthShell';

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
            // A non-JSON body (proxy error page, gateway timeout) must not
            // throw before the status has been read — that turned every
            // failure into an opaque parse error instead of a real message.
            const data = await response.json().catch(() => ({}));
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
        <AuthShell
            title="Welcome back"
            subtitle="Sign in to pick up where you left off."
            footer={
                <>
                    Don&apos;t have an account?{' '}
                    <NavLink
                        to="/register"
                        className="font-semibold no-underline transition-colors duration-150"
                        style={{ color: 'var(--brand)' }}
                    >
                        Create one free
                    </NavLink>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">

                {/* ── Email ── */}
                <div className="auth-field">
                    <label htmlFor="login-email" className="auth-label">
                        Email
                    </label>
                    <div className="auth-input-wrap">
                        <span className="auth-icon">
                            <FiMail size={16} aria-hidden="true" />
                        </span>
                        <input
                            id="login-email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            autoComplete="email"
                            aria-invalid={inputErrors.email || undefined}
                            className={`auth-input ${inputErrors.email ? 'is-error' : ''}`}
                        />
                    </div>
                    {inputErrors.email && (
                        <span className="auth-error">Enter a valid email address</span>
                    )}
                </div>

                {/* ── Password ── */}
                <div className="auth-field">
                    <div className="flex items-center justify-between gap-3">
                        <label htmlFor="login-password" className="auth-label">
                            Password
                        </label>
                        <NavLink
                            to="#"
                            className="text-[12.5px] font-medium no-underline transition-colors duration-150"
                            style={{ color: 'var(--brand)' }}
                        >
                            Forgot password?
                        </NavLink>
                    </div>
                    <div className="auth-input-wrap">
                        <span className="auth-icon">
                            <FiLock size={16} aria-hidden="true" />
                        </span>
                        <input
                            id="login-password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            aria-invalid={inputErrors.password || undefined}
                            className={`auth-input has-trailing ${inputErrors.password ? 'is-error' : ''}`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="auth-toggle"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? <FiEye size={16} /> : <FiEyeOff size={16} />}
                        </button>
                    </div>
                    {inputErrors.password && (
                        <span className="auth-error">Password is required</span>
                    )}
                </div>

                {/* ── Submit ── */}
                <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary auth-submit"
                >
                    {loading ? (
                        <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Signing in...
                        </>
                    ) : (
                        <>
                            Sign In
                            <FiArrowRight size={16} aria-hidden="true" />
                        </>
                    )}
                </button>

            </form>
        </AuthShell>
    );
};

export default Login;
