'use client';

import { useRef } from "react";
import { useInView, motion } from "framer-motion";
import ScrollingCards from "../ScrollingCards";
import { ReactTyped } from "react-typed";
import AnimatedNumber from "../AnimatedNumber";

const ServiceSection: React.FC = () => {
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

    return (
        <motion.section
            ref={sectionRef}
            id="serviceSection"
            className="gap-[64px] flex flex-col pb-[100px] bg-[#002353] min-h-dvh w-full text-center items-center justify-center"
            initial={{ opacity: 0, y: 0 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: "easeOut" }}
        >
            {/* Header with Typing Animation */}
            <div className="flex flex-row justify-between text-white w-full text-left px-[160px]">
                <h1 className="text-[40px] font-bold leading-[140%] w-[444px]">
                    <ReactTyped
                        strings={["We make it easy for tenants and landlords."]}
                        typeSpeed={5}
                        backSpeed={0}
                        showCursor={false}
                    />
                </h1>
                <p className="text-[16px] font-normal leading-[160%] text-white/70 w-[406px]">
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

            {/* Scrolling Cards */}
            <ScrollingCards />

            {/* Divider */}
            <div className="w-full bg-[#202B3B] h-[1.5px]" />

            {/* Analytics Section */}
            <div className="flex gap-[52px] py-[13px] h-[90px] text-white justify-center items-center">
                <div className="flex flex-col items-center gap-[8px]">
                    <h1 className="text-[40px] font-bold leading-[140%]">
                        <AnimatedNumber value={7.4} />%
                    </h1>
                    <p className="opacity-70 text-[16px] font-normal leading-[160%]">Property Return Rate</p>
                </div>
                <div className="w-[1.5px] bg-white h-full" />
                <div className="flex flex-col items-center gap-[8px]">
                    <h1 className="text-[40px] font-bold leading-[140%]">
                        <AnimatedNumber value={3856} />
                    </h1>
                    <p className="opacity-70 text-[16px] font-normal leading-[160%]">Property in Sell & Rent</p>
                </div>
                <div className="w-[1.5px] bg-white h-full" />
                <div className="flex flex-col items-center gap-[8px]">
                    <h1 className="text-[40px] font-bold leading-[140%]">
                        <AnimatedNumber value={2540} />
                    </h1>
                    <p className="opacity-70 text-[16px] font-normal leading-[160%]">Daily Completed Transactions</p>
                </div>
            </div>
        </motion.section>
    );
};

export default ServiceSection;
