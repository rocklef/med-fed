import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { User, FileText, Image, Upload, Shield, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PatientData = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsUploading(false);
        setUploadProgress(0);
        toast({
          title: "Patient data added successfully",
          description: "Data has been securely encrypted and stored in the federated system.",
        });
      }
    }, 200);
  };

  const recentPatients = [
    { id: "P001", name: "John D.", age: 67, condition: "Hypertension", lastVisit: "2024-01-15" },
    { id: "P002", name: "Sarah M.", age: 45, condition: "Diabetes Type 2", lastVisit: "2024-01-14" },
    { id: "P003", name: "Robert K.", age: 72, condition: "Heart Disease", lastVisit: "2024-01-13" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pt-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg medical-gradient">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Patient Data Management</h1>
              <p className="text-muted-foreground">Securely add and manage patient information for AI processing</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-accent/10 text-accent px-4 py-2 rounded-lg w-fit">
            <Shield className="h-4 w-4" />
            <span className="text-sm font-medium">End-to-end encrypted • HIPAA compliant</span>
          </div>
        </div>

        <Tabs defaultValue="add-patient" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="add-patient">Add Patient</TabsTrigger>
            <TabsTrigger value="upload-data">Upload Medical Data</TabsTrigger>
            <TabsTrigger value="patient-list">Patient Records</TabsTrigger>
          </TabsList>

          <TabsContent value="add-patient" className="space-y-6">
            <Card className="p-8 medical-card">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input 
                      id="firstName" 
                      placeholder="Enter first name" 
                      required 
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input 
                      id="lastName" 
                      placeholder="Enter last name" 
                      required 
                      className="bg-background"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input 
                      id="age" 
                      type="number" 
                      placeholder="Age" 
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="patientId">Patient ID</Label>
                    <Input 
                      id="patientId" 
                      placeholder="Auto-generated" 
                      disabled 
                      className="bg-muted"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medicalHistory">Medical History</Label>
                  <Textarea 
                    id="medicalHistory" 
                    placeholder="Enter relevant medical history, current medications, allergies, etc."
                    className="min-h-32 bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentCondition">Current Condition/Chief Complaint</Label>
                  <Textarea 
                    id="currentCondition" 
                    placeholder="Describe the current medical condition or reason for visit"
                    className="bg-background"
                  />
                </div>

                {isUploading && (
                  <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm">Encrypting and storing patient data...</span>
                    </div>
                    <Progress value={uploadProgress} className="w-full" />
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full medical-gradient text-white"
                  disabled={isUploading}
                >
                  {isUploading ? "Processing..." : "Add Patient Record"}
                </Button>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="upload-data" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 medical-card hover:shadow-lg transition-shadow group">
                <div className="text-center">
                  <div className="p-4 rounded-lg medical-gradient w-fit mx-auto mb-4 group-hover:animate-glow">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Clinical Documents</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload discharge summaries, progress notes, consultation reports
                  </p>
                  <Button className="w-full" variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Documents
                  </Button>
                </div>
              </Card>

              <Card className="p-6 medical-card hover:shadow-lg transition-shadow group">
                <div className="text-center">
                  <div className="p-4 rounded-lg medical-gradient w-fit mx-auto mb-4 group-hover:animate-glow">
                    <Image className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Medical Imaging</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    X-rays, CT scans, MRIs, ultrasounds, and other imaging studies
                  </p>
                  <Button className="w-full" variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Images
                  </Button>
                </div>
              </Card>

              <Card className="p-6 medical-card hover:shadow-lg transition-shadow group">
                <div className="text-center">
                  <div className="p-4 rounded-lg medical-gradient w-fit mx-auto mb-4 group-hover:animate-glow">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Laboratory Results</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Blood work, urinalysis, pathology reports, genetic tests
                  </p>
                  <Button className="w-full" variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Results
                  </Button>
                </div>
              </Card>
            </div>

            <Card className="p-6 medical-card">
              <h3 className="text-lg font-semibold mb-4">Privacy & Security Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-accent" />
                    <span className="text-sm">All data encrypted at rest and in transit</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-accent" />
                    <span className="text-sm">HIPAA compliant infrastructure</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-accent" />
                    <span className="text-sm">Federated learning preserves data locality</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-accent" />
                    <span className="text-sm">Automatic data anonymization</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-accent" />
                    <span className="text-sm">Audit trails for all access</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-accent" />
                    <span className="text-sm">Role-based access control</span>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="patient-list" className="space-y-6">
            <Card className="p-6 medical-card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Recent Patient Records</h3>
                <Badge variant="outline" className="text-accent border-accent">
                  {recentPatients.length} Records
                </Badge>
              </div>
              
              <div className="space-y-4">
                {recentPatients.map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-lg medical-gradient">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium">{patient.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {patient.age} years • {patient.condition}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-medium">ID: {patient.id}</div>
                      <div className="text-xs text-muted-foreground">Last visit: {patient.lastVisit}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PatientData;