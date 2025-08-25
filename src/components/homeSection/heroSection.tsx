'use client';

import Image from 'next/image';
import SearchTabs from '../ui/home/SearchTabs';
import { motion } from 'framer-motion';

const HeroSection: React.FC = () => {
  return (
    <motion.section
      id="heroSection"
      className="
        text-[#002353]
        w-full
        mt-0 lg:mt-[-96px]
        px-4 sm:px-6 xl:px-[70px]
        pt-5 sm:pt-24 lg:pt-[184px]
        min-h-[80svh] lg:min-h-dvh 
      "
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      <motion.div
        className="
            relative flex w-full
            min-h-[68svh] sm:min-h-[70svh] lg:min-h-[70dvh]
            rounded-2xl sm:rounded-[40px] xl:rounded-[50px]
            pl-4 sm:pl-8 lg:pl-[60px] xl:pl-[90px]
            pr-4
            isolate
          "
      >
        {/* Background image */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl sm:rounded-[40px] xl:rounded-[50px] overflow-hidden -z-10">
          <Image
            src="/heroSection/hero.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-right-bottom lg:object-[right_75%] pointer-events-none select-none blur-[5px] 2xl:blur-none opacity-50 2xl:opacity-100 transition-all duration-200"
            aria-hidden
          />
          {/* Soft overlay for readability on small screens */}
          <div className="absolute inset-0 lg:hidden bg-gradient-to-r from-[#ecf1f8]/95 via-[#ecf1f8]/60 to-transparent" />
        </div>

        {/* Top blur gradient — shown on mobile, off on md+ like your previous setup */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-200 lg:hidden z-10 pointer-events-none"
        />

        {/* Soft overlay on small screens for readability */}
        <div className="absolute inset-0 lg:hidden bg-gradient-to-r from-[#ecf1f8]/95 via-[#ecf1f8]/60 to-transparent z-0" />

        {/* Content */}
        <motion.div
          className="
            relative z-10
            flex flex-col
            w-full max-w-[1100px]
            mt-8 sm:mt-12 lg:mt-[92px]
            justify-between
            items-start
            pb-6 sm:pb-10 lg:pb-[90px]
            gap-6 sm:gap-8
          "
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <div className="flex flex-col gap-3 sm:gap-6 max-w-[760px] 2xl:bg-transparent 2xl:backdrop-blur-none bg-[white]/80 backdrop-blur-[10px] rounded-[30px] 2xl:rounded-none p-4 lg:p-none">
            <h1
              className="
                font-bold leading-[1.1]
                text-4xl sm:text-5xl lg:text-6xl xl:text-[77px]
                tracking-[-0.02em]
              "
            >
              Easy way to find a perfect property
            </h1>

            <p
              className="
                font-normal leading-[1.6] text-[#3871C1]
                text-base sm:text-lg lg:text-xl xl:text-2xl
                max-w-[58ch]
              "
            >
              We provide end-to-end support for buying, selling, or renting properties—making the process fast, simple, and secure.
            </p>
          </div>

          {/* Your responsive SearchTabs (from earlier fix) */}
          <SearchTabs />
        </motion.div>
      </motion.div>
    </motion.section>
  );
};

export default HeroSection;
