import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { Slide } from 'react-toastify';
import useMediaQuery from '../mediaQuery/useMediaQuery';
import config from '../config';

const Signup = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const isMobile = useMediaQuery(768);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

        setInputErrors({ ...inputErrors, [name]: false }); // Clear error on change
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

        // Validate inputs
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

        // Send data to the backend
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
                // Store token and user info in localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
    
                showToast('Signup successful', 'success');
                setTimeout(() => {
                    window.location.href = '/conversations';
                }, 500);
            }
        } catch (error) {
            showToast('Something went wrong, please try again');
            console.error('Signup error:', error);
        }
    };

    return (
        <section className="relative min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 flex items-center justify-center overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute w-72 h-72 bg-blue-100 rounded-full top-10 -left-16 opacity-40 animate-pulse"></div>
            <div className="absolute w-96 h-96 bg-blue-300 rounded-full bottom-10 -right-20 opacity-30"></div>

            <div className={`${isMobile ? 'max-w-md w-11/12' : 'max-w-lg w-full'} bg-white shadow-2xl rounded-lg p-6 z-10`}>
                <h1 className="text-3xl font-bold text-center text-slate-700 mb-4">Create an Account</h1>
                <p className="text-center text-gray-600 mb-6">Join us to access amazing features!</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name:</label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 rounded-lg bg-gray-100 border ${
                                inputErrors.fullName ? 'border-red-500' : 'border-gray-100'
                            } focus:outline-none focus:ring-2 focus:ring-blue-400`}
                            placeholder="Full Name"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email:</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 rounded-lg bg-gray-100 border ${
                                inputErrors.email ? 'border-red-500' : 'border-gray-100'
                            } focus:outline-none focus:ring-2 focus:ring-blue-400`}
                            placeholder="Email"
                            required
                        />
                    </div>

                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password:</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 rounded-lg bg-gray-100 border ${
                                inputErrors.password ? 'border-red-500' : 'border-gray-100'
                            } focus:outline-none focus:ring-2 focus:ring-blue-400`}
                            placeholder="Password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute top-9 right-4 text-gray-600"
                        >
                            {showPassword ? <FaEye /> : <FaEyeSlash />}
                        </button>
                    </div>

                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password:</label>
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 rounded-lg bg-gray-100 border ${
                                inputErrors.confirmPassword ? 'border-red-500' : 'border-gray-100'
                            } focus:outline-none focus:ring-2 focus:ring-blue-400`}
                            placeholder="Confirm Password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute top-9 right-4 text-gray-600"
                        >
                            {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                        </button>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300"
                    >
                        Register
                    </button>
                </form>

                <p className="text-center text-slate-700 mt-4">
                    Already have an account?{' '}
                    <NavLink to="/login" className="text-blue-500 hover:text-blue-700">
                        Login
                    </NavLink>
                </p>
            </div>
        </section>
    );
};

export default Signup;
