'use client';

import Image from "next/image";
import { motion } from "framer-motion";

const BenefitSection: React.FC = () => {
    return (
        <motion.section
            id="benefitSection"
            className="
        text-[#002353] bg-white min-h-dvh w-full
        flex flex-col xl:flex-row
        pt-0 md:pt-24 xl:pt-[160px]
        pb-12 md:pb-16 xl:pb-[80px]
        px-4 md:px-10 xl:px-[160px]
        gap-8 md:gap-10 xl:gap-[84px]
      "
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.3 }}
        >
            {/* Left box (desktop unchanged) */}
            <div className="flex flex-col w-full xl:w-fit justify-between rounded-[8px] gap-[30px] py-10">
                <div className="flex flex-col gap-[35px]">
                    <h1 className="text-[#3871C1] text-[20px] 2xl:text-[27.5px] font-medium leading-[125%] tracking-[2.91px]">
                        WHO ARE WE
                    </h1>
                    <p className="text-[#002353] text-[40px] 2xl:text-[55px] font-bold leading-[117.5%]">
                        Assisting individuals in locating the appropriate real estate.
                    </p>
                    <p className="text-[#002353]/50 text-[16px] 2xl:text-[22px]">
                        {"At "}<b>{"Hiraya Homes,"}</b>{" we connect people with homes that match their lifestyle and budget. Whether you’re looking to rent, buy, or sell,"}
                        <br className="hidden xl:block" />
                        {" our trusted team ensures you find the right property with ease."}
                    </p>
                </div>

                <div className="flex flex-col gap-[30px] 2xl:pr-[200px]">
                    <div className="flex px-[40px] py-[30px] gap-[40px] bg-white rounded-[30px] shadow-[4px_10px_30px_0_rgba(0,0,0,0.06)] w-full hover:scale-101 duration-150 transition-all">
                        <Image alt="guide" src="benefitSection/guide.svg" width={55} height={55} />
                        <div className="flex flex-col gap-[5px]">
                            <h1 className="text-[#3871C1] text-xl 2xl:text-[22.5px] font-normal">Personalized Guidance</h1>
                            <p className="text-[#00235380] 2xl:text-[17px] leading-[160%]">
                                Get expert advice and tailored recommendations that suit your needs and goals.
                            </p>
                        </div>
                    </div>

                    <div className="flex px-[40px] py-[30px] gap-[40px] bg-white rounded-[30px] shadow-[4px_10px_30px_0_rgba(0,0,0,0.06)] w-full hover:scale-101 duration-150 transition-all">
                        <Image alt="trust" src="benefitSection/trust.svg" width={55} height={55} />
                        <div className="flex flex-col gap-[5px]">
                            <h1 className="text-[#3871C1] text-xl 2xl:text-[22.5px] font-normal">Trusted Network</h1>
                            <p className="text-[#00235380] 2xl:text-[17px] leading-[160%]">
                                Work with a reliable team of real estate professionals backed by years of experience.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right grid (desktop unchanged) */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true, amount: 0.4 }}
                // mobile: column + centered, md+: row like before
                className="relative w-full xl:w-fit flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-5 justify-center xl:justify-start"
            >
                {/* centered top badge (shows from md up) */}
                <div
                    className="hidden md:block absolute z-20 top-20 2xl:top-26 left-1/2 -translate-x-1/2 transform
             w-24 h-24 md:w-[205px] md:h-[205px] 2xl:w-[268px] 2xl:h-[268px]
             transition-transform duration-500 ease-out
             hover:scale-110 hover:-translate-y-1 hover:-rotate-6
             motion-reduce:transition-none motion-reduce:hover:transform-none"
                >
                    <Image
                        src="/benefitSection/tag.png"
                        alt="tag"
                        fill
                        className="object-contain object-center"
                        sizes="(max-width: 1279px) 160px, 268px"
                    />
                </div>
                {/* centered top badge (shows from md up) */}
                <div className="hidden md:block absolute z-20 bottom-[30px] 2xl:bottom-[30px] left-2/3 -translate-x-1/2 transform w-24 h-24 md:w-[60px] md:h-[60px] 2xl:w-[78px] 2xl:h-[78px]">
                    <Image
                        src="/benefitSection/deco.svg"
                        alt="deco"
                        fill
                        className="object-contain object-center"
                        sizes="(max-width: 1279px) 160px, 268px"
                    />
                </div>
                {/* first card: full-width on mobile, original sizes from md up */}
                <div className="relative w-full md:w-[280px] 2xl:w-[364px] h-[68vw] md:h-[500px] 2xl:h-[650px] rounded-[30px] overflow-hidden self-center md:self-end">
                    <Image
                        src="/benefitSection/pic1.jpg"
                        alt="test"
                        fill
                        className="object-cover hover:scale-110 duration-500 transition-all"
                        sizes="(max-width: 767px) 100vw, (max-width: 1279px) 90vw, 364px"
                    />
                </div>

                {/* right column: full-width on mobile, original sizes from md up */}
                <div className="flex flex-col gap-4 w-full md:w-auto self-stretch md:self-end mb-0 xl:mb-[67px]">
                    <div className="relative w-full md:w-[277px] 2xl:w-[360px] h-[45vw] md:h-[280px] 2xl:h-[364px] rounded-[30px] overflow-hidden">
                        <Image
                            src="/benefitSection/pic3.jpg"
                            alt="test"
                            fill
                            className="object-cover hover:scale-110 duration-500 transition-all"
                            sizes="(max-width: 767px) 100vw, (max-width: 1279px) 90vw, 360px"
                        />
                    </div>

                    <div className="relative w-full md:w-[277px] 2xl:w-[360px] h-[32vw] md:h-[180px] 2xl:h-[234px] rounded-[30px] overflow-hidden">
                        <Image
                            src="/benefitSection/pic2.jpg"
                            alt="test"
                            fill
                            className="object-cover hover:scale-110 duration-500 transition-all"
                            sizes="(max-width: 767px) 100vw, (max-width: 1279px) 90vw, 360px"
                        />
                    </div>
                </div>
            </motion.div>
        </motion.section>
    );
};

export default BenefitSection;
