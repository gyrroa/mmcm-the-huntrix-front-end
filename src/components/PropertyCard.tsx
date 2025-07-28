'use client'

import Image from "next/image";
import { useState } from "react";

type PropertyCardProps = {
    imageSrc: string;
    price: string;
    name: string;
    isPopular?: boolean;
    address: string;
    bed: string;
    bath: string;
    size: string;
    listingType: 'rent' | 'buy';
};
const PropertyCard: React.FC<PropertyCardProps> = ({ imageSrc, price, name, isPopular, address, bed, bath, size, listingType }) => {
    const [isFavorited, setIsFavorited] = useState(false);

    const toggleFavorite = () => {
        setIsFavorited(!isFavorited);
    };
    const [imageError, setImageError] = useState(false);
    return (
        <div className="flex flex-col relative bg-white rounded-lg w-full gap-6 shadow-sm hover:scale-[102%] transition-transform duration-200">
            {/* Image */}
            <div className="w-full h-[200px] relative">
                <Image
                    src={imageError ? "/logo.svg" : imageSrc}
                    alt={imageError ? "Fallback Logo" : "Property"}
                    fill
                    className="object-cover"
                    onError={() => setImageError(true)}
                    placeholder="blur"
                    blurDataURL="/logo.svg"
                />
                {/* Popular */}
                {isPopular && (
                    <div className="absolute flex gap-[8px] bg-[#3871C1] bottom-[-16px] -left-[8px] px-[16px] py-[8px] rounded-t-[8px] rounded-r-[8px] shadow-md after:content-[''] after:absolute after:-bottom-[8px] after:left-0 after:w-0 after:h-0 after:border-r-[8px] after:border-r-[#3871C1] after:border-b-[8px] after:border-b-transparent">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path fillRule="evenodd" clipRule="evenodd" d="M4.00001 1.6001C4.21218 1.6001 4.41566 1.68438 4.56569 1.83441C4.71572 1.98444 4.80001 2.18792 4.80001 2.4001V3.2001H5.60001C5.81218 3.2001 6.01566 3.28438 6.16569 3.43441C6.31572 3.58444 6.40001 3.78792 6.40001 4.0001C6.40001 4.21227 6.31572 4.41575 6.16569 4.56578C6.01566 4.71581 5.81218 4.8001 5.60001 4.8001H4.80001V5.6001C4.80001 5.81227 4.71572 6.01575 4.56569 6.16578C4.41566 6.31581 4.21218 6.4001 4.00001 6.4001C3.78783 6.4001 3.58435 6.31581 3.43432 6.16578C3.28429 6.01575 3.20001 5.81227 3.20001 5.6001V4.8001H2.40001C2.18783 4.8001 1.98435 4.71581 1.83432 4.56578C1.68429 4.41575 1.60001 4.21227 1.60001 4.0001C1.60001 3.78792 1.68429 3.58444 1.83432 3.43441C1.98435 3.28438 2.18783 3.2001 2.40001 3.2001H3.20001V2.4001C3.20001 2.18792 3.28429 1.98444 3.43432 1.83441C3.58435 1.68438 3.78783 1.6001 4.00001 1.6001ZM4.00001 9.6001C4.21218 9.6001 4.41566 9.68438 4.56569 9.83441C4.71572 9.98444 4.80001 10.1879 4.80001 10.4001V11.2001H5.60001C5.81218 11.2001 6.01566 11.2844 6.16569 11.4344C6.31572 11.5844 6.40001 11.7879 6.40001 12.0001C6.40001 12.2123 6.31572 12.4158 6.16569 12.5658C6.01566 12.7158 5.81218 12.8001 5.60001 12.8001H4.80001V13.6001C4.80001 13.8123 4.71572 14.0158 4.56569 14.1658C4.41566 14.3158 4.21218 14.4001 4.00001 14.4001C3.78783 14.4001 3.58435 14.3158 3.43432 14.1658C3.28429 14.0158 3.20001 13.8123 3.20001 13.6001V12.8001H2.40001C2.18783 12.8001 1.98435 12.7158 1.83432 12.5658C1.68429 12.4158 1.60001 12.2123 1.60001 12.0001C1.60001 11.7879 1.68429 11.5844 1.83432 11.4344C1.98435 11.2844 2.18783 11.2001 2.40001 11.2001H3.20001V10.4001C3.20001 10.1879 3.28429 9.98444 3.43432 9.83441C3.58435 9.68438 3.78783 9.6001 4.00001 9.6001ZM9.60001 1.6001C9.77656 1.60004 9.94817 1.65839 10.0881 1.76605C10.228 1.87371 10.3284 2.02463 10.3736 2.1953L11.3168 5.7601L14 7.3073C14.1216 7.37751 14.2226 7.4785 14.2928 7.60011C14.363 7.72173 14.4 7.85967 14.4 8.0001C14.4 8.14052 14.363 8.27847 14.2928 8.40008C14.2226 8.52169 14.1216 8.62268 14 8.6929L11.3168 10.2409L10.3728 13.8049C10.3275 13.9754 10.2272 14.1262 10.0873 14.2337C9.94748 14.3413 9.77602 14.3996 9.59961 14.3996C9.42319 14.3996 9.25173 14.3413 9.11189 14.2337C8.97205 14.1262 8.87169 13.9754 8.82641 13.8049L7.88321 10.2401L5.20001 8.6929C5.0784 8.62268 4.97742 8.52169 4.90721 8.40008C4.837 8.27847 4.80004 8.14052 4.80004 8.0001C4.80004 7.85967 4.837 7.72173 4.90721 7.60011C4.97742 7.4785 5.0784 7.37751 5.20001 7.3073L7.88321 5.7593L8.82721 2.1953C8.87237 2.02476 8.97263 1.87394 9.1124 1.76629C9.25216 1.65865 9.42359 1.60022 9.60001 1.6001Z" fill="white" />
                        </svg>
                        <h1 className="text-[#FFFFFF] text-[12px] font-bold">Popular</h1>
                    </div>
                )}
            </div>
            {/* Content */}
            <div className="flex flex-col gap-4 text-[#002353] px-6 py-6 text-left relative">
                {/* Favorites */}
                <button
                    onClick={toggleFavorite}
                    aria-label="Toggle favorite"
                    aria-pressed={isFavorited}
                    className={`absolute top-4 right-4 z-10 w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-200 cursor-pointer 
                        ${isFavorited ? 'bg-[#3871C1]' : 'bg-white'} 
                        border border-[#ECF4FF] shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#3871C1]/40`}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`transition-transform duration-200 ${isFavorited ? 'scale-110' : 'scale-100'}`}
                        width="24" height="24" viewBox="0 0 24 24"
                        fill={isFavorited ? '#fff' : 'none'}
                        stroke={isFavorited ? '#fff' : '#3871C1'}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M4.31801 6.31804C3.90014 6.7359 3.56867 7.23198 3.34252 7.77795C3.11637 8.32392 2.99997 8.90909 2.99997 9.50004C2.99997 10.091 3.11637 10.6762 3.34252 11.2221C3.56867 11.7681 3.90014 12.2642 4.31801 12.682L12 20.364L19.682 12.682C20.5259 11.8381 21 10.6935 21 9.50004C21 8.30656 20.5259 7.16196 19.682 6.31804C18.8381 5.47412 17.6935 5.00001 16.5 5.00001C15.3065 5.00001 14.1619 5.47412 13.318 6.31804L12 7.63604L10.682 6.31804C10.2641 5.90017 9.76807 5.5687 9.2221 5.34255C8.67613 5.1164 8.09096 5 7.50001 5C6.90906 5 6.32389 5.1164 5.77792 5.34255C5.23195 5.5687 4.73587 5.90017 4.31801 6.31804Z" />
                    </svg>
                </button>
                {/* Price & Name */}
                <div className="flex flex-col gap-[5px]">
                    <h1 className="text-xl md:text-2xl font-extrabold text-[#3871C1] leading-tight">
                        ₱{price}
                        {listingType === 'rent' && (
                            <span className="text-base font-medium text-[#002353]/50"> /month</span>
                        )}
                    </h1>
                    <h2 className="text-xl font-bold">{name}</h2>
                    <p className="text-sm md:text-base font-medium opacity-50 pr-[100px]">
                        {address}
                    </p>
                </div>
                <div className="w-full h-[1px] bg-[#ECF4FF]" />
                {/* Features */}
                <div className="flex flex-wrap justify-between">
                    <Feature icon="/PropertySection/bed.svg" label={`${bed} Beds`} />
                    <Feature icon="/PropertySection/bath.svg" label={`${bath} Bathrooms`} />
                    <Feature icon="/PropertySection/size.svg" label={`${size} m²`} />
                </div>
            </div>
        </div>
    );
};

export default PropertyCard;

// Reusable Feature Item (icon + label)
const Feature = ({ icon, label }: { icon: string; label: string }) => (
    <div className="flex items-center gap-2 min-w-[110px]">
        <Image src={icon} alt={label} width={20} height={20} />
        <p className="text-sm text-[#002353]">{label}</p>
    </div>
);
