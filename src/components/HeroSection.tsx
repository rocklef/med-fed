import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Car, Zap, Navigation, Activity, Cpu, RadioIcon } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          controls={false}
          controlsList="nodownload noplaybackrate noremoteplayback"
          disablePictureInPicture
          className="w-full h-full object-cover"
        >
          <source src="https://res.cloudinary.com/dfwm8asv8/video/upload/v1755524790/Futuristic_Hospital_AI_Data_Visualization_ysdkmu.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 container mx-auto max-w-6xl px-6 text-center">
        <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
          <Zap className="h-4 w-4" />
          <span>AI-Powered Healthcare</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white animate-fade-in bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
          Smart Hospital Management
        </h1>
        
        <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-in">
          Real-time patient data, hospital operations, and AI insights
        </p>
        
        <div className="animate-fade-in">
          <Button size="lg" className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white hover:shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300 px-8 py-4 text-lg hover:scale-105">
            Learn More
          </Button>
        </div>
        
        {/* Tech indicators */}
        <div className="flex justify-center items-center space-x-8 mt-12 animate-fade-in">
          <div className="flex items-center space-x-2 text-white/80">
            <Activity className="h-5 w-5 text-cyan-400" />
            <span className="text-sm">Clinical Analytics</span>
          </div>
          <div className="flex items-center space-x-2 text-white/80">
            <RadioIcon className="h-5 w-5 text-blue-400" />
            <span className="text-sm">Real-time Monitoring</span>
          </div>
          <div className="flex items-center space-x-2 text-white/80">
            <Cpu className="h-5 w-5 text-purple-400" />
            <span className="text-sm">AI-Driven Care</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;