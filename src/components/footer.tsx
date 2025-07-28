'use client';

import { useRef } from "react";
import { useInView, motion } from "framer-motion";
import Image from "next/image";

const Footer: React.FC = () => {
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

    return (
        <motion.section
            ref={sectionRef}
            id="serviceSection"
            className="flex flex-col bg-white h-fit w-full text-center items-center justify-center pt-[80px]"
            initial={{ opacity: 0, y: 0 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: "easeOut" }}
        >
            <div className="flex flex-row gap-[88px] text-[#002353] items-start px-[160px] mb-[48px]">
                <div className='flex gap-[10px] w-fit mr-[20px]'>
                    <Image
                        src="/logo.svg"
                        alt="Logo"
                        width={39}
                        height={24}
                        className="inline-block mr-2"
                    />
                    <h1 className="text-[20px] font-bold whitespace-nowrap">Hiraya Homes</h1>
                </div>
                <div className='flex flex-col gap-[48px] justify-start items-start w-[200px] text-left'>
                    <div className="flex flex-col gap-[16px]">
                        <h1 className="text-[16px] font-bold whitespace-nowrap leading-[150%]">SELL A HOME</h1>
                        <ul className="text-[16px] font-medium whitespace-nowrap leading-[38px] opacity-70">
                            <li className="cursor-pointer hover:underline">Request an offer</li>
                            <li className="cursor-pointer hover:underline">Pricing</li>
                            <li className="cursor-pointer hover:underline">Reviews</li>
                            <li className="cursor-pointer hover:underline">Stories</li>
                        </ul>
                    </div>
                    <div className="flex flex-col gap-[16px]">
                        <h1 className="text-[16px] font-bold whitespace-nowrap leading-[150%]">BUY A HOME</h1>
                        <ul className="text-[16px] font-medium whitespace-nowrap leading-[38px] opacity-70">
                            <li className="cursor-pointer hover:underline">Buy</li>
                            <li className="cursor-pointer hover:underline">Finance</li>
                        </ul>
                    </div>
                </div>
                <div className='flex flex-col gap-[48px] justify-start items-start w-[200px] text-left'>
                    <div className="flex flex-col gap-[16px]">
                        <h1 className="text-[16px] font-bold whitespace-nowrap leading-[150%]">BUY, RENT AND SELL</h1>
                        <ul className="text-[16px] font-medium whitespace-nowrap leading-[38px] opacity-70">
                            <li className="cursor-pointer hover:underline">Buy and sell properties</li>
                            <li className="cursor-pointer hover:underline">Rent home</li>
                            <li className="cursor-pointer hover:underline">Builder trade-up</li>
                        </ul>
                    </div>
                    <div className="flex flex-col gap-[16px]">
                        <h1 className="text-[16px] font-bold whitespace-nowrap leading-[150%]">TERMS AND PRIVACY</h1>
                        <ul className="text-[16px] font-medium whitespace-nowrap leading-[38px] opacity-70">
                            <li className="cursor-pointer hover:underline">Trust & Safety</li>
                            <li className="cursor-pointer hover:underline">Terms of Service</li>
                            <li className="cursor-pointer hover:underline">Privacy Policy</li>
                        </ul>
                    </div>
                </div>
                <div className='flex flex-col gap-[48px] justify-start items-start w-[200px] text-left'>
                    <div className="flex flex-col gap-[16px]">
                        <h1 className="text-[16px] font-bold whitespace-nowrap leading-[150%]">ABOUT</h1>
                        <ul className="text-[16px] font-medium whitespace-nowrap leading-[38px] opacity-70">
                            <li className="cursor-pointer hover:underline">Company</li>
                            <li className="cursor-pointer hover:underline">How it works</li>
                            <li className="cursor-pointer hover:underline">Contact</li>
                            <li className="cursor-pointer hover:underline">Investor</li>
                        </ul>
                    </div>
                    <div className="flex flex-col gap-[16px]">
                        <h1 className="text-[16px] font-bold whitespace-nowrap leading-[150%]">RESOURCES</h1>
                        <ul className="text-[16px] font-medium whitespace-nowrap leading-[38px] opacity-70">
                            <li className="cursor-pointer hover:underline">Blog</li>
                            <li className="cursor-pointer hover:underline">Guides</li>
                            <li className="cursor-pointer hover:underline">FAQ</li>
                            <li className="cursor-pointer hover:underline">Help Center</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="bg-[#ECF4FF] h-[1.5px] w-full" />
            <div className="flex flex-row justify-between text-[#002353] opacity-50 px-[160px] py-[32px] w-full">
                <h1 className="text-[16px] font-medium leading-[160%]">©2025 Hiraya Homes. All rights reserved.</h1>
                <div className="flex gap-[40px]">
                    <Image src="/footer/fb.svg" alt={"facebook"} width={24} height={24} className="cursor-pointer" />
                    <Image src="/footer/ig.svg" alt={"instagram"} width={24} height={24} className="cursor-pointer" />
                    <Image src="/footer/twt.svg" alt={"twitter"} width={24} height={24} className="cursor-pointer" />
                    <Image src="/footer/li.svg" alt={"linkedin"} width={24} height={24} className="cursor-pointer" />
                </div>
            </div>
        </motion.section>
    );
};

export default Footer;
