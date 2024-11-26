import React from 'react';
import { FaUser, FaUsers, FaList, FaCog, FaMoon, FaSun } from 'react-icons/fa';
import { BsChatDots } from 'react-icons/bs';
import { useState } from 'react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import "tippy.js/themes/light.css";

const ConversationHeader = ({ onSelectUser }) => {
    const [darkMode, setDarkMode] = useState(false);

    const toggleDarkMode = () => {
        setDarkMode((prevMode) => !prevMode);
        document.documentElement.classList.toggle('dark'); // Tailwind's dark mode toggle
    };
    const iconsData = [
        { icon: <FaUser className="text-gray-400 w-5 h-5 hover:text-purple-500" />, content: "Profile" },
        { icon: <BsChatDots className="text-gray-400 w-5 h-5 hover:text-purple-500" />, content: "Conversations" },
        { icon: <FaUsers className="text-gray-400 w-5 h-5 hover:text-purple-500" />, content: "Groups" },
        { icon: <FaList className="text-gray-400 w-5 h-5 hover:text-purple-500" />, content: "Activity" },
        { icon: <FaCog className="text-gray-400 w-5 h-5 hover:text-purple-500" />, content: "Settings" }
    ];

    return (
        <section className="relative flex flex-col items-center w-20 bg-white dark:bg-gray-900 border-r py-4" style={{ boxShadow: '0 2px 4px rgba(15,34,58,.12)' }}>
            {/* Logo at the Top */}
            <div className="mb-8 h-24">
                <img src="../img/logo.png" alt="Chat App Logo" className="w-10 h-10 rounded-full" />
            </div>

            {/* Navigation Icons */}
            <div className="flex flex-col items-center space-y-2 flex-1 w-full">
                {
                    iconsData.map((item, index) => (
                        <Tippy key={index} content={item.content} placement="right">
                            <div className='w-14 h-14 flex justify-center items-center bg-[#f2f2f2] rounded-xl cursor-pointer'>
                                {item.icon}
                            </div>
                        </Tippy>
                    ))
                }
            </div>

            {/* Profile Picture and Dark Mode Toggle at the Bottom */}
            <div className="flex flex-col items-center space-y-4 mt-8">
                <Tippy content={darkMode ? "Light Mode" : "Dark Mode"} placement="right">
                    <div className='w-14 h-14 flex justify-center items-center bg-[#f2f2f2] rounded-xl cursor-pointer' onClick={toggleDarkMode}>
                        {darkMode ? (
                            <FaSun className="text-gray-400 w-5 h-5 hover:text-yellow-500" />
                        ) : (
                            <FaMoon className="text-gray-400 w-5 h-5 hover:text-purple-500" />
                        )}
                    </div>
                </Tippy>
                <img src="../img/logo.png" alt="Profile" className="w-14 h-14 rounded-full border border-gray-300" />
            </div>
        </section>
    );
};

export default ConversationHeader;
