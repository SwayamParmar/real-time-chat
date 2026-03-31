import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { Slide } from 'react-toastify';
import config from '../config';
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const Signup = () => {
    const navigate = useNavigate();
    const loginStore = useAuthStore((state) => state.login);
    const [isLoaded, setIsLoaded] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [inputErrors, setInputErrors] = useState({
        fullName: false,
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

        if (!formData.fullName.trim()) {
            showToast('Full Name is required');
            setInputErrors((prev) => ({ ...prev, fullName: true }));
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
            const data = await response.json();
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
            className="absolute right-3 top-1/2 -translate-y-1/2 text-chat-faint hover:text-brand transition-colors duration-150"
        >
            {show ? <FaEye size={13} /> : <FaEyeSlash size={13} />}
        </button>
    );

    return (
        <section className="min-h-screen bg-surface-base flex flex-col items-center justify-center px-4 py-10">

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

                <h1 className="text-xl font-bold text-chat-primary mb-1">Create an account</h1>
                <p className="text-sm text-chat-faint mb-6">Join TalkStream — free, always.</p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                    {/* Full Name */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-semibold text-chat-muted uppercase tracking-widest font-mono">
                            Full Name
                        </label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="Your full name"
                            className={`w-full px-4 py-2.5 rounded-xl text-sm bg-surface-raised text-chat-primary
                                placeholder:text-chat-ghost border outline-none
                                transition-colors duration-150
                                focus:border-brand focus:ring-2 focus:ring-brand/20
                                ${inputErrors.fullName
                                    ? 'border-red-500 ring-2 ring-red-500/20'
                                    : 'border-surface-border hover:border-surface-muted'
                                }`}
                        />
                        {inputErrors.fullName && (
                            <span className="text-[11px] text-red-400 font-mono">Full name is required</span>
                        )}
                    </div>

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
                        <label className="text-[11px] font-semibold text-chat-muted uppercase tracking-widest font-mono">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Create a password"
                                className={`w-full px-4 py-2.5 pr-11 rounded-xl text-sm bg-surface-raised text-chat-primary
                                    placeholder:text-chat-ghost border outline-none
                                    transition-colors duration-150
                                    focus:border-brand focus:ring-2 focus:ring-brand/20
                                    ${inputErrors.password
                                        ? 'border-red-500 ring-2 ring-red-500/20'
                                        : 'border-surface-border hover:border-surface-muted'
                                    }`}
                            />
                            <EyeToggle show={showPassword} onToggle={() => setShowPassword(!showPassword)} />
                        </div>
                        {inputErrors.password && (
                            <span className="text-[11px] text-red-400 font-mono">Password is required</span>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-semibold text-chat-muted uppercase tracking-widest font-mono">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Repeat your password"
                                className={`w-full px-4 py-2.5 pr-11 rounded-xl text-sm bg-surface-raised text-chat-primary
                                    placeholder:text-chat-ghost border outline-none
                                    transition-colors duration-150
                                    focus:border-brand focus:ring-2 focus:ring-brand/20
                                    ${inputErrors.confirmPassword
                                        ? 'border-red-500 ring-2 ring-red-500/20'
                                        : 'border-surface-border hover:border-surface-muted'
                                    }`}
                            />
                            <EyeToggle show={showConfirmPassword} onToggle={() => setShowConfirmPassword(!showConfirmPassword)} />
                        </div>
                        {inputErrors.confirmPassword && (
                            <span className="text-[11px] text-red-400 font-mono">
                                {formData.confirmPassword ? 'Passwords do not match' : 'Please confirm your password'}
                            </span>
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
                                Creating account...
                            </>
                        ) : 'Create Account'}
                    </button>

                </form>
            </div>

            {/* ── Login link ── */}
            <p className="mt-5 text-sm text-chat-faint">
                Already have an account?{' '}
                <NavLink
                    to="/login"
                    className="text-brand hover:text-chat-primary font-semibold no-underline transition-colors duration-150"
                >
                    Sign in
                </NavLink>
            </p>

        </section>
    );
};

export default Signup;