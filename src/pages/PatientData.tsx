import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { User, FileText, Image, Upload, Shield, CheckCircle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const PatientData = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [genderValue, setGenderValue] = useState<string | undefined>(undefined);
  const { toast } = useToast();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const [patients, setPatients] = useState<any[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<any>(null);

  const fetchPatients = async () => {
    try {
      const res = await fetch(`${API_URL}/api/patients`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setPatients(Array.isArray(data) ? data : []);
    } catch {
      // ignore for now, keep static view empty
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [API_URL]);

  const handleDeleteClick = (patient: any) => {
    setPatientToDelete(patient);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!patientToDelete?.id) return;

    try {
      const response = await fetch(`${API_URL}/api/patients/${patientToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete patient (HTTP ${response.status})`);
      }

      toast({
        title: 'Patient deleted successfully',
        description: `${patientToDelete.firstName} ${patientToDelete.lastName} has been removed.`,
      });

      setDeleteDialogOpen(false);
      setPatientToDelete(null);
      fetchPatients(); // Refresh the list
    } catch (error) {
      toast({
        title: 'Failed to delete patient',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);

      const firstName = String(formData.get('firstName') || '').trim();
      const lastName = String(formData.get('lastName') || '').trim();
      const ageStr = String(formData.get('age') || '').trim();
      const contactNumber = String(formData.get('contactNumber') || '').trim();
      const email = String(formData.get('email') || '').trim();
      const address = String(formData.get('address') || '').trim();
      const medicalHistory = String(formData.get('medicalHistory') || '').trim();
      const currentCondition = String(formData.get('currentCondition') || '').trim();
      const gender = (genderValue || '').toLowerCase();

      if (!firstName || !lastName) {
        throw new Error('First name and Last name are required.');
      }

      // Backend requires DOB (YYYY-MM-DD). If user provided age, derive an approximate DOB.
      let dob = '1970-01-01';
      const ageNum = Number(ageStr);
      if (!Number.isNaN(ageNum) && ageNum > 0 && ageNum < 130) {
        const now = new Date();
        const approx = new Date(now.getTime() - ageNum * 365.25 * 24 * 60 * 60 * 1000);
        const yyyy = approx.getUTCFullYear();
        const mm = String(approx.getUTCMonth() + 1).padStart(2, '0');
        const dd = String(approx.getUTCDate()).padStart(2, '0');
        dob = `${yyyy}-${mm}-${dd}`;
      }

      // Basic optional validations
      const cleanedContact = contactNumber || undefined;
      const cleanedEmail = email && /.+@.+\..+/.test(email) ? email : (email ? undefined : undefined);
      const cleanedAddress = address || undefined;

      // Parse conditions and medications from medical history
      const conditions = medicalHistory ? medicalHistory.split(/,|\n/).map(s => s.trim()).filter(Boolean) : [];
      
      // Simple medication extraction - looks for common medication patterns
      // This is a basic implementation that could be enhanced
      let medications: string[] = [];
      if (medicalHistory) {
        // Look for common medication indicators
        const medicationRegex = /(?:medications?:?\s*)(.*?)(?:\n|$)/gi;
        const medicationMatch = medicalHistory.match(medicationRegex);
        if (medicationMatch) {
          // Extract medication names from the matched text
          medications = medicationMatch.flatMap(match => 
            match.replace(/medications?:?\s*/i, '').split(/,|\n/).map(s => s.trim()).filter(Boolean)
          );
        }
        
        // If no explicit "medications" section found, check for common medication patterns
        if (medications.length === 0) {
          // Look for common medication dosage patterns (e.g., "Lisinopril 10mg")
          const dosageRegex = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s*\d+(?:\.\d+)?\s*(?:mg|mcg|g|ml|%|units?|iu)\b/gi;
          const dosageMatches = medicalHistory.match(dosageRegex);
          if (dosageMatches) {
            medications = dosageMatches;
          }
        }
      }

      // Compose payload expected by the API
      const payload = {
        firstName,
        lastName,
        dob,
        gender: (gender === 'male' || gender === 'female' || gender === 'other') ? (gender as 'male'|'female'|'other') : 'other',
        contactNumber: cleanedContact,
        email: cleanedEmail,
        address: cleanedAddress,
        conditions,
        medications,
        notes: currentCondition || medicalHistory || ''
      };

      // Progress indicator while request is sent
      setUploadProgress(25);

      const response = await fetch(`${API_URL}/api/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      setUploadProgress(80);

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || `Failed to create patient (HTTP ${response.status})`);
      }

      setUploadProgress(100);
      toast({
        title: 'Patient data added successfully',
        description: `Created record for ${data.firstName} ${data.lastName} (ID: ${data.id || 'N/A'})`,
      });

      form.reset();
      setGenderValue(undefined);
      // refresh list
      fetchPatients();
    } catch (err) {
      toast({
        title: 'Failed to add patient',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      // Small delay so progress bar is visible
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 300);
    }
  };

  // derive display-friendly list from DB patients
  const recentPatients = patients.slice(0, 10).map((p) => ({
    id: p.id,
    name: `${p.firstName} ${p.lastName?.charAt(0) || ''}.`,
    age: p.dob ? Math.max(0, Math.floor((Date.now() - new Date(p.dob).getTime()) / (365.25*24*60*60*1000))) : '-',
    condition: Array.isArray(p.conditions) && p.conditions.length ? p.conditions[0] : '—',
    lastVisit: p.updatedAt ? new Date(p.updatedAt).toISOString().split('T')[0] : ''
  }));

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
                      name="firstName"
                      placeholder="Enter first name" 
                      required 
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input 
                      id="lastName" 
                      name="lastName"
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
                      name="age"
                      type="number" 
                      placeholder="Age" 
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={genderValue} onValueChange={setGenderValue}>
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

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="contactNumber">Contact Number</Label>
                    <Input 
                      id="contactNumber" 
                      name="contactNumber"
                      placeholder="e.g., +1 555-123-4567"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      name="email"
                      type="email"
                      placeholder="e.g., patient@example.com" 
                      className="bg-background"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input 
                    id="address" 
                    name="address"
                    placeholder="Street, City, State, ZIP"
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medicalHistory">Medical History</Label>
                  <Textarea 
                    id="medicalHistory" 
                    name="medicalHistory"
                    placeholder="Enter relevant medical history, current medications, allergies, etc."
                    className="min-h-32 bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentCondition">Current Condition/Chief Complaint</Label>
                  <Textarea 
                    id="currentCondition" 
                    name="currentCondition"
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
                {recentPatients.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No patients found. Add a patient to get started.
                  </div>
                ) : (
                  recentPatients.map((patientDisplay) => {
                    const patient = patients.find(p => p.id === patientDisplay.id);
                    return (
                      <div key={patientDisplay.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="p-2 rounded-lg medical-gradient">
                            <User className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{patientDisplay.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {patientDisplay.age} years • {patientDisplay.condition}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-sm font-medium">ID: {patientDisplay.id}</div>
                            <div className="text-xs text-muted-foreground">Last visit: {patientDisplay.lastVisit}</div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => patient && handleDeleteClick(patient)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the patient record for{" "}
                <strong>
                  {patientToDelete?.firstName} {patientToDelete?.lastName}
                </strong>
                . This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default PatientData;