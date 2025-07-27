import Image from "next/image";
import SearchTabs from "../searchTabs";
import RecommendationCard from "./components/hero/RecommendationCard";
import Analytics from "./components/hero/Analytics";

const HeroSection: React.FC = () => {
    return (
        <section id="heroSection" className="text-[#002353] grid grid-cols-2 pt-[184px] pl-[160px] bg-gradient-to-b from-[#D2E4FF] to-[#D2E4FF]/0 min-h-dvh w-full mt-[-96px]">
            {/* Grid 1 */}
            <div className="flex flex-col">
                <div className="flex flex-col gap-[32px] w-[544px]">
                    <h1 className="font-bold text-[64px] tracking-[-0.64px] leading-[110%]">Buy, rent, or sell your property easily</h1>
                    <h1 className="font-medium text-[20px] tracking-[-0.1px] leading-[160%] w-[448px]">A great platform to buy, sell, or even rent your properties without any commisions.</h1>
                </div>
                <SearchTabs />
                <Analytics />
            </div>
            {/* Grid 2 */}
            <div className="relative h-full flex flex-col gap-[32px]">
                <RecommendationCard />
                <Image alt="Trust Pilot" src="/trustPilot.svg" width={261} height={156} className="absolute bottom-0 right-0 object-cover rounded-[8px]" />
                <Image alt="Hero" src="/hero.png" width={1242} height={886} className="w-full h-full object-cover" />
            </div>
        </section>
    )
}
export default HeroSection;