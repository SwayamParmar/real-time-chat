import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import useMediaQuery from '../mediaQuery/useMediaQuery';
import MobileHeader from '../mobileComponents/MobileHeader';

const Header = () => {
    const [isLoaded, setIsLoaded] = useState(false);  // Add a loading state
    const isMobile = useMediaQuery(768);
    const [userName, setUserName] = useState(null); // Store user name

    // Check if user information is present in localStorage
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser?.name) {
            setUserName(storedUser.name); // Set user name if found
        }
    }, []);

    useEffect(() => {
        setIsLoaded(true); // Set loading complete after component is mounted
    }, []);

    if (!isLoaded) {
        return null; // Avoid rendering anything until loaded
    }

    const WebHeader = () => {
        return (
            <div className="text-center relative">
                <header className="relative top-0 left-0 w-full z-50 bg-white dark:bg-gray-900 flex items-center justify-between p-2 transition-colors duration-300">
                    <div className="w-11/12 mx-auto flex items-center justify-between transition-colors duration-300">
                        <div className="flex items-center space-x-4 transition-colors duration-300">
                            <img src="../img/logo.png" alt="TalkStream logo" className='w-12 h-12' />
                            <NavLink to="/" className="no-underline">
                                <span className="text-xl text-slate-700 dark:text-white font-bold">TalkStream</span>
                            </NavLink>
                        </div>
                        <nav className="flex items-center space-x-4 transition-colors duration-300">
                        {!userName ? (
                            <>
                                <NavLink to="/login" className="no-underline">
                                    <button className="text-base text-slate-700 dark:text-white font-medium px-4 py-2 hover:bg-[#f4f5f9] hover:text-slate-800 transition-colors duration-300 border-0 rounded-2xl">
                                        Login
                                    </button>
                                </NavLink>
                                <NavLink to="/register" className="no-underline">
                                    <button className="text-base text-white dark:text-white font-medium px-4 py-2 bg-[#4169E1] hover:bg-[#527bf4] transition-colors duration-300 border-0 rounded-xl">
                                        Create an account
                                    </button>
                                </NavLink>
                            </>
                        ) : (
                            <span className="text-base text-slate-700 bg-[#f4f5f9] dark:text-white font-semibold px-4 py-2 rounded-2xl">
                                {userName}
                            </span>
                        )}
                        </nav>
                    </div>
                </header>
            </div>
        );
    };

    return (
        <>
            {isMobile ? <MobileHeader /> : <WebHeader />}
        </>
    );
};

export default Header;
