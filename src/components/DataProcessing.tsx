import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Image, BarChart3, Play, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DataProcessing = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [uploading, setUploading] = useState<'images' | 'documents' | 'lab-data' | null>(null);
  const { toast } = useToast();
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const documentsInputRef = useRef<HTMLInputElement>(null);
  const labDataInputRef = useRef<HTMLInputElement>(null);

  const processingJobs = [
    { 
      id: "job-01", 
      type: "Clinical Notes", 
      status: "completed", 
      progress: 100, 
      files: 45,
      accuracy: "96.2%"
    },
    { 
      id: "job-02", 
      type: "Chest X-rays", 
      status: "processing", 
      progress: 73, 
      files: 128,
      accuracy: "94.8%"
    },
    { 
      id: "job-03", 
      type: "Lab Results", 
      status: "queued", 
      progress: 0, 
      files: 67,
      accuracy: "-"
    },
  ];

  const startProcessing = () => {
    setProcessing(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setProcessing(false);
      }
    }, 200);
  };

  const handleFileUpload = async (
    files: FileList | null, 
    uploadType: 'images' | 'documents' | 'lab-data'
  ) => {
    if (!files || files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to upload.",
        variant: "destructive",
      });
      return;
    }

    setUploading(uploadType);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      const fieldName = uploadType === 'images' ? 'images' : uploadType === 'documents' ? 'documents' : 'labData';
      
      // Add all files to form data
      Array.from(files).forEach((file) => {
        formData.append(fieldName, file);
      });

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch(`http://localhost:4000/api/uploads/${uploadType}`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }

      const result = await response.json();
      setUploadProgress(100);

      toast({
        title: "Upload successful!",
        description: result.message || `${files.length} file(s) uploaded successfully.`,
      });

      // Reset after showing success
      setTimeout(() => {
        setUploadProgress(0);
        setUploading(null);
      }, 1000);

      // Clear input
      if (uploadType === 'images' && imageInputRef.current) imageInputRef.current.value = '';
      if (uploadType === 'documents' && documentsInputRef.current) documentsInputRef.current.value = '';
      if (uploadType === 'lab-data' && labDataInputRef.current) labDataInputRef.current.value = '';

    } catch (error) {
      setUploadProgress(0);
      setUploading(null);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An error occurred during upload.",
        variant: "destructive",
      });
    }
  };

  return (
    <section className="py-16 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-foreground">Data Processing Hub</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Upload and process multimodal medical data with AI-powered labeling and summarization.
          </p>
        </div>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="upload">Data Upload</TabsTrigger>
            <TabsTrigger value="processing">Processing Queue</TabsTrigger>
            <TabsTrigger value="results">Results & Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Clinical Notes Upload */}
              <Card className="p-6 medical-card hover:shadow-lg transition-shadow group">
                <div className="text-center">
                  <div className="p-4 rounded-lg medical-gradient w-fit mx-auto mb-4 group-hover:animate-glow">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Clinical Notes</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload discharge summaries, clinical notes, and patient reports
                  </p>
                  <input
                    type="file"
                    ref={documentsInputRef}
                    onChange={(e) => handleFileUpload(e.target.files, 'documents')}
                    className="hidden"
                    multiple
                    accept=".pdf,.txt,.doc,.docx"
                  />
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => documentsInputRef.current?.click()}
                    disabled={uploading !== null}
                  >
                    {uploading === 'documents' ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Files
                      </>
                    )}
                  </Button>
                </div>
              </Card>

              {/* Medical Imaging Upload */}
              <Card className="p-6 medical-card hover:shadow-lg transition-shadow group">
                <div className="text-center">
                  <div className="p-4 rounded-lg medical-gradient w-fit mx-auto mb-4 group-hover:animate-glow">
                    <Image className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Medical Imaging</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Process X-rays, MRIs, CT scans, and other medical images
                  </p>
                  <input
                    type="file"
                    ref={imageInputRef}
                    onChange={(e) => handleFileUpload(e.target.files, 'images')}
                    className="hidden"
                    multiple
                    accept=".jpg,.jpeg,.png,.dcm,.nii,.nii.gz"
                  />
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={uploading !== null}
                  >
                    {uploading === 'images' ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Images
                      </>
                    )}
                  </Button>
                </div>
              </Card>

              {/* Lab Results Upload */}
              <Card className="p-6 medical-card hover:shadow-lg transition-shadow group">
                <div className="text-center">
                  <div className="p-4 rounded-lg medical-gradient w-fit mx-auto mb-4 group-hover:animate-glow">
                    <BarChart3 className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Lab Results</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Import structured lab data, blood work, and diagnostic tests
                  </p>
                  <input
                    type="file"
                    ref={labDataInputRef}
                    onChange={(e) => handleFileUpload(e.target.files, 'lab-data')}
                    className="hidden"
                    multiple
                    accept=".csv,.xlsx,.json,.xml"
                  />
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => labDataInputRef.current?.click()}
                    disabled={uploading !== null}
                  >
                    {uploading === 'lab-data' ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Data
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </div>

            {/* Upload Progress */}
            {uploading && (
              <Card className="p-6 medical-card">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="font-medium">
                      Uploading {uploading === 'images' ? 'images' : uploading === 'documents' ? 'documents' : 'lab data'}...
                    </span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Processing files...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                </div>
              </Card>
            )}

            {/* Processing Demo */}
            <Card className="p-6 medical-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">AI Processing Demo</h3>
                <Button 
                  onClick={startProcessing} 
                  disabled={processing}
                  className="medical-gradient text-white"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {processing ? "Processing..." : "Start Demo"}
                </Button>
              </div>
              
              {processing && (
                <div className="space-y-4">
                  <Progress value={uploadProgress} className="w-full" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Analyzing multimodal data...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="processing" className="space-y-6">
            <Card className="p-6 medical-card">
              <h3 className="text-lg font-semibold mb-6">Active Processing Jobs</h3>
              <div className="space-y-4">
                {processingJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {job.status === "completed" && <CheckCircle className="h-5 w-5 text-accent" />}
                        {job.status === "processing" && <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
                        {job.status === "queued" && <AlertCircle className="h-5 w-5 text-muted-foreground" />}
                      </div>
                      <div>
                        <div className="font-medium">{job.type}</div>
                        <div className="text-sm text-muted-foreground">{job.files} files</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">Accuracy: {job.accuracy}</div>
                        <Progress value={job.progress} className="w-24 h-2" />
                      </div>
                      <Badge variant={
                        job.status === "completed" ? "default" : 
                        job.status === "processing" ? "secondary" : "outline"
                      }>
                        {job.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 medical-card">
                <h3 className="text-lg font-semibold mb-4">Model Performance</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Labeling Accuracy</span>
                    <span className="font-mono text-accent">94.8%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Processing Speed</span>
                    <span className="font-mono text-accent">2.3s/case</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Data Privacy Score</span>
                    <span className="font-mono text-accent">100%</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6 medical-card">
                <h3 className="text-lg font-semibold mb-4">Recent Outputs</h3>
                <div className="space-y-3">
                  <div className="p-3 rounded bg-muted/30">
                    <div className="text-sm font-medium">Patient Summary Generated</div>
                    <div className="text-xs text-muted-foreground">67-year-old male with chest pain...</div>
                  </div>
                  <div className="p-3 rounded bg-muted/30">
                    <div className="text-sm font-medium">X-ray Classified</div>
                    <div className="text-xs text-muted-foreground">Normal chest radiograph, confidence: 96.2%</div>
                  </div>
                  <div className="p-3 rounded bg-muted/30">
                    <div className="text-sm font-medium">Lab Results Parsed</div>
                    <div className="text-xs text-muted-foreground">45 biomarkers extracted and normalized</div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default DataProcessing;