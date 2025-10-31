import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Shield, 
  Bell, 
  Palette, 
  Database, 
  Network, 
  Zap,
  Save,
  RotateCcw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");
  
  // Form states
  const [generalSettings, setGeneralSettings] = useState({
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@hospital.com",
    role: "Physician",
    notifications: true,
    twoFactor: false
  });
  
  const [aiSettings, setAiSettings] = useState({
    model: "llama3:latest",
    temperature: 0.7,
    maxTokens: 2048,
    contextLength: 4096,
    autoSaveChats: true
  });
  
  const [privacySettings, setPrivacySettings] = useState({
    encryptData: true,
    anonymizePatients: true,
    auditLogs: true,
    dataRetention: "2 years"
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    inAppAlerts: true,
    aiCompletion: true,
    systemUpdates: false,
    paymentConfirmations: true
  });
  
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: "dark",
    fontSize: "medium",
    language: "en"
  });

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your settings have been successfully updated.",
    });
  };

  const handleReset = () => {
    // Reset to default values
    setGeneralSettings({
      name: "Dr. Sarah Johnson",
      email: "sarah.johnson@hospital.com",
      role: "Physician",
      notifications: true,
      twoFactor: false
    });
    
    setAiSettings({
      model: "llama3:latest",
      temperature: 0.7,
      maxTokens: 2048,
      contextLength: 4096,
      autoSaveChats: true
    });
    
    setPrivacySettings({
      encryptData: true,
      anonymizePatients: true,
      auditLogs: true,
      dataRetention: "2 years"
    });
    
    setNotificationSettings({
      emailNotifications: true,
      inAppAlerts: true,
      aiCompletion: true,
      systemUpdates: false,
      paymentConfirmations: true
    });
    
    setAppearanceSettings({
      theme: "dark",
      fontSize: "medium",
      language: "en"
    });
    
    toast({
      title: "Settings Reset",
      description: "Settings have been reset to default values.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pt-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg medical-gradient">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Settings</h1>
              <p className="text-muted-foreground">Manage your application preferences and configurations</p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="ai">AI Model</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card className="p-6 medical-card">
              <div className="flex items-center space-x-2 mb-6">
                <User className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Profile Settings</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={generalSettings.name}
                    onChange={(e) => setGeneralSettings({...generalSettings, name: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={generalSettings.email}
                    onChange={(e) => setGeneralSettings({...generalSettings, email: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={generalSettings.role} onValueChange={(value) => setGeneralSettings({...generalSettings, role: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="physician">Physician</SelectItem>
                      <SelectItem value="nurse">Nurse</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="researcher">Researcher</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive system notifications</p>
                  </div>
                  <Switch 
                    checked={generalSettings.notifications}
                    onCheckedChange={(checked) => setGeneralSettings({...generalSettings, notifications: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Add extra security to your account</p>
                  </div>
                  <Switch 
                    checked={generalSettings.twoFactor}
                    onCheckedChange={(checked) => setGeneralSettings({...generalSettings, twoFactor: checked})}
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <Card className="p-6 medical-card">
              <div className="flex items-center space-x-2 mb-6">
                <Zap className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">AI Model Configuration</h3>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="model">AI Model</Label>
                  <Select value={aiSettings.model} onValueChange={(value) => setAiSettings({...aiSettings, model: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="llama3:latest">Llama 3 (Latest)</SelectItem>
                      <SelectItem value="llama3:7b">Llama 3 (7B)</SelectItem>
                      <SelectItem value="llama3:13b">Llama 3 (13B)</SelectItem>
                      <SelectItem value="llama3:70b">Llama 3 (70B)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">Select the AI model for medical assistance</p>
                </div>
                
                <div className="space-y-2">
                  <Label>Temperature: {aiSettings.temperature}</Label>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.1"
                    value={aiSettings.temperature}
                    onChange={(e) => setAiSettings({...aiSettings, temperature: parseFloat(e.target.value)})}
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground">Controls randomness in responses (0 = deterministic, 1 = creative)</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="maxTokens">Max Tokens</Label>
                    <Input 
                      id="maxTokens" 
                      type="number"
                      value={aiSettings.maxTokens}
                      onChange={(e) => setAiSettings({...aiSettings, maxTokens: parseInt(e.target.value)})}
                    />
                    <p className="text-sm text-muted-foreground">Maximum tokens per response</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contextLength">Context Length</Label>
                    <Input 
                      id="contextLength" 
                      type="number"
                      value={aiSettings.contextLength}
                      onChange={(e) => setAiSettings({...aiSettings, contextLength: parseInt(e.target.value)})}
                    />
                    <p className="text-sm text-muted-foreground">Maximum context window size</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4">
                  <div>
                    <Label>Auto-save Chat History</Label>
                    <p className="text-sm text-muted-foreground">Automatically save AI conversations</p>
                  </div>
                  <Switch 
                    checked={aiSettings.autoSaveChats}
                    onCheckedChange={(checked) => setAiSettings({...aiSettings, autoSaveChats: checked})}
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card className="p-6 medical-card">
              <div className="flex items-center space-x-2 mb-6">
                <Shield className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Privacy & Security</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Encrypt Patient Data</Label>
                    <p className="text-sm text-muted-foreground">End-to-end encryption for all patient information</p>
                  </div>
                  <Switch 
                    checked={privacySettings.encryptData}
                    onCheckedChange={(checked) => setPrivacySettings({...privacySettings, encryptData: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Anonymize Patient Data</Label>
                    <p className="text-sm text-muted-foreground">Remove identifying information in AI processing</p>
                  </div>
                  <Switch 
                    checked={privacySettings.anonymizePatients}
                    onCheckedChange={(checked) => setPrivacySettings({...privacySettings, anonymizePatients: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Audit Logs</Label>
                    <p className="text-sm text-muted-foreground">Track all system access and modifications</p>
                  </div>
                  <Switch 
                    checked={privacySettings.auditLogs}
                    onCheckedChange={(checked) => setPrivacySettings({...privacySettings, auditLogs: checked})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dataRetention">Data Retention Period</Label>
                  <Select value={privacySettings.dataRetention} onValueChange={(value) => setPrivacySettings({...privacySettings, dataRetention: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6 months">6 Months</SelectItem>
                      <SelectItem value="1 year">1 Year</SelectItem>
                      <SelectItem value="2 years">2 Years</SelectItem>
                      <SelectItem value="5 years">5 Years</SelectItem>
                      <SelectItem value="indefinite">Indefinite</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">How long to retain patient data</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="p-6 medical-card">
              <div className="flex items-center space-x-2 mb-6">
                <Bell className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Notification Preferences</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive important updates via email</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailNotifications: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>In-App Alerts</Label>
                    <p className="text-sm text-muted-foreground">Show notifications within the application</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.inAppAlerts}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, inAppAlerts: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>AI Query Completion</Label>
                    <p className="text-sm text-muted-foreground">Notify when AI processing is complete</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.aiCompletion}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, aiCompletion: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>System Updates</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications about system status</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.systemUpdates}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, systemUpdates: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Payment Confirmations</Label>
                    <p className="text-sm text-muted-foreground">Notify about payment transactions</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.paymentConfirmations}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, paymentConfirmations: checked})}
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <Card className="p-6 medical-card">
              <div className="flex items-center space-x-2 mb-6">
                <Palette className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Appearance Settings</h3>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <div className="flex space-x-4">
                    <Button 
                      variant={appearanceSettings.theme === "light" ? "default" : "outline"}
                      onClick={() => setAppearanceSettings({...appearanceSettings, theme: "light"})}
                    >
                      Light
                    </Button>
                    <Button 
                      variant={appearanceSettings.theme === "dark" ? "default" : "outline"}
                      onClick={() => setAppearanceSettings({...appearanceSettings, theme: "dark"})}
                    >
                      Dark
                    </Button>
                    <Button 
                      variant={appearanceSettings.theme === "system" ? "default" : "outline"}
                      onClick={() => setAppearanceSettings({...appearanceSettings, theme: "system"})}
                    >
                      System
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fontSize">Font Size</Label>
                  <Select value={appearanceSettings.fontSize} onValueChange={(value) => setAppearanceSettings({...appearanceSettings, fontSize: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={appearanceSettings.language} onValueChange={(value) => setAppearanceSettings({...appearanceSettings, language: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-4 mt-8">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;