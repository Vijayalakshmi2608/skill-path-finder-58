import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import SocialProof from "@/components/SocialProof";
import ProblemSection from "@/components/ProblemSection";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import Stats from "@/components/Stats";
import Testimonials from "@/components/Testimonials";
import ForColleges from "@/components/ForColleges";
import Footer from "@/components/Footer";

const Index = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <Hero />
    <SocialProof />
    <ProblemSection />
    <HowItWorks />
    <Features />
    <Stats />
    <Testimonials />
    <ForColleges />
    <Footer />
  </div>
);

export default Index;
