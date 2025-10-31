import { useState, useEffect } from "react";
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
  RotateCcw,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Define the settings structure
interface Settings {
  aiModel: {
    modelPath: string;
    temperature: number;
    maxTokens: number;
    contextLength: number;
    topP: number;
  };
  privacy: {
    encryptData: boolean;
    anonymizePatients: boolean;
    auditLogs: boolean;
    dataRetention: string;
  };
  notifications: {
    emailNotifications: boolean;
    inAppAlerts: boolean;
    aiCompletion: boolean;
    systemUpdates: boolean;
    paymentConfirmations: boolean;
  };
  appearance: {
    theme: string;
    fontSize: string;
    language: string;
  };
}

const Settings = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  
  // Form states
  const [settings, setSettings] = useState<Settings>({
    aiModel: {
      modelPath: "llama3:latest",
      temperature: 0.7,
      maxTokens: 2048,
      contextLength: 4096,
      topP: 0.9
    },
    privacy: {
      encryptData: true,
      anonymizePatients: true,
      auditLogs: true,
      dataRetention: "2 years"
    },
    notifications: {
      emailNotifications: true,
      inAppAlerts: true,
      aiCompletion: true,
      systemUpdates: false,
      paymentConfirmations: true
    },
    appearance: {
      theme: "dark",
      fontSize: "medium",
      language: "en"
    }
  });

  // Fetch current settings from backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/settings`);
        if (!response.ok) {
          throw new Error(`Failed to fetch settings (${response.status})`);
        }
        const data = await response.json();
        setSettings(data);
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast({
          title: "Error",
          description: "Failed to load settings. Using default values.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [API_URL, toast]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch(`${API_URL}/api/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        throw new Error(`Failed to save settings (${response.status})`);
      }

      const data = await response.json();
      toast({
        title: "Settings Saved",
        description: data.message || "Your settings have been successfully updated.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    const defaultSettings: Settings = {
      aiModel: {
        modelPath: "llama3:latest",
        temperature: 0.7,
        maxTokens: 2048,
        contextLength: 4096,
        topP: 0.9
      },
      privacy: {
        encryptData: true,
        anonymizePatients: true,
        auditLogs: true,
        dataRetention: "2 years"
      },
      notifications: {
        emailNotifications: true,
        inAppAlerts: true,
        aiCompletion: true,
        systemUpdates: false,
        paymentConfirmations: true
      },
      appearance: {
        theme: "dark",
        fontSize: "medium",
        language: "en"
      }
    };

    try {
      setSaving(true);
      const response = await fetch(`${API_URL}/api/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(defaultSettings)
      });

      if (!response.ok) {
        throw new Error(`Failed to reset settings (${response.status})`);
      }

      setSettings(defaultSettings);
      toast({
        title: "Settings Reset",
        description: "Settings have been reset to default values.",
      });
    } catch (error) {
      console.error("Error resetting settings:", error);
      toast({
        title: "Error",
        description: "Failed to reset settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Update specific setting values
  const updateAiModelSetting = (key: keyof Settings['aiModel'], value: any) => {
    setSettings(prev => ({
      ...prev,
      aiModel: {
        ...prev.aiModel,
        [key]: value
      }
    }));
  };

  const updatePrivacySetting = (key: keyof Settings['privacy'], value: any) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value
      }
    }));
  };

  const updateNotificationSetting = (key: keyof Settings['notifications'], value: any) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
  };

  const updateAppearanceSetting = (key: keyof Settings['appearance'], value: any) => {
    setSettings(prev => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        [key]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pt-20 px-6 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

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
                    value="Dr. Sarah Johnson"
                    disabled
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value="sarah.johnson@hospital.com"
                    disabled
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select defaultValue="physician" disabled>
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
                    checked={settings.notifications.emailNotifications || settings.notifications.inAppAlerts}
                    onCheckedChange={(checked) => {
                      updateNotificationSetting('emailNotifications', checked);
                      updateNotificationSetting('inAppAlerts', checked);
                    }}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Add extra security to your account</p>
                  </div>
                  <Switch disabled />
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
                  <Select 
                    value={settings.aiModel.modelPath} 
                    onValueChange={(value) => updateAiModelSetting('modelPath', value)}
                  >
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
                  <Label>Temperature: {settings.aiModel.temperature}</Label>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.1"
                    value={settings.aiModel.temperature}
                    onChange={(e) => updateAiModelSetting('temperature', parseFloat(e.target.value))}
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
                      value={settings.aiModel.maxTokens}
                      onChange={(e) => updateAiModelSetting('maxTokens', parseInt(e.target.value) || 2048)}
                    />
                    <p className="text-sm text-muted-foreground">Maximum tokens per response</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contextLength">Context Length</Label>
                    <Input 
                      id="contextLength" 
                      type="number"
                      value={settings.aiModel.contextLength}
                      onChange={(e) => updateAiModelSetting('contextLength', parseInt(e.target.value) || 4096)}
                    />
                    <p className="text-sm text-muted-foreground">Maximum context window size</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="topP">Top-P (Nucleus Sampling)</Label>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.1"
                    value={settings.aiModel.topP}
                    onChange={(e) => updateAiModelSetting('topP', parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground">Controls diversity of responses (0 = greedy, 1 = random)</p>
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
                    checked={settings.privacy.encryptData}
                    onCheckedChange={(checked) => updatePrivacySetting('encryptData', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Anonymize Patient Data</Label>
                    <p className="text-sm text-muted-foreground">Remove identifying information in AI processing</p>
                  </div>
                  <Switch 
                    checked={settings.privacy.anonymizePatients}
                    onCheckedChange={(checked) => updatePrivacySetting('anonymizePatients', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Audit Logs</Label>
                    <p className="text-sm text-muted-foreground">Track all system access and modifications</p>
                  </div>
                  <Switch 
                    checked={settings.privacy.auditLogs}
                    onCheckedChange={(checked) => updatePrivacySetting('auditLogs', checked)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dataRetention">Data Retention Period</Label>
                  <Select 
                    value={settings.privacy.dataRetention} 
                    onValueChange={(value) => updatePrivacySetting('dataRetention', value)}
                  >
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
                    checked={settings.notifications.emailNotifications}
                    onCheckedChange={(checked) => updateNotificationSetting('emailNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>In-App Alerts</Label>
                    <p className="text-sm text-muted-foreground">Show notifications within the application</p>
                  </div>
                  <Switch 
                    checked={settings.notifications.inAppAlerts}
                    onCheckedChange={(checked) => updateNotificationSetting('inAppAlerts', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>AI Query Completion</Label>
                    <p className="text-sm text-muted-foreground">Notify when AI processing is complete</p>
                  </div>
                  <Switch 
                    checked={settings.notifications.aiCompletion}
                    onCheckedChange={(checked) => updateNotificationSetting('aiCompletion', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>System Updates</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications about system status</p>
                  </div>
                  <Switch 
                    checked={settings.notifications.systemUpdates}
                    onCheckedChange={(checked) => updateNotificationSetting('systemUpdates', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Payment Confirmations</Label>
                    <p className="text-sm text-muted-foreground">Notify about payment transactions</p>
                  </div>
                  <Switch 
                    checked={settings.notifications.paymentConfirmations}
                    onCheckedChange={(checked) => updateNotificationSetting('paymentConfirmations', checked)}
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
                      variant={settings.appearance.theme === "light" ? "default" : "outline"}
                      onClick={() => updateAppearanceSetting('theme', "light")}
                    >
                      Light
                    </Button>
                    <Button 
                      variant={settings.appearance.theme === "dark" ? "default" : "outline"}
                      onClick={() => updateAppearanceSetting('theme', "dark")}
                    >
                      Dark
                    </Button>
                    <Button 
                      variant={settings.appearance.theme === "system" ? "default" : "outline"}
                      onClick={() => updateAppearanceSetting('theme', "system")}
                    >
                      System
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fontSize">Font Size</Label>
                  <Select 
                    value={settings.appearance.fontSize} 
                    onValueChange={(value) => updateAppearanceSetting('fontSize', value)}
                  >
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
                  <Select 
                    value={settings.appearance.language} 
                    onValueChange={(value) => updateAppearanceSetting('language', value)}
                  >
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
          <Button variant="outline" onClick={handleReset} disabled={saving}>
            <RotateCcw className={`h-4 w-4 mr-2 ${saving ? 'animate-spin' : ''}`} />
            Reset to Defaults
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;