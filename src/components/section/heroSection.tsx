'use client';

import Image from "next/image";
import SearchTabs from "../searchTabs";
import RecommendationCard from "../RecommendationCard";
import Analytics from "../Analytics";
import { motion } from "framer-motion";

const HeroSection: React.FC = () => {
    return (
        <motion.section
            id="heroSection"
            className="text-[#002353] grid grid-cols-1 md:grid-cols-2 pt-[184px] pl-[160px] bg-gradient-to-b from-[#D2E4FF] to-[#D2E4FF]/0 min-h-dvh w-full mt-[-96px]"
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
        >
            {/* Left Grid */}
            <motion.div
                className="flex flex-col"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
            >
                <div className="flex flex-col gap-[32px] w-[544px]">
                    <h1 className="font-bold text-[64px] tracking-[-0.64px] leading-[110%]">
                        Buy, rent, or sell your property easily
                    </h1>
                    <h2 className="font-medium text-[20px] tracking-[-0.1px] leading-[160%] w-[448px]">
                        A great platform to buy, sell, or even rent your properties without any commissions.
                    </h2>
                </div>

                    <SearchTabs />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                >
                    <Analytics />
                </motion.div>
            </motion.div>

            {/* Right Grid */}
            <motion.div
                className="relative h-full flex flex-col gap-[32px]"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
            >
                <RecommendationCard />
                <Image
                    alt="Trust Pilot"
                    src="/trustPilot.svg"
                    width={261}
                    height={156}
                    className="absolute bottom-0 right-0 object-cover rounded-[8px]"
                />
                <Image
                    alt="Hero"
                    src="/hero.png"
                    width={1242}
                    height={886}
                    className="w-full h-full object-cover"
                />
            </motion.div>
        </motion.section>
    );
};

export default HeroSection;
