'use client';

import { useRef } from "react";
import { useInView, motion } from "framer-motion";

const ContactSection: React.FC = () => {
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

    return (
        <motion.section
            ref={sectionRef}
            id="serviceSection"
            className="flex flex-col bg-[#ECF4FF] h-fit w-full text-center items-center justify-center pt-[64px] pb-[80px] px-[450px]"
            initial={{ opacity: 0, y: 0 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: "easeOut" }}
        >
            <div className="flex flex-col justify-center items-center text-center w-full text-[#002353] ">
                <h1 className="text-[24px] text-[#3871C1] font-bold leading-[150%]">
                    {"No Spam Promise"}
                </h1>
                <h1 className="text-[40px] font-bold leading-[140%] mt-[8px]">
                    {"Are you a landlord?"}
                </h1>
                <p className="text-[16px] font-normal leading-[140%] mt-[16px] opacity-50">
                    {"Discover ways to increase your home's value and  get listed. No Spam."}
                </p>
                <div className="flex items-center bg-white rounded-[8px] pl-[24px] pr-4 py-4 w-full max-w-[544px] mt-[32px]">
                    <input
                        type="text"
                        placeholder="Enter your email address"
                        className="ml-4 bg-transparent focus:outline-none text-[#5C7188] placeholder-[#002353] text-[16px] font-medium w-full opacity-50"
                    />
                    <button className="bg-[#3871C1] text-white rounded-[8px] px-[40px] py-[12px] font-bold hover:brightness-130 cursor-pointer">
                        {"Submit"}
                    </button>
                </div>
                <p className="text-[14px] text-[#9EA3AE] font-medium leading-[140%] mt-[24px]">
                    {"Join"} <span className="text-[#3871C1]">{"10,000+"}</span>{" other landlords in our estatery community."}
                </p>
            </div>
        </motion.section>
    );
};

export default ContactSection;
