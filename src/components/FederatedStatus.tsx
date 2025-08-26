import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, Server, Shield, Clock } from "lucide-react";

const FederatedStatus = () => {
  const federatedNodes = [
    { id: "node-01", name: "Memorial Hospital", status: "active", lastUpdate: "2 min ago", progress: 85 },
    { id: "node-02", name: "City Medical Center", status: "active", lastUpdate: "1 min ago", progress: 92 },
    { id: "node-03", name: "Regional Clinic", status: "syncing", lastUpdate: "5 min ago", progress: 67 },
  ];

  return (
    <section className="py-16 px-6 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-foreground">Federated Learning Network</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Real-time monitoring of your federated learning nodes. Models are trained collaboratively while keeping data secure.
          </p>
        </div>

        {/* Network Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card className="p-6 text-center medical-card">
            <div className="p-3 rounded-lg medical-gradient w-fit mx-auto mb-3">
              <Server className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-foreground">3</div>
            <div className="text-sm text-muted-foreground">Active Nodes</div>
          </Card>

          <Card className="p-6 text-center medical-card">
            <div className="p-3 rounded-lg bg-gradient-to-r from-accent to-accent/80 w-fit mx-auto mb-3">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-foreground">1,247</div>
            <div className="text-sm text-muted-foreground">Cases Processed</div>
          </Card>

          <Card className="p-6 text-center medical-card">
            <div className="p-3 rounded-lg medical-gradient w-fit mx-auto mb-3">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-foreground">100%</div>
            <div className="text-sm text-muted-foreground">Privacy Protected</div>
          </Card>

          <Card className="p-6 text-center medical-card">
            <div className="p-3 rounded-lg bg-gradient-to-r from-accent to-accent/80 w-fit mx-auto mb-3">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-foreground">94.2%</div>
            <div className="text-sm text-muted-foreground">Model Accuracy</div>
          </Card>
        </div>

        {/* Node Status */}
        <Card className="p-6 medical-card">
          <h3 className="text-xl font-semibold mb-6 text-foreground">Network Nodes Status</h3>
          <div className="space-y-6">
            {federatedNodes.map((node) => (
              <div key={node.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      node.status === "active" ? "bg-accent animate-pulse" : 
                      node.status === "syncing" ? "bg-primary processing-animation" : "bg-muted-foreground"
                    }`} />
                    <div>
                      <div className="font-medium text-foreground">{node.name}</div>
                      <div className="text-sm text-muted-foreground">Last update: {node.lastUpdate}</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right min-w-[80px]">
                    <div className="text-sm font-medium text-foreground">{node.progress}%</div>
                    <Progress value={node.progress} className="w-20 h-2" />
                  </div>
                  <Badge variant={node.status === "active" ? "default" : "secondary"} className="capitalize">
                    {node.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
};

export default FederatedStatus;