import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FederatedStatus from "@/components/FederatedStatus";
import DataProcessing from "@/components/DataProcessing";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BarChart, Brain, Users, FileText } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Header />
      <main>
        <HeroSection />
        <FederatedStatus />
        <DataProcessing />
        
        {/* Analytics Preview Section */}
        <section className="py-16 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-foreground">Advanced Analytics</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Gain valuable insights from your medical AI system with our comprehensive analytics dashboard.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="p-6 medical-card hover:shadow-lg transition-shadow group">
                <div className="text-center">
                  <div className="p-3 rounded-lg medical-gradient w-fit mx-auto mb-4 group-hover:animate-glow">
                    <BarChart className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Performance Metrics</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Track AI model accuracy, response times, and confidence scores
                  </p>
                </div>
              </Card>
              
              <Card className="p-6 medical-card hover:shadow-lg transition-shadow group">
                <div className="text-center">
                  <div className="p-3 rounded-lg medical-gradient w-fit mx-auto mb-4 group-hover:animate-glow">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">AI Adoption</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Monitor recommendation acceptance rates and clinician satisfaction
                  </p>
                </div>
              </Card>
              
              <Card className="p-6 medical-card hover:shadow-lg transition-shadow group">
                <div className="text-center">
                  <div className="p-3 rounded-lg medical-gradient w-fit mx-auto mb-4 group-hover:animate-glow">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Patient Outcomes</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Analyze recovery rates, readmission rates, and satisfaction scores
                  </p>
                </div>
              </Card>
              
              <Card className="p-6 medical-card hover:shadow-lg transition-shadow group">
                <div className="text-center">
                  <div className="p-3 rounded-lg medical-gradient w-fit mx-auto mb-4 group-hover:animate-glow">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Usage Statistics</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    View system usage patterns, peak hours, and data processing volumes
                  </p>
                </div>
              </Card>
            </div>
            
            <div className="text-center">
              <Button className="medical-gradient text-white" asChild>
                <Link to="/analytics">View Full Analytics Dashboard</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;