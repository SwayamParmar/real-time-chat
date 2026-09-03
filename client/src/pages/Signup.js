import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { FiEye, FiEyeOff, FiUser, FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { Slide } from 'react-toastify';
import config from '../config';
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import AuthShell from '../components/AuthShell';

const Signup = () => {
    const navigate = useNavigate();
    const loginStore = useAuthStore((state) => state.login);
    const [isLoaded, setIsLoaded] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [inputErrors, setInputErrors] = useState({
        name: false,
        email: false,
        password: false,
        confirmPassword: false,
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

        if (!formData.name.trim()) {
            showToast('Full Name is required');
            setInputErrors((prev) => ({ ...prev, name: true }));
            hasErrors = true;
        }
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
        if (formData.password !== formData.confirmPassword) {
            const message = formData.confirmPassword ? 'Passwords do not match' : 'Confirm Password is required';
            showToast(message);
            setInputErrors((prev) => ({ ...prev, confirmPassword: true }));
            hasErrors = true;
        }

        if (hasErrors) return;

        setLoading(true);
        try {
            const response = await fetch(`${config.API_BASE_URL}/user/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            // A non-JSON body (proxy error page, gateway timeout) must not
            // throw before the status has been read.
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                showToast(data.message || 'Signup failed');
            } else {
                loginStore(data);
                showToast('Signup Successfull', 'success');
                setTimeout(() => { navigate('/'); }, 500);
            }
        } catch (error) {
            showToast('Something went wrong, please try again');
            console.error('Signup error:', error);
        } finally {
            setLoading(false);
        }
    };

    /* ── Reusable password eye toggle ── */
    const EyeToggle = ({ show, onToggle }) => (
        <button
            type="button"
            onClick={onToggle}
            className="auth-toggle"
            aria-label={show ? 'Hide password' : 'Show password'}
        >
            {show ? <FiEye size={16} /> : <FiEyeOff size={16} />}
        </button>
    );

    return (
        <AuthShell
            title="Create an account"
            subtitle="Free forever — you'll be chatting in seconds."
            footer={
                <>
                    Already have an account?{' '}
                    <NavLink
                        to="/login"
                        className="font-semibold no-underline transition-colors duration-150"
                        style={{ color: 'var(--brand)' }}
                    >
                        Sign in
                    </NavLink>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">

                {/* ── Full Name ── */}
                <div className="auth-field">
                    <label htmlFor="signup-name" className="auth-label">
                        Full Name
                    </label>
                    <div className="auth-input-wrap">
                        <span className="auth-icon">
                            <FiUser size={16} aria-hidden="true" />
                        </span>
                        <input
                            id="signup-name"
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Your full name"
                            autoComplete="name"
                            aria-invalid={inputErrors.name || undefined}
                            className={`auth-input ${inputErrors.name ? 'is-error' : ''}`}
                        />
                    </div>
                    {inputErrors.name && (
                        <span className="auth-error">Full name is required</span>
                    )}
                </div>

                {/* ── Email ── */}
                <div className="auth-field">
                    <label htmlFor="signup-email" className="auth-label">
                        Email
                    </label>
                    <div className="auth-input-wrap">
                        <span className="auth-icon">
                            <FiMail size={16} aria-hidden="true" />
                        </span>
                        <input
                            id="signup-email"
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
                    <label htmlFor="signup-password" className="auth-label">
                        Password
                    </label>
                    <div className="auth-input-wrap">
                        <span className="auth-icon">
                            <FiLock size={16} aria-hidden="true" />
                        </span>
                        <input
                            id="signup-password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Create a password"
                            autoComplete="new-password"
                            aria-invalid={inputErrors.password || undefined}
                            className={`auth-input has-trailing ${inputErrors.password ? 'is-error' : ''}`}
                        />
                        <EyeToggle show={showPassword} onToggle={() => setShowPassword(!showPassword)} />
                    </div>
                    {inputErrors.password && (
                        <span className="auth-error">Password is required</span>
                    )}
                </div>

                {/* ── Confirm Password ── */}
                <div className="auth-field">
                    <label htmlFor="signup-confirm-password" className="auth-label">
                        Confirm Password
                    </label>
                    <div className="auth-input-wrap">
                        <span className="auth-icon">
                            <FiLock size={16} aria-hidden="true" />
                        </span>
                        <input
                            id="signup-confirm-password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Repeat your password"
                            autoComplete="new-password"
                            aria-invalid={inputErrors.confirmPassword || undefined}
                            className={`auth-input has-trailing ${inputErrors.confirmPassword ? 'is-error' : ''}`}
                        />
                        <EyeToggle show={showConfirmPassword} onToggle={() => setShowConfirmPassword(!showConfirmPassword)} />
                    </div>
                    {inputErrors.confirmPassword && (
                        <span className="auth-error">
                            {formData.confirmPassword ? 'Passwords do not match' : 'Please confirm your password'}
                        </span>
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
                            Creating account...
                        </>
                    ) : (
                        <>
                            Create Account
                            <FiArrowRight size={16} aria-hidden="true" />
                        </>
                    )}
                </button>

            </form>
        </AuthShell>
    );
};

export default Signup;
