'use client';

import { useState } from 'react';
import type { JSX } from 'react';

type Tab = {
    label: string;
    icon: (isActive: boolean) => JSX.Element;
};

const tabs: Tab[] = [
    {
        label: 'Rent',
        icon: (isActive) => (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none">
                <path
                    d="M16.4917 12.4417C14.775 14.1501 12.3167 14.6751 10.1583 14.0001L6.23333 17.9167C5.95 18.2084 5.39166 18.3834 4.99166 18.3251L3.17499 18.0751C2.57499 17.9917 2.01666 17.4251 1.92499 16.8251L1.67499 15.0084C1.61666 14.6084 1.80833 14.0501 2.08333 13.7667L5.99999 9.85006C5.33333 7.68339 5.85 5.22506 7.56666 3.51672C10.025 1.05839 14.0167 1.05839 16.4833 3.51672C18.95 5.97506 18.95 9.98339 16.4917 12.4417Z"
                    stroke={isActive ? "#3871C1" : "#5C7188"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M5.74167 14.575L7.65833 16.4916"
                    stroke={isActive ? "#3871C1" : "#5C7188"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M12.0833 9.16663C12.7737 9.16663 13.3333 8.60698 13.3333 7.91663C13.3333 7.22627 12.7737 6.66663 12.0833 6.66663C11.393 6.66663 10.8333 7.22627 10.8333 7.91663C10.8333 8.60698 11.393 9.16663 12.0833 9.16663Z"
                    stroke={isActive ? "#3871C1" : "#5C7188"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        ),
    },
    {
        label: 'Buy',
        icon: (isActive) => (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none">
                <path
                    d="M14.1667 17.0833H5.83332C3.33332 17.0833 1.66666 15.8333 1.66666 12.9166V7.08329C1.66666 4.16663 3.33332 2.91663 5.83332 2.91663H14.1667C16.6667 2.91663 18.3333 4.16663 18.3333 7.08329V12.9166C18.3333 15.8333 16.6667 17.0833 14.1667 17.0833Z"
                    stroke={isActive ? "#3871C1" : "#5C7188"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z"
                    stroke={isActive ? "#3871C1" : "#5C7188"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M4.58334 7.91663V12.0833"
                    stroke={isActive ? "#3871C1" : "#5C7188"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M15.4167 7.91663V12.0833"
                    stroke={isActive ? "#3871C1" : "#5C7188"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        ),
    },
    {
        label: 'Sell',
        icon: (isActive) => (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none">
                <g clipPath="url(#clip0)">
                    <path
                        d="M17.2604 6.56836L11.7052 2.25151C11.2177 1.87259 10.6177 1.66687 9.99999 1.66687C9.38233 1.66687 8.78229 1.87259 8.29478 2.25151L2.73853 6.56836C2.40462 6.82779 2.13446 7.16002 1.94869 7.5397C1.76292 7.91937 1.66646 8.33643 1.66666 8.75904V16.2521C1.66666 16.8041 1.88615 17.3336 2.27685 17.7239C2.66755 18.1142 3.19746 18.3335 3.74999 18.3335H16.25C16.8025 18.3335 17.3324 18.1142 17.7231 17.7239C18.1138 17.3336 18.3333 16.8041 18.3333 16.2521V8.75904C18.3333 7.90254 17.9375 7.09391 17.2604 6.56836Z"
                        stroke={isActive ? "#3871C1" : "#5C7188"}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </g>
                <defs>
                    <clipPath id="clip0">
                        <rect width="20" height="20" fill="white" />
                    </clipPath>
                </defs>
            </svg>
        ),
    },
];

const PropertySelector: React.FC = () => {
    const [activeTab, setActiveTab] = useState('Rent');

    return (
        <div className="flex bg-[#ECF4FF] border-2 border-[#D2E4FF] rounded-[8px] p-[8px] w-fit">
            {tabs.map((tab) => {
                const isActive = tab.label === activeTab;
                return (
                    <button
                        key={tab.label}
                        onClick={() => setActiveTab(tab.label)}
                        className={`flex items-center gap-2 px-5 py-3 rounded-lg  border-2 font-medium transition-all cursor-pointer 
              ${isActive
                                ? 'bg-white text-[#3871C1] border-[#D2E4FF]'
                                : 'text-[#5C7188] hover:text-[#3871C1] border-transparent '
                            }`}
                    >
                        {tab.icon(isActive)}
                        <span>{tab.label}</span>
                    </button>
                );
            })}
        </div>
    );
};

export default PropertySelector;
