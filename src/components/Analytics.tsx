import Image from "next/image";

const Analytics: React.FC = () => {
    return (
        <div className="mt-[260px] flex justify-between max-w-[783px]">
            <div className="gap-[24px] flex flex-col">
                <Image
                    alt="Renters"
                    src="/heroSection/renters.svg"
                    width={64}
                    height={64}
                    className="object-cover"
                />
                <div className="flex flex-col gap-[4px] leading-[150%]">
                    <h1 className="text-[#3871C1] text-2xl font-bold">
                        50k+ renters
                    </h1>
                    <p className="text-[#002353] text-base font-normal">
                        believe in our service
                    </p>
                </div>
            </div>
            <div className="gap-[24px] flex flex-col">
                <Image
                    alt="Renters"
                    src="/heroSection/renters.svg"
                    width={64}
                    height={64}
                    className="object-cover"
                />
                <div className="flex flex-col gap-[4px] leading-[150%]">
                    <h1 className="text-[#3871C1] text-2xl font-bold">
                        10k+ properties
                    </h1>
                    <p className="text-[#002353] text-base font-normal">
                        and house ready for occupancy
                    </p>
                </div>
            </div>
        </div>
    );
};
export default Analytics;