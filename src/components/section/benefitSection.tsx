'use client';

import Image from "next/image";
import Button from "../Button";
import { useScroll } from "@/context/ScrollContext";
import { motion } from "framer-motion";

const BenefitSection: React.FC = () => {
    const { propertySectionRef } = useScroll();

    const scrollToProperty = () => {
        propertySectionRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <motion.section
            id="benefitSection"
            className="text-[#002353] flex py-[200px] px-[160px] gap-[64px] bg-white min-h-dvh w-full"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.3 }}
        >
            {/* Left box */}
            <div className="flex flex-col w-fit bg-[#F7F7FD] border-[1.5px] justify-between border-[#D7E7FF] rounded-[8px] ">
                <div className="flex flex-col gap-[24px] pt-[40px] pl-[40px] pr-[67px]">
                    <div className="flex flex-col gap-[16px] ">
                        <h1 className="text-[#002353] text-[32px] font-bold leading-[125%]">The new way to find your new home</h1>
                        <p className="text-[#002353]/70 text-[16px] font-normal leading-[160%]">
                            Find your dream place to live in with more than 10k+ properties listed.
                        </p>
                    </div>
                    <Button variant="tertiary" onClick={scrollToProperty}>Browse Properties</Button>
                </div>
                <Image
                    src="/benefitSection/property.svg"
                    alt="property"
                    width={360}
                    height={300}
                    className="ml-auto"
                />
            </div>

            {/* Right grid */}
            <div className="w-full gap-[32px] grid grid-cols-2 grid-rows-2 gap-x-[24px] gap-y-[64px]">
                {benefitItems.map((item, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                        viewport={{ once: true, amount: 0.4 }}
                    >
                        <Image src={item.icon} alt={item.title} width={64} height={64} />
                        <h1 className="text-[#002353] text-[24px] font-bold leading-[150%] mt-[24px]">{item.title}</h1>
                        <p className="text-[#4D5461] text-[16px] font-normal leading-[160%] mt-[16px]">{item.desc}</p>
                    </motion.div>
                ))}
            </div>
        </motion.section>
    );
};

export default BenefitSection;

const benefitItems = [
    {
        icon: "/benefitSection/insurance.svg",
        title: "Property Insurance",
        desc: "We offer our customer property protection of liability coverage and insurance for their better life."
    },
    {
        icon: "/benefitSection/price.svg",
        title: "Best Price",
        desc: "Not sure what you should be charging for your property? No need to worry, let us do the numbers for you."
    },
    {
        icon: "/benefitSection/commission.svg",
        title: "Lowest Commission",
        desc: "You no longer have to negotiate commissions and haggle with other agents—it only costs 2%!"
    },
    {
        icon: "/benefitSection/control.svg",
        title: "Overall Control",
        desc: "Get a virtual tour, and schedule visits before you rent or buy any properties. You get overall control."
    }
];
