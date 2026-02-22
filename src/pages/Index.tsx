import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/landing/HeroSection";
import ProblemSection from "@/components/landing/ProblemSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import DemoSection from "@/components/landing/DemoSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import StatsSection from "@/components/landing/StatsSection";
import CTASection from "@/components/landing/CTASection";

const Index = () => (
  <div className="min-h-screen">
    <Navbar />
    <HeroSection />
    <ProblemSection />
    <HowItWorksSection />
    <DemoSection />
    <FeaturesSection />
    <StatsSection />
    <CTASection />
    <Footer />
  </div>
);

export default Index;
