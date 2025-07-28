'use client'

import Image from 'next/image';
import React from 'react';
import { useScroll } from "@/context/ScrollContext";
import Button from './button';

const HeaderNavbar: React.FC = () => {
    const { propertySectionRef } = useScroll();

    const scrollToProperty = () => {
        propertySectionRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <nav className="sticky top-0 left-0 right-0 flex items-center bg-[#FFFFFF]/50 text-[#002353] pl-[48px] pr-[46px] h-[96px] justify-between select-none border-b-2 border-[#ECF4FF] backdrop-blur-[3px] z-50">
            <div className='flex items-center gap-[48px]'>
                <div className='flex gap-[10px] items-center'>
                    <Image
                        src="/logo.svg"
                        alt="Logo"
                        width={50}
                        height={50}
                        className="inline-block mr-2"
                    />
                    <h1 className="text-[20px] font-bold">Hiraya Homes</h1>
                </div>
                <ul className="flex list-none gap-[48px] text-[16px] font-medium">
                    <li>
                        <a onClick={scrollToProperty} className="no-underline hover:underline cursor-pointer">Rent</a>
                    </li>
                    <li>
                        <a onClick={scrollToProperty} className="no-underline hover:underline cursor-pointer">Buy</a>
                    </li>
                    <li>
                        <a onClick={scrollToProperty} className="no-underline hover:underline cursor-pointer">Sell</a>
                    </li>
                </ul>
            </div>
            <div className='flex gap-[16px]'>
                <Button variant='secondary'>Login</Button>
                <Button variant='primary'>Sign up</Button>
            </div>
        </nav>
    );
};

export default HeaderNavbar;