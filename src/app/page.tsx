import BenefitSection from "@/components/section/benefitSection";
import HeroSection from "@/components/section/heroSection";
import PropertySection from "@/components/section/propertySection";

export default function Home() {
  return (
    <div className="items-center min-h-screen">
      <HeroSection />
      <BenefitSection />
      <PropertySection />
      <footer className="bg-white w-full row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        sample footer content
      </footer>
    </div>
  );
}
