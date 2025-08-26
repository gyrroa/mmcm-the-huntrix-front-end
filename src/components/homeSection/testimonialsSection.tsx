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
                  <path d="M13.9412 5.24003C13.8743 5.03236 13.7512 4.84726 13.5856 4.70522C13.42 4.56318 13.2183 4.46975 13.0028 4.43526L9.62216 3.88585L8.05497 0.840439C7.95515 0.646564 7.80385 0.483932 7.61767 0.370388C7.4315 0.256845 7.21765 0.196777 6.99958 0.196777C6.78151 0.196777 6.56766 0.256845 6.38148 0.370388C6.19531 0.483932 6.04401 0.646564 5.94418 0.840439L4.377 3.88585L0.996381 4.43526C0.781151 4.47029 0.579729 4.56393 0.414215 4.7059C0.248701 4.84788 0.125491 5.0327 0.0581037 5.24008C-0.00928335 5.44747 -0.0182434 5.66942 0.0322066 5.88156C0.0826566 6.09371 0.190567 6.28786 0.344098 6.44271L2.75618 8.87428L2.2341 12.2592C2.2006 12.4748 2.2272 12.6955 2.31099 12.8969C2.39478 13.0984 2.53251 13.2728 2.70902 13.4011C2.88554 13.5293 3.094 13.6064 3.31149 13.6238C3.52897 13.6413 3.74705 13.5984 3.94175 13.4999L6.99958 11.9573L10.0575 13.4999C10.2522 13.5982 10.4702 13.6409 10.6876 13.6234C10.905 13.6059 11.1134 13.5288 11.2899 13.4006C11.4663 13.2724 11.604 13.098 11.6879 12.8967C11.7717 12.6953 11.7985 12.4748 11.7651 12.2592L11.2431 8.87428L13.6551 6.44271C13.8092 6.28816 13.9174 6.09401 13.9679 5.88174C14.0184 5.66947 14.0092 5.44737 13.9412 5.24003Z" fill="#FFC700" />
                  <path d="M31.9412 5.24003C31.8743 5.03236 31.7512 4.84726 31.5856 4.70522C31.42 4.56318 31.2183 4.46975 31.0028 4.43526L27.6222 3.88585L26.055 0.840439C25.9551 0.646564 25.8038 0.483932 25.6177 0.370388C25.4315 0.256845 25.2176 0.196777 24.9996 0.196777C24.7815 0.196777 24.5677 0.256845 24.3815 0.370388C24.1953 0.483932 24.044 0.646564 23.9442 0.840439L22.377 3.88585L18.9964 4.43526C18.7812 4.47029 18.5797 4.56393 18.4142 4.7059C18.2487 4.84788 18.1255 5.0327 18.0581 5.24008C17.9907 5.44747 17.9818 5.66942 18.0322 5.88156C18.0827 6.09371 18.1906 6.28786 18.3441 6.44271L20.7562 8.87428L20.2341 12.2592C20.2006 12.4748 20.2272 12.6955 20.311 12.8969C20.3948 13.0984 20.5325 13.2728 20.709 13.4011C20.8855 13.5293 21.094 13.6064 21.3115 13.6238C21.529 13.6413 21.7471 13.5984 21.9417 13.4999L24.9996 11.9573L28.0575 13.4999C28.2522 13.5982 28.4702 13.6409 28.6876 13.6234C28.905 13.6059 29.1134 13.5288 29.2899 13.4006C29.4663 13.2724 29.604 13.098 29.6879 12.8967C29.7717 12.6953 29.7985 12.4748 29.7651 12.2592L29.2431 8.87428L31.6551 6.44271C31.8092 6.28816 31.9174 6.09401 31.9679 5.88174C32.0184 5.66947 32.0092 5.44737 31.9412 5.24003Z" fill="#FFC700" />
                  <path d="M49.9412 5.24003C49.8743 5.03236 49.7512 4.84726 49.5856 4.70522C49.42 4.56318 49.2183 4.46975 49.0028 4.43526L45.6222 3.88585L44.055 0.840439C43.9551 0.646564 43.8038 0.483932 43.6177 0.370388C43.4315 0.256845 43.2176 0.196777 42.9996 0.196777C42.7815 0.196777 42.5677 0.256845 42.3815 0.370388C42.1953 0.483932 42.044 0.646564 41.9442 0.840439L40.377 3.88585L36.9964 4.43526C36.7812 4.47029 36.5797 4.56393 36.4142 4.7059C36.2487 4.84788 36.1255 5.0327 36.0581 5.24008C35.9907 5.44747 35.9818 5.66942 36.0322 5.88156C36.0827 6.09371 36.1906 6.28786 36.3441 6.44271L38.7562 8.87428L38.2341 12.2592C38.2006 12.4748 38.2272 12.6955 38.311 12.8969C38.3948 13.0984 38.5325 13.2728 38.709 13.4011C38.8855 13.5293 39.094 13.6064 39.3115 13.6238C39.529 13.6413 39.7471 13.5984 39.9417 13.4999L42.9996 11.9573L46.0575 13.4999C46.2522 13.5982 46.4702 13.6409 46.6876 13.6234C46.905 13.6059 47.1134 13.5288 47.2899 13.4006C47.4663 13.2724 47.604 13.098 47.6879 12.8967C47.7717 12.6953 47.7985 12.4748 47.7651 12.2592L47.2431 8.87428L49.6551 6.44271C49.8092 6.28816 49.9174 6.09401 49.9679 5.88174C50.0184 5.66947 50.0092 5.44737 49.9412 5.24003Z" fill="#FFC700" />
                  <path d="M67.9412 5.24003C67.8743 5.03236 67.7512 4.84726 67.5856 4.70522C67.42 4.56318 67.2183 4.46975 67.0028 4.43526L63.6222 3.88585L62.055 0.840439C61.9551 0.646564 61.8038 0.483932 61.6177 0.370388C61.4315 0.256845 61.2176 0.196777 60.9996 0.196777C60.7815 0.196777 60.5677 0.256845 60.3815 0.370388C60.1953 0.483932 60.044 0.646564 59.9442 0.840439L58.377 3.88585L54.9964 4.43526C54.7812 4.47029 54.5797 4.56393 54.4142 4.7059C54.2487 4.84788 54.1255 5.0327 54.0581 5.24008C53.9907 5.44747 53.9818 5.66942 54.0322 5.88156C54.0827 6.09371 54.1906 6.28786 54.3441 6.44271L56.7562 8.87428L56.2341 12.2592C56.2006 12.4748 56.2272 12.6955 56.311 12.8969C56.3948 13.0984 56.5325 13.2728 56.709 13.4011C56.8855 13.5293 57.094 13.6064 57.3115 13.6238C57.529 13.6413 57.7471 13.5984 57.9417 13.4999L60.9996 11.9573L64.0575 13.4999C64.2522 13.5982 64.4702 13.6409 64.6876 13.6234C64.905 13.6059 65.1134 13.5288 65.2899 13.4006C65.4663 13.2724 65.604 13.098 65.6879 12.8967C65.7717 12.6953 65.7985 12.4748 65.7651 12.2592L65.2431 8.87428L67.6551 6.44271C67.8092 6.28816 67.9174 6.09401 67.9679 5.88174C68.0184 5.66947 68.0092 5.44737 67.9412 5.24003Z" fill="#FFC700" />
                  <path d="M85.9412 5.24003C85.8743 5.03236 85.7512 4.84726 85.5856 4.70522C85.42 4.56318 85.2183 4.46975 85.0028 4.43526L81.6222 3.88585L80.055 0.840439C79.9551 0.646564 79.8038 0.483932 79.6177 0.370388C79.4315 0.256845 79.2176 0.196777 78.9996 0.196777C78.7815 0.196777 78.5677 0.256845 78.3815 0.370388C78.1953 0.483932 78.044 0.646564 77.9442 0.840439L76.377 3.88585L72.9964 4.43526C72.7812 4.47029 72.5797 4.56393 72.4142 4.7059C72.2487 4.84788 72.1255 5.0327 72.0581 5.24008C71.9907 5.44747 71.9818 5.66942 72.0322 5.88156C72.0827 6.09371 72.1906 6.28786 72.3441 6.44271L74.7562 8.87428L74.2341 12.2592C74.2006 12.4748 74.2272 12.6955 74.311 12.8969C74.3948 13.0984 74.5325 13.2728 74.709 13.4011C74.8855 13.5293 75.094 13.6064 75.3115 13.6238C75.529 13.6413 75.7471 13.5984 75.9417 13.4999L78.9996 11.9573L82.0575 13.4999C82.2522 13.5982 82.4702 13.6409 82.6876 13.6234C82.905 13.6059 83.1134 13.5288 83.2899 13.4006C83.4663 13.2724 83.604 13.098 83.6879 12.8967C83.7717 12.6953 83.7985 12.4748 83.7651 12.2592L83.2431 8.87428L85.6551 6.44271C85.8092 6.28816 85.9174 6.09401 85.9679 5.88174C86.0184 5.66947 86.0092 5.44737 85.9412 5.24003Z" fill="#FFC700" />
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
