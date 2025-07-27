'use client';

import { motion, useAnimationFrame } from 'framer-motion';
import { useRef } from 'react';

const cards = [
    {
        title: 'Virtual home tour',
        text: 'You can communicate directly with landlords and we provide you with virtual tour before you buy or rent the property.',
        svg: (
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M12 29.3334H20C26.6667 29.3334 29.3334 26.6667 29.3334 20.0001V12.0001C29.3334 5.33341 26.6667 2.66675 20 2.66675H12C5.33335 2.66675 2.66669 5.33341 2.66669 12.0001V20.0001C2.66669 26.6667 5.33335 29.3334 12 29.3334Z" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12.1333 15.9997V14.0264C12.1333 11.4797 13.9333 10.4531 16.1333 11.7197L17.84 12.7064L19.5466 13.6931C21.7466 14.9597 21.7466 17.0397 19.5466 18.3064L17.84 19.2931L16.1333 20.2797C13.9333 21.5464 12.1333 20.5064 12.1333 17.9731V15.9997Z" stroke="white" strokeWidth="3" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
        className: 'bg-white/20 text-white',
        divClassName: 'bg-[#002353]',
    },
    {
        title: 'Find the best deal',
        text: 'Browse thousands of properties, save your favorites and set up search alerts so you don’t miss the best home deal!',
        svg: (
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
                <g clipPath="url(#clip0_7_1008)">
                    <path d="M5.62965 16.0001H2.66669L16 2.66675L29.3334 16.0001H26.3704" stroke="#3871C1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M5.62964 16V26.3704C5.62964 27.1562 5.94181 27.9098 6.49747 28.4655C7.05313 29.0212 7.80678 29.3333 8.5926 29.3333H23.4074C24.1932 29.3333 24.9469 29.0212 25.5025 28.4655C26.0582 27.9098 26.3704 27.1562 26.3704 26.3704V16" stroke="#3871C1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 18.0002L14.6667 20.6668L20 15.3335" stroke="#3871C1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </g>
                <defs>
                    <clipPath id="clip0_7_1008">
                        <rect width="32" height="32" fill="white" />
                    </clipPath>
                </defs>
            </svg>
        ),
        className: 'bg-white text-[#002353]',
        divClassName: 'bg-[#D2E4FF]',
        innerDivClassName: 'bg-[#ECF4FF]  border-[3px] border-white w-[62px] h-[62px]',
    },
    {
        title: 'Get financing',
        text: 'Find your dream house? You just need to do a little to no effort and you can start move in to your new dream home!',
        svg: (
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M28 9.33341V22.6667C28 26.6667 26 29.3334 21.3333 29.3334H10.6667C6 29.3334 4 26.6667 4 22.6667V9.33341C4 5.33341 6 2.66675 10.6667 2.66675H21.3333C26 2.66675 28 5.33341 28 9.33341Z" stroke="#3871C1" strokeWidth="3" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M19.3334 6V8.66667C19.3334 10.1333 20.5334 11.3333 22 11.3333H24.6667" stroke="#3871C1" strokeWidth="3" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10.6666 17.3333H16" stroke="#3871C1" strokeWidth="3" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10.6666 22.6667H21.3333" stroke="#3871C1" strokeWidth="3" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
        className: 'bg-[#3871C1] text-white',
        divClassName: 'bg-[#D2E4FF]',
        innerDivClassName: 'bg-white w-[60px] h-[60px]',
    },
];

const ScrollingCards: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const x = useRef(0);

    useAnimationFrame((t, delta) => {
        const container = containerRef.current;
        if (!container) return;

        x.current -= delta * 0.05;
        const width = container.scrollWidth / 2;
        if (Math.abs(x.current) >= width) x.current = 0;

        container.style.transform = `translateX(${x.current}px)`;
    });

    return (
        <div className="overflow-hidden w-full relative px-[160px]">
            <motion.div
                ref={containerRef}
                className="flex gap-[32px] will-change-transform"
            >
                {[...cards, ...cards].map((card, i) => (
                    <div
                        key={i}
                        className={`flex w-[536px] min-w-[536px] h-[194px] p-8 rounded-lg text-left gap-[24px] hover:scale-[97%] transition-all duration-300 ease-out cursor-pointer ${card.className}`}
                    >
                        <div className={`w-[64px] h-[64px] flex items-center justify-center rounded-full flex-shrink-0 ${card.divClassName}`}>
                            <div className={`rounded-full flex items-center justify-center ${card.innerDivClassName}`}>
                                {card.svg}
                            </div>
                        </div>
                        <div className="flex flex-col gap-[16px]">
                            <h3 className="text-[24px] font-bold leading-[150%]">{card.title}</h3>
                            <p className="text-[16px] font-normal opacity-70 leading-[160%]">{card.text}</p>
                        </div>
                    </div>
                ))}
            </motion.div>
        </div>
    );
};

export default ScrollingCards;
