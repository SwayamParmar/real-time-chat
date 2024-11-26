import React, { useState, useEffect } from 'react';
import useMediaQuery from '../mediaQuery/useMediaQuery';
import { NavLink } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { Slide } from 'react-toastify';
import config from '../config';

const Login = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const isMobile = useMediaQuery(768);
    const [showPassword, setShowPassword] = useState(false);

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
                // Store token and user info in localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                showToast('Logged in successfully', 'success');
                setTimeout(() => {
                    window.location.href = '/conversations';
                }, 500);
            }
        } catch (error) {
            showToast(error.message || 'Something went wrong');
            console.error('Login error:', error);
        }
    };

    return (
        <section className="relative min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 flex items-center justify-center overflow-hidden px-4">
            {/* Decorative Bubbles */}
            <div className={`absolute ${isMobile ? 'w-48 h-48' : 'w-72 h-72'} bg-blue-200 rounded-full top-5 md:top-10 -left-10 md:-left-16 opacity-30 animate-pulse`}></div>
            <div className={`absolute ${isMobile ? 'w-64 h-64' : 'w-96 h-96'} bg-blue-400 rounded-full bottom-8 -right-10 md:-right-20 opacity-20`}></div>

            <div className={`w-full ${isMobile ? 'max-w-sm' : 'max-w-lg'} bg-white shadow-2xl rounded-xl p-6 sm:p-8 transform transition-all duration-300 hover:shadow-xl`}>
                <h1 className={`text-${isMobile ? '2xl' : '3xl'} font-bold text-slate-700 text-center mb-3 fade-in`}>
                    Welcome Back
                </h1>
                <div className="text-center mb-2">
                    <span className="text-sm font-medium text-gray-600">
                        New here?
                    </span>
                    <NavLink to="/register" className="ml-1 text-sm text-blue-500 hover:text-blue-700 transition-colors">
                        Register Now
                    </NavLink>
                </div>
                <p className={`text-${isMobile ? 'xs' : 'sm'} text-center text-gray-500 mb-6 font-semibold fade-in`}>
                    Sign in to continue
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                            Email:
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 rounded-lg bg-gray-100 border ${
                                inputErrors.email ? 'border-red-500' : 'border-gray-100'
                            } focus:outline-none focus:ring-2 focus:ring-blue-400`}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="relative">
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                            Password:
                        </label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 rounded-lg bg-gray-100 border ${
                                inputErrors.password ? 'border-red-500' : 'border-gray-100'
                            } focus:outline-none focus:ring-2 focus:ring-blue-400`}
                            placeholder="Enter your password"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute top-9 right-4 text-gray-600">
                            {showPassword ? <FaEye /> : <FaEyeSlash />}
                        </button>
                    </div>

                    <div className="flex justify-between items-center">
                        <NavLink to="#" className={`text-${isMobile ? 'xs' : 'sm'} text-blue-500 hover:text-blue-700 transition-colors font-medium`}>
                            Forgot Password?
                        </NavLink>
                        <button type="submit" className="px-4 py-2 bg-[#4169E1] text-white rounded-lg hover:bg-[#527bf4] transition duration-300">
                            Login
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
};

export default Login;
