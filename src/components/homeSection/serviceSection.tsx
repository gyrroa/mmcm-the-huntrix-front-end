'use client';

import { useRef } from "react";
import { useInView, motion } from "framer-motion";
import ScrollingCards from "../ui/home/ScrollingCards";
import { ReactTyped } from "react-typed";
import AnimatedNumber from "../ui/home/AnimatedNumber";

const ServiceSection: React.FC = () => {
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

    return (
        <motion.section
            ref={sectionRef}
            id="serviceSection"
            // Mobile defaults + exact original restored on lg+
            className="flex min-h-screen lg:min-h-dvh w-full flex-col items-center justify-center gap-10 lg:gap-[64px] lg:pb-[100px] bg-[#002353] text-center py-20"
            initial={{ opacity: 0, y: 0 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: "easeOut" }}
        >
            {/* Header with Typing Animation */}
            <div className="w-full px-4 sm:px-6 md:px-10 lg:px-[160px]">
                <div className="flex flex-col lg:flex-row lg:justify-between text-white gap-6 lg:gap-0 text-center lg:text-left">
                    <h1 className="w-full lg:w-[444px] font-bold leading-[140%] text-[28px] sm:text-[32px] lg:text-[40px]">
                        <ReactTyped
                            strings={[
                                `We make it easy for <span class="text-[#71AAF9]">tenants</span> and <span class="text-[#71AAF9]">landlords</span><span class="text-[#3871C1]">.</span>`,
                            ]}
                            typeSpeed={5}
                            backSpeed={0}
                            showCursor={false}
                            contentType="html"
                        />
                    </h1>

                    <p className="w-full lg:w-[406px] text-white/70 font-normal leading-[160%] text-[14px] sm:text-[16px] lg:text-[16px]">
                        <ReactTyped
                            strings={[
                                "Whether it’s selling your current home, getting financing, or buying a new home, we make it easy and efficient. The best part? You’ll save a bunch of money and time with our services."
                            ]}
                            typeSpeed={1}
                            backSpeed={0}
                            showCursor={false}
                        />
                    </p>
                </div>
            </div>

            {/* Scrolling Cards */}
            <div className="w-full px-0">
                <ScrollingCards />
            </div>

            {/* Analytics Section */}
            <div className="w-full px-4 sm:px-6 md:px-10 lg:px-[160px] text-white">
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-center gap-4 lg:gap-[52px] pb-4 lg:py-[13px] lg:h-[90px]">
                    {/* Item 1 */}
                    <div className="flex flex-col items-center gap-[8px]">
                        <h1 className="font-bold leading-[140%] text-3xl sm:text-[32px] lg:text-[40px]">
                            <AnimatedNumber value={7.4} />%
                        </h1>
                        <p className="opacity-70 text-sm sm:text-base lg:text-[16px] font-normal leading-[160%]">
                            Property Return Rate
                        </p>
                    </div>

                    {/* Mobile separator / Desktop vertical divider */}
                    <div className="block lg:hidden w-full h-px bg-white/40" />
                    <div className="hidden lg:block w-[1px] bg-white h-full" />

                    {/* Item 2 */}
                    <div className="flex flex-col items-center gap-[8px]">
                        <h1 className="font-bold leading-[140%] text-3xl sm:text-[32px] lg:text-[40px]">
                            <AnimatedNumber value={3856} />
                        </h1>
                        <p className="opacity-70 text-sm sm:text-base lg:text-[16px] font-normal leading-[160%]">
                            Property in Sell &amp; Rent
                        </p>
                    </div>

                    {/* Mobile separator / Desktop vertical divider */}
                    <div className="block lg:hidden w-full h-px bg-white/40" />
                    <div className="hidden lg:block w-[1px] bg-white h-full" />

                    {/* Item 3 */}
                    <div className="flex flex-col items-center gap-[8px]">
                        <h1 className="font-bold leading-[140%] text-3xl sm:text-[32px] lg:text-[40px]">
                            <AnimatedNumber value={2540} />
                        </h1>
                        <p className="opacity-70 text-sm sm:text-base lg:text-[16px] font-normal leading-[160%]">
                            Daily Completed Transactions
                        </p>
                    </div>
                </div>
            </div>
        </motion.section>
    );
};

export default ServiceSection;
