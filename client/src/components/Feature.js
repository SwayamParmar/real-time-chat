import React from 'react'
import useMediaQuery from '../mediaQuery/useMediaQuery';
import { IoIosStar } from "react-icons/io";
import { TiMessages } from "react-icons/ti";
import { FcPrivacy } from "react-icons/fc";
import { IoSettingsSharp } from "react-icons/io5";
import { cloneElement } from 'react';

const services = [
    {
        icon: <IoIosStar />,
        title: "Beautiful Design",
        description: "A modern, sleek interface designed for an intuitive and enjoyable user experience.",
        'color': 'text-[#5dd8d3]'
    },
    {
        icon: <TiMessages />,
        title: "Real-time Conversations",
        description: "Engage in seamless real-time chats with features like file sharing, media uploads, read receipts, and more.",
        'color': 'text-[#9364d4]'
    },
    {
        icon: <FcPrivacy />,
        title: "Privacy First",
        description: "Built with privacy in mind. Self-host your chat and retain full control over your data and communication.",
        'color': 'text-[#ee539b]'
    },
    {
        icon: <IoSettingsSharp />,
        title: "Effortless Setup",
        description: "Get started quickly with an easy setup process, supported by detailed documentation. No unnecessary complexity.",
        'color': 'text-[#fddd6e]'
    }
];

const Feature = () => {
    const isMobile = useMediaQuery(800);

    return (
        <section className='bg-[#F7F9FC] dark:bg-slate-900 transition-colors duration-300'>
            <div className={`${isMobile ? 'w-full py-16' : 'w-11/12 py-8'} mx-auto px-4 sm:py-16 transition-colors duration-300`}>
                <div className={`grid grid-cols-1 md:grid-cols-4 mx-auto`}>
                    {
                        services.map((service, index) => (
                            <div key={index} className={`w-full mx-auto dark:bg-slate-700 p-6 rounded-lg transition-colors duration-300`}>
                                <div className="flex flex-col items-center">
                                    <div className="h-12 w-12 flex items-center justify-center mb-3">
                                        {cloneElement(service.icon, { className: `h-12 w-12 ${service.color}` })}
                                    </div>
                                    <span className="font-semibold text-base text-[#1F2937] dark:text-gray-200 mb-2 uppercase tracking-normal">{service.title}</span>
                                    <p className="text-gray-500 font-medium dark:text-gray-300 text-center tracking-normal">{service.description}</p>
                                </div>  
                            </div>
                        ))
                    }
                </div>
            </div>
        </section>
    );
}

export default Feature;