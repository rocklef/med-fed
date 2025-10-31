import { Button } from "@/components/ui/button";
import { Shield, Users, Activity } from "lucide-react";

const Header = () => {
  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg medical-gradient">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">F-MedLLM</h1>
              <p className="text-sm text-muted-foreground">Federated Medical AI Platform</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              Dashboard
            </Button>
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              <a href="/patient-data">Patient Data</a>
            </Button>
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              <a href="/medical-assistant">Medical Assistant</a>
            </Button>
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              <a href="/payments">Payments</a>
            </Button>
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              Analytics
            </Button>
          </nav>

          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1 text-accent">
                <Users className="h-4 w-4" />
                <span>3 Nodes</span>
              </div>
              <div className="flex items-center space-x-1 text-accent">
                <Activity className="h-4 w-4" />
                <span>Active</span>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Settings
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;