import Image from "next/image";
import Button from "../button";


const BenefitSection: React.FC = () => {
    return (
        <section id="heroSection" className="text-[#002353] flex py-[200px] px-[160px] gap-[64px] bg-white min-h-dvh w-full">
            {/* Grid 1 */}
            <div className="flex flex-col w-fit bg-[#F7F7FD] border-[1.5px] justify-between border-[#D7E7FF] rounded-[8px] ">
                <div className="flex flex-col gap-[24px] pt-[40px] pl-[40px] pr-[67px]">
                    <div className="flex flex-col gap-[16px] ">
                        <h1 className="text-[#002353] text-[32px] font-bold leading-[125%]">The new way to find your new home</h1>
                        <p className="text-[#002353]/70 text-[16px] font-normal leading-[160%]">Find your dream place to live in with more than 10k+ properties listed.</p>
                    </div>
                    <Button variant="tertiary">Browse Properties</Button>
                </div>
                <Image
                    src="/benefitSection/property.svg"
                    alt="property"
                    width={360}
                    height={300}
                    className="ml-auto"
                />
            </div>
            {/* Grid 2 */}
            <div className="w-full gap-[32px] grid grid-cols-2 grid-rows-2 gap-x-[24px] gap-y-[64px]">
                <div>
                    <Image
                        src="/benefitSection/insurance.svg"
                        alt="Insurance"
                        width={64}
                        height={64}
                        className="object-cover"
                    />
                    <h1 className="text-[#002353] text-[24px] font-bold leading-[150%] mt-[24px]">Property Insurance</h1>
                    <p className="text-[#4D5461] text-[16px font-normal leading-[160%] mt-[16px]">We offer our customer property protection of liability coverage and insurance for their better life.</p>
                </div>
                <div>
                    <Image
                        src="/benefitSection/price.svg"
                        alt="Insurance"
                        width={64}
                        height={64}
                        className="object-cover"
                    />
                    <h1 className="text-[#002353] text-[24px] font-bold leading-[150%] mt-[24px]">Best Price</h1>
                    <p className="text-[#4D5461] text-[16px font-normal leading-[160%] mt-[16px]">Not sure what  you should be charging for your property? No need to worry, let us do the numbers for you.</p>
                </div>
                <div>
                    <Image
                        src="/benefitSection/commission.svg"
                        alt="Insurance"
                        width={64}
                        height={64}
                        className="object-cover"
                    />
                    <h1 className="text-[#002353] text-[24px] font-bold leading-[150%] mt-[24px]">Lowest Commission</h1>
                    <p className="text-[#4D5461] text-[16px font-normal leading-[160%] mt-[16px]">You no longer have to negotiate commissions and haggle with other agents it only cost 2%!</p>
                </div>
                <div>
                    <Image
                        src="/benefitSection/control.svg"
                        alt="Insurance"
                        width={64}
                        height={64}
                        className="object-cover"
                    />
                    <h1 className="text-[#002353] text-[24px] font-bold leading-[150%] mt-[24px]">Overall Control</h1>
                    <p className="text-[#4D5461] text-[16px font-normal leading-[160%] mt-[16px]">Get a virtual tour, and schedule visits before you rent or buy any properties. You get overall control.</p>
                </div>
            </div>
        </section>
    )
}
export default BenefitSection;