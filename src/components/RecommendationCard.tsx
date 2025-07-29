import Image from "next/image";

const RecommendationCard: React.FC = () => {
    return (

        <div className="absolute flex flex-col bg-white rounded-[8px] p-6 w-fit gap-6">
            <div className="flex gap-[16px]">
                <Image
                    src="/heroSection/recoCardProfile.svg"
                    alt="User Avatar"
                    width={64}
                    height={64}
                    className="rounded-full"
                />
                <div className="flex flex-col gap-[4px] text-[#002353]">
                    <h1 className="text-[16px] font-bold leading-[120%]">Manuel Villa</h1>
                    <div className="flex flex-col gap-[8px] text-[12px] leading-[140%]">
                        <p className="opacity-50">Renter</p>
                        <div className="flex">
                            <p className="opacity-50">Moved with</p>
                            <Image
                                src="/logo.svg"
                                alt="Logo"
                                width={28}
                                height={18}
                                className="inline-block ml-1 mr-1"
                            />
                            <p className="text-[#002353] font-bold text-[8px]">Hiraya Homes</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex gap-[16px]">
                <div className="bg-[#002353] w-8 h-8 rounded-full flex items-center justify-center">
                    <svg width="13" height="10" viewBox="0 0 13 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.63913 0.0319996C3.38579 0.0319996 4.00446 0.277333 4.49513 0.768C4.98579 1.25867 5.23113 1.888 5.23113 2.656C5.23113 3.04 5.17779 3.41333 5.07113 3.776C4.98579 4.13867 4.80446 4.68267 4.52713 5.408L2.86313 9.952H0.271125L1.55113 5.024C1.08179 4.85333 0.708458 4.56533 0.431125 4.16C0.175125 3.73333 0.0471251 3.232 0.0471251 2.656C0.0471251 1.888 0.292458 1.25867 0.783125 0.768C1.27379 0.277333 1.89246 0.0319996 2.63913 0.0319996ZM9.42313 0.0319996C10.1698 0.0319996 10.7885 0.277333 11.2791 0.768C11.7698 1.25867 12.0151 1.888 12.0151 2.656C12.0151 3.04 11.9618 3.41333 11.8551 3.776C11.7698 4.13867 11.5885 4.68267 11.3111 5.408L9.64713 9.952H7.05513L8.33513 5.024C7.86579 4.85333 7.49246 4.56533 7.21513 4.16C6.95913 3.73333 6.83113 3.232 6.83113 2.656C6.83113 1.888 7.07646 1.25867 7.56713 0.768C8.05779 0.277333 8.67646 0.0319996 9.42313 0.0319996Z" fill="white" />
                    </svg>
                </div>
                <p className="text-[12px] font-normal w-[173px] tracking-[-0.12px]">I loved how smooth the move was, and finally got the house we wanted.</p>
            </div>
            <h1 className="w-full h-[1px] bg-[#E5E5E5]"></h1>
            <div className="flex justify-between text-[#002353] font-extrabold">
                <div className="flex flex-col gap-[8px]">
                    <h1 className="text-[20px]">₱10,500</h1>
                    <p className="opacity-50 text-[12px] font-normal">Saved up to</p>
                </div>
                <div className="flex flex-col gap-[8px]">
                    <h1 className="text-[20px]">-24 hrs</h1>
                    <p className="opacity-50 text-[12px] font-normal">Process time</p>
                </div>
            </div>
        </div>
    );
};

export default RecommendationCard;