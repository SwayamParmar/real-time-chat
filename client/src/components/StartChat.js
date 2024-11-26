import React from 'react'
import useMediaQuery from '../mediaQuery/useMediaQuery';
import { NavLink } from 'react-router-dom';
import { HiOutlineArrowRight } from "react-icons/hi";

const StartChar = () => {
    const isMobile = useMediaQuery(800);

    return (
        <section className="bg-[#F7F9FC] dark:bg-slate-900 transition-colors duration-300 relative px-4 sm:py-16 mb-24 w-full flex items-center justify-center">
            {/* Background with slant */}
            <div className={`${isMobile ? 'w-full py-16' : 'w-11/12 py-8'} mx-auto transition-colors duration-300`}>

                <div className={`absolute inset-0 bg-[#20B2AA] ${isMobile ? 'skew-y-3' : 'skew-y-2' } transform origin-bottom-left z-0`}></div>
                {/* Content (Message + Image) */}
                <div className={`relative z-10 max-w-7xl mx-auto ${isMobile ? 'px-0' : 'px-6'} flex flex-col md:flex-row items-center justify-between`}>
                    <div className="text-left">
                        <h1 className={`${isMobile ? 'text-3xl' : 'text-5xl'} font-bold text-[#F7F9FC] mb-4`}>
                            Start using TalkStream
                        </h1>
                        <p className={`${isMobile ? 'text-base' : 'text-xl'} text-slate-100 mb-6 `}>
                            Start using TalkStream and explore all the features.
                        </p>
                        <NavLink to="/register" className="no-underline">
                            <button className="flex text-medium gap-2 items-center text-lg text-white dark:text-white font-medium px-6 py-2 bg-[#FF6F61] hover:bg-[#fb786c] transition-colors duration-300 border-0 rounded-3xl">
                                Get Started <HiOutlineArrowRight />
                            </button>
                        </NavLink>
                    </div>

                    <div className="mt-10 md:mt-0">
                        <img src="../img/chat-landing.png" alt="Chat Application" className="w-full max-w-lg" />
                    </div>
                </div>
            </div>
        </section>
    );
}

export default StartChar;