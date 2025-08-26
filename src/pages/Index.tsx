import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FederatedStatus from "@/components/FederatedStatus";
import DataProcessing from "@/components/DataProcessing";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Header />
      <main>
        <HeroSection />
        <FederatedStatus />
        <DataProcessing />
      </main>
    </div>
  );
};

export default Index;
