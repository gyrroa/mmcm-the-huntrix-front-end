'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { useInView, motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

type Testimonial = {
  id: number;
  text: string;
  name: string;
  avatar: string;
};

const testimonials: Testimonial[] = [
  {
    id: 1,
    text:
      'I highly recommend Hiraya Homes! Their team made the entire process smooth and stress-free. From searching to closing, they guided me every step of the way. I couldn’t be happier with my new home!',
    name: 'Barbara D. Smith',
    avatar: '/testimonialsSection/testimonial1.svg',
  },
  {
    id: 2,
    text:
      'Seamless experience from start to finish. The agents were responsive, transparent, and truly cared about my needs. Found a great deal faster than I expected, and the whole process felt stress-free.',
    name: 'Juan Dela Cruz',
    avatar: '/testimonialsSection/testimonial1.svg',
  },
  {
    id: 3,
    text:
      'Professional and reliable. They explained everything clearly and kept me updated. I felt supported throughout the entire purchase, and their attention to detail gave me confidence at every step.',
    name: 'Maria Santos',
    avatar: '/testimonialsSection/testimonial1.svg',
  },
];

const TestimonialSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const prev = useCallback(
    () => setCurrent((i) => (i - 1 + testimonials.length) % testimonials.length),
    []
  );
  const next = useCallback(
    () => setCurrent((i) => (i + 1) % testimonials.length),
    []
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prev, next]);

  const t = testimonials[current];

  return (
    <motion.section
      ref={sectionRef}
      id="testimonialSection"
      role="region"
      aria-label="Customer testimonials"
      className="bg-white w-full"
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12 xl:px-14 py-12 md:py-16">
        {/* Top grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-12 items-start">
          {/* left */}
          <div className="flex flex-col gap-4 md:gap-6 text-start">
            <h2 className="text-[#3871C1] text-sm md:text-base font-medium">TESTIMONIALS</h2>
            <h1 className="text-[#002353] text-2xl sm:text-3xl md:text-4xl font-black leading-tight">
              Look What Our Customers Say!
            </h1>
            <p className="text-[#00235380] text-sm md:text-base">
              Hear from clients who found their dream homes with<br /> Hiraya Homes.
            </p>

            {/* Controls — desktop/tablet only */}
            <div className="hidden md:flex mt-4 md:mt-6 gap-6 justify-start">
              <button
                type="button"
                onClick={prev}
                aria-label="Previous testimonial"
                className="hover:scale-105 transition-all duration-150 cursor-pointer"
              >
                <Image
                  src="/testimonialsSection/left.svg"
                  alt="Previous"
                  width={44}
                  height={44}
                />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next testimonial"
                className="hover:scale-105 transition-all duration-150 cursor-pointer"
              >
                <Image
                  src="/testimonialsSection/right.svg"
                  alt="Next"
                  width={44}
                  height={44}
                />
              </button>
            </div>
          </div>

          {/* right */}
          <div className="relative flex items-center">
            {/* decorative circle — hide on small screens */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="61"
              height="61"
              viewBox="0 0 61 61"
              fill="none"
              className="absolute -top-[24px] -left-[20px] hidden md:block"
              aria-hidden="true"
            >
              <circle
                opacity="0.5"
                cx="30.9808"
                cy="30.6297"
                r="30"
                transform="rotate(-30 30.9808 30.6297)"
                fill="url(#paint0_linear_109_598)"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_109_598"
                  x1="30.9808"
                  y1="0.629688"
                  x2="30.9808"
                  y2="60.6297"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#3871C1" />
                  <stop offset="1" stopColor="#3871C1" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>

            {/* card */}
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              onClick={next}
              className="bg-white shadow-[10px_10px_30px_0_rgba(0,0,0,0.10)] select-none cursor-pointer rounded-2xl md:rounded-[30px] p-5 sm:p-6 md:p-8 lg:p-10 w-full max-w-xl md:max-w:[500px] flex flex-col gap-5 sm:gap-6 md:gap-8 z-10"
            >
              <Image
                src="/testimonialsSection/quote.svg"
                alt="Quote mark"
                width={48}
                height={32}
                className="select-none pointer-events-none"
                sizes="(max-width: 768px) 32px, 48px"
              />

              {/* Review */}
              <p className="text-[#002353] text-base sm:text-lg md:text-xl font-medium text-start">
                {t.text.split('Hiraya Homes').length > 1 ? (
                  <>
                    I highly recommend <span className="text-[#004899] font-bold">Hiraya Homes</span>!
                    {t.text.split('Hiraya Homes')[1]}
                  </>
                ) : (
                  t.text
                )}
              </p>

              <hr className="border-[#D4D4D4] w-full h-px" />

              <div className="flex justify-between items-center gap-4">
                <div className="flex gap-4 items-center">
                  <Image
                    src={t.avatar}
                    alt={`${t.name} avatar`}
                    width={50}
                    height={50}
                    className="rounded-full"
                    sizes="(max-width: 768px) 40px, 50px"
                  />
                  <h1 className="text-lg md:text-xl font-bold text-[#002353]">{t.name}</h1>
                </div>

                {/* 5/5 stars */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="86"
                  height="14"
                  viewBox="0 0 86 14"
                  fill="none"
                  aria-hidden="true"
                  className="shrink-0"
                >
                  {/* (paths truncated for brevity) */}
                  <path d="M13.9412 5.24003..." fill="#FFC700" />
                  <path d="M31.9412 5.24003..." fill="#FFC700" />
                  <path d="M49.9412 5.24003..." fill="#FFC700" />
                  <path d="M67.9412 5.24003..." fill="#FFC700" />
                  <path d="M85.9412 5.24003..." fill="#FFC700" />
                </svg>
              </div>
            </motion.div>

            {/* side bars — show on md+ */}
            <div className="hidden md:flex flex-col h-full items-center justify-center ml-[30px] gap-2">
              {[1, 2, 3].map((id) => (
                <svg key={id} xmlns="http://www.w3.org/2000/svg" width="4" height="42" viewBox="0 0 4 42" fill="none" aria-hidden="true">
                  <path
                    opacity={t.id === id ? 1 : 0.5}
                    d="M2 39.6624L1.99999 2.52708"
                    stroke="#002353"
                    strokeOpacity="0.5"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              ))}
            </div>

          </div>
        </div>
        {/* Mobile dots (kept as-is) */}
        <div className="flex items-center justify-center gap-2 mt-5 lg:hidden" role="tablist" aria-label="Testimonial pagination">
          {testimonials.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => setCurrent(idx)}
              aria-label={`Go to testimonial ${idx + 1}`}
              aria-selected={current === idx}
              role="tab"
              className={`h-2 w-2 rounded-full transition-opacity ${current === idx ? 'opacity-100 bg-[#002353]' : 'opacity-40 bg-[#002353]'}`}
            />
          ))}
        </div>
        {/* CTA banner */}
        <div className="relative mt-14 md:mt-16 bg-[#003175] w-full rounded-2xl md:rounded-[40px] flex flex-col lg:flex-row items-center justify-between pt-0 p-6 md:p-0 gap-6 overflow-visible md:pl-8 md:pr-10 lg:pr-28">
          {/* deco — hide on small */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="101"
            height="101"
            viewBox="0 0 101 101"
            fill="none"
            className="absolute -top-10 right-10 hidden md:block"
            aria-hidden="true"
          >
            <circle
              opacity="0.5"
              cx="50.3013"
              cy="50.2134"
              r="50"
              transform="rotate(30 50.3013 50.2134)"
              fill="url(#paint0_linear_109_624)"
            />
            <defs>
              <linearGradient
                id="paint0_linear_109_624"
                x1="50.3013"
                y1="0.213379"
                x2="50.3013"
                y2="100.213"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="white" />
                <stop offset="1" stopColor="white" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>

          {/* Illustration */}
          <div className="relative flex-none -mt-6 md:-mt-10 order-first lg:order-none">
            <Image
              src="/testimonialsSection/agent.png"
              alt="Agent illustration"
              width={358}
              height={303}
              className="w-[358px] h-auto select-none pointer-events-none -mt-[20px] md:mt-0"
              sizes="(max-width: 1024px) 256px, 358px"
              priority
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="101"
              height="101"
              viewBox="0 0 101 101"
              fill="none"
              className="absolute bottom-5 right-0 hidden md:block"
              aria-hidden="true"
            >
              <circle
                opacity="0.5"
                cx="50.3013"
                cy="50.2134"
                r="50"
                transform="rotate(-60 50.3013 50.2134)"
                fill="url(#paint0_linear_109_620)"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_109_620"
                  x1="50.3013"
                  y1="0.213379"
                  x2="50.3013"
                  y2="100.213"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="white" />
                  <stop offset="1" stopColor="white" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Text */}
          <div className="flex flex-col text-white gap-3 md:gap-4 max-w-xl text-center lg:text-start">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">Grow with Hiraya Homes!</h1>
            <p className="text-sm md:text-base leading-relaxed">
              {"Whether you’re listing as an agent or looking to buy or rent, get quality listings, expert training, and a team that’s got your back."}
            </p>
          </div>

          {/* Button */}
          <div className="flex-shrink-0">
            <button
              onClick={() => router.push("auth?register")}
              className="text-[#002353] cursor-pointer duration-150 transition-all hover:brightness-105 leading-normal text-sm md:text-base font-medium rounded-full bg-white px-5 py-3 md:px-7 md:py-4 whitespace-nowrap"
            >
              Register Now
            </button>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default TestimonialSection;
