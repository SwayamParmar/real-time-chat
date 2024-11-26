import React, { useState, useEffect } from 'react';
import useMediaQuery from '../mediaQuery/useMediaQuery';

const Footer = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const isMobile = useMediaQuery(768);

    useEffect(() => setIsLoaded(true), []);

    if (!isLoaded) return null;

    return (
        <footer className="bg-[#1F2937] text-gray-300 py-6">
            <div className={`w-11/12 mx-auto flex items-center justify-between ${isMobile ? 'flex-col gap-3' : 'flex-row' } transition-colors duration-300`}>
                {/* Left Section - Copyright */}
                <div className={`${isMobile ? 'text-sm' : 'text-medium' }`}>
                    &copy; {new Date().getFullYear()} TalkStream. All Rights Reserved.
                </div>

                {/* Right Section - Links */}
                <div className="space-x-4">
                    <a href="/privacy-policy" className={`${isMobile ? 'text-sm' : 'text-medium' } hover:text-white transition-colors duration-300`}>
                        Privacy Policy
                    </a>
                    <a href="/terms-of-service" className={`${isMobile ? 'text-sm' : 'text-medium' } hover:text-white transition-colors duration-300`}>
                        Terms of Service
                    </a>
                    <a href="/contact" className={`${isMobile ? 'text-sm' : 'text-medium' } hover:text-white transition-colors duration-300`}>
                        Contact Us
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
