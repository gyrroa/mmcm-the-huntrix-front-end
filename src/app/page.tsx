import BenefitSection from "@/components/homeSection/benefitSection";
import ContactSection from "@/components/homeSection/testimonialsSection";
import HeroSection from "@/components/homeSection/heroSection";
import PropertySection from "@/components/homeSection/propertySection";
import ServiceSection from "@/components/homeSection/serviceSection";

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

