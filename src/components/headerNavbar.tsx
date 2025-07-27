import Image from 'next/image';
import React from 'react';
import Button from './button';

const HeaderNavbar: React.FC = () => {
    return (
        <nav className="sticky z-10 top-0 left-0 right-0 flex items-center bg-[#FFFFFF]/50 text-[#002353] pl-[48px] pr-[46px] h-[96px] justify-between select-none border-b-2 border-[#ECF4FF] backdrop-blur-[3px] z-50">
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
                        <a href="/rent" className="no-underline hover:underline">Rent</a>
                    </li>
                    <li>
                        <a href="/buy" className="no-underline hover:underline">Buy</a>
                    </li>
                    <li>
                        <a href="/sell" className="no-underline hover:underline">Sell</a>
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