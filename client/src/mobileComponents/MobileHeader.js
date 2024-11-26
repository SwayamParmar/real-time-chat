import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

const MobileHeader = () => {
    const [userName, setUserName] = useState(null); // Store user name

    // Check if user information is present in localStorage
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser?.name) {
            setUserName(storedUser.name); // Set user name if found
        }
    }, []);

    return (
        <div className={`text-center`}>
            <header className="relative top-0 left-0 w-full z-50 bg-white dark:bg-gray-900 py-2 px-4 shadow-sm flex items-center justify-between transition-colors duration-300">
                <div className="flex items-center space-x-2 transition-colors duration-300">
                    <img src="../img/logo.png" alt="TalkStream logo" className='w-12 h-12' />
                    <NavLink to="/" className="no-underline">
                        <span className="text-xl text-slate-700 dark:text-white font-bold">TalkStream</span>
                    </NavLink>
                </div>
                {!userName ? (
                    <>
                        <NavLink to="/login" className="no-underline">
                            <button className="text-base text-slate-800 dark:text-white font-medium px-4 py-2 bg-[#dbe0f4] transition-colors duration-300 border-0 rounded-2xl">
                                Login
                            </button>
                        </NavLink>
                    </>
                ) : (
                    <span className="text-base text-slate-700 bg-[#f4f5f9] dark:text-white font-medium px-4 py-2 rounded-2xl">
                        {userName}
                    </span>
                )}
            </header>
        </div>
    );
}

export default MobileHeader;
