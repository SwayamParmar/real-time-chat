import React from 'react';
import useMediaQuery from '../mediaQuery/useMediaQuery';
import { NavLink } from 'react-router-dom';
import { HiOutlineArrowRight } from "react-icons/hi";

const HeroSection = () => {
    const isMobile = useMediaQuery(800);

    return (
        <section className='bg-[#F7F9FC] dark:bg-gray-900 transition-colors duration-300'>
            <div className={`bg-[#F7F9FC] dark:bg-gray-900 ${isMobile ? 'w-full' : 'w-11/12'} py-8 mx-auto px-4 mt-10 sm:py-16 lg:py-16 transition-colors duration-300`}>
                <div className={`flex ${isMobile ? 'flex-col gap-6' : 'flex gap-12'} lg:flex-row items-center justify-between lg:space-x-8 transition-colors duration-300`}>
                    <div className="w-full sm:w-1/1 mt-8 lg:mt-0 transition-colors duration-300">
                        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-[#1F2937] dark:text-white mb-4 transition-colors duration-300">
                            The Talk<span className='text-[#FF6F61]'>Stream,</span>
                        </h1>
                        <p className={`${isMobile ? 'w-full' : 'w-8/12' } tracking-wide text-lg sm:text-xl lg:text-base text-gray-600 dark:text-gray-400 mb-6 text-justify transition-colors duration-300`}>
                            I'm an aspiring Web Developer seeking an opportunity to apply my passion for web development,
                            strong problem-solving skills.
                        </p>

                        <div className="flex items-start mb-6 transition-colors duration-300">
                            <NavLink to="/register" className="no-underline">
                                <button className="flex text-medium gap-2 items-center text-lg text-white dark:text-white font-medium px-6 py-2 bg-[#FF6F61] hover:bg-[#fb786c] transition-colors duration-300 border-0 rounded-3xl">
                                    Get Started <HiOutlineArrowRight />
                                </button>
                            </NavLink>
                        </div>
                    </div>

                    <div className={`w-full h-full flex ${isMobile ? 'justify-start' : 'justify-center'}`}>
                        <img src="../img/chat.png" alt="Chat" className="relative w-full h-full sm:w-full sm:h-full" />
                    </div>
                </div>
            </div>
        </section>
    );
};


export default HeroSection;
