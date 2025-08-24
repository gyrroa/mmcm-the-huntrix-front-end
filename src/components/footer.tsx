'use client';

import { useRef } from "react";
import { useInView, motion } from "framer-motion";
import Image from "next/image";

const Footer: React.FC = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <motion.footer
      ref={sectionRef}
      id="serviceSection"
      className="bg-white w-full pt-16"
      initial={{ opacity: 0, y: 0 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      {/* Container */}
      <div className="mx-auto w-full px-4 sm:px-0">
        {/* Brand row */}
        <div className="flex items-center justify-center mb-10 md:mb-12">
          <div className="flex flex-col items-center">
            <Image
              src="/logo.svg"
              alt="Hiraya Homes logo"
              width={117}
              height={72}
              className="inline-block"
              priority
            />
            <h1 className="mt-[-6px] text-[30px] sm:text-[32px] font-bold whitespace-nowrap text-[#002353]">
              Hiraya Homes
            </h1>
            <p className="text-[#3871C1] font-medium text-[18px] sm:text-[20px] text-center mt-[20px]">
              Where agents thrive, buyers decide,<br />
              and sellers shine!
            </p>
            <div className="mt-[23px] flex flex-wrap items-center justify-center gap-5 sm:gap-6">
              <a aria-label="Facebook" className="cursor-pointer">
                <Image src="/footer/fb.svg" alt="Facebook" width={24} height={24} />
              </a>
              <a aria-label="Twitter" className="cursor-pointer">
                <Image src="/footer/twt.svg" alt="Twitter" width={24} height={24} />
              </a>
              <a aria-label="Instagram" className="cursor-pointer">
                <Image src="/footer/ig.svg" alt="Instagram" width={24} height={24} />
              </a>
              <a aria-label="LinkedIn" className="cursor-pointer">
                <Image src="/footer/li.svg" alt="LinkedIn" width={24} height={24} />
              </a>
            </div>
          </div>
        </div>
        {/* Divider */}
        <div className="bg-[#7f90a9] border-0 h-px w-full mt-12 md:mt-14" />

        {/* Bottom bar */}
        <div
          className="
            flex flex-col sm:flex-row
            items-center justify-center
            py-[14px]
            gap-4 sm:gap-0
          "
        >
          <p className="text-[14px] leading-[160%] text-center text-[#7f90a9]">
            ©2025 Hiraya Homes. All rights reserved.
          </p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
