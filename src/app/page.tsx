import BenefitSection from "@/components/section/benefitSection";
import ContactSection from "@/components/section/contactSection";
import HeroSection from "@/components/section/heroSection";
import PropertySection from "@/components/section/propertySection";
import ServiceSection from "@/components/section/serviceSection";

export default function Home() {
  return (
    <div className="items-center min-h-screen w-full">
      <HeroSection />
      <BenefitSection />
      <PropertySection />
      <ServiceSection />
      <ContactSection />
    </div>
  );
}
