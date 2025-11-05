import Hero from "@/components/Hero";
import Features from "@/components/Features";
import PropertyGallery from "@/components/PropertyGallery";
import PropertyDetails from "@/components/PropertyDetails";
import CalendarSection from "@/components/CalendarSection";
import MapSection from "@/components/MapSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <PropertyDetails />
      <PropertyGallery />
      <CalendarSection />
      <MapSection />
      <Footer />
    </div>
  );
};

export default Index;
