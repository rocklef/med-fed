import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Brain, Send, User, Bot, FileText, Image, BarChart3, AlertTriangle, Clock, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
  type?: "text" | "analysis" | "suggestion";
}

const MedicalAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm your F-MedLLM AI Medical Assistant. I can help you with medical queries, analyze patient data, provide clinical insights, and assist with differential diagnosis. How can I help you today?",
      sender: "assistant",
      timestamp: new Date(),
      type: "text"
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickQuestions = [
    "Analyze chest X-ray findings",
    "Differential diagnosis for chest pain",
    "Drug interactions checker",
    "Lab values interpretation",
    "ICD-10 code lookup",
    "Treatment guidelines"
  ];

  const simulateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes("chest pain")) {
      return `Based on your query about chest pain, here are key considerations:

**Differential Diagnosis:**
• Acute coronary syndrome (ACS)
• Pulmonary embolism
• Aortic dissection
• Pneumothorax
• Gastroesophageal reflux

**Initial Assessment:**
• Obtain 12-lead ECG immediately
• Check vital signs and oxygen saturation
• Pain characteristics (PQRST)
• Cardiac biomarkers (troponin)

**Red Flag Symptoms:**
• Sudden onset severe pain
• Radiation to arm/jaw
• Diaphoresis
• Shortness of breath

Would you like me to elaborate on any specific aspect or discuss diagnostic criteria?`;
    }
    
    if (lowerMessage.includes("x-ray") || lowerMessage.includes("imaging")) {
      return `For chest X-ray analysis, I can help with:

**Systematic Approach:**
• Technical quality assessment
• Cardiac silhouette evaluation
• Pulmonary field analysis
• Bone and soft tissue review

**Common Findings:**
• Consolidation patterns
• Pleural effusions
• Pneumothorax
• Cardiomegaly

Please upload the imaging study or describe the specific findings you'd like me to analyze. I can provide interpretation assistance while emphasizing that final diagnosis should always involve clinical correlation.`;
    }

    if (lowerMessage.includes("lab") || lowerMessage.includes("blood")) {
      return `I can help interpret laboratory values and provide clinical context:

**Common Lab Panels:**
• Complete Blood Count (CBC)
• Basic Metabolic Panel (BMP)
• Liver Function Tests (LFTs)
• Cardiac biomarkers
• Inflammatory markers

**Key Considerations:**
• Reference ranges may vary by lab
• Clinical context is crucial
• Age and gender variations
• Drug interactions affecting results

Please share the specific lab values you'd like me to review, and I'll provide interpretation guidance along with potential clinical implications.`;
    }

    return `Thank you for your question. I'm analyzing your query and will provide evidence-based medical information to assist with your clinical decision-making.

Please note that this AI assistance is meant to support clinical judgment, not replace it. Always consider:
• Patient's complete clinical picture
• Local treatment guidelines
• Individual patient factors
• Need for specialist consultation

Is there a specific aspect of this case you'd like me to focus on?`;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date(),
      type: "text"
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate AI processing time
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: simulateAIResponse(inputMessage),
        sender: "assistant",
        timestamp: new Date(),
        type: "analysis"
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
      
      toast({
        title: "Analysis complete",
        description: "AI medical assistant has provided clinical insights.",
      });
    }, 2000);
  };

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pt-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg medical-gradient">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">AI Medical Assistant</h1>
              <p className="text-muted-foreground">Get AI-powered clinical insights and medical guidance</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-accent border-accent">
              <BookOpen className="h-3 w-3 mr-1" />
              Evidence-based
            </Badge>
            <Badge variant="outline" className="text-accent border-accent">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Clinical decision support
            </Badge>
            <Badge variant="outline" className="text-accent border-accent">
              <Clock className="h-3 w-3 mr-1" />
              Real-time analysis
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] medical-card flex flex-col">
              {/* Messages */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`flex space-x-3 max-w-[80%] ${message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""}`}>
                      <div className={`p-2 rounded-lg ${message.sender === "user" ? "medical-gradient" : "bg-muted"}`}>
                        {message.sender === "user" ? (
                          <User className="h-5 w-5 text-white" />
                        ) : (
                          <Bot className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className={`rounded-lg p-4 ${
                        message.sender === "user" 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted"
                      }`}>
                        <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                        <div className="text-xs opacity-60 mt-2">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex space-x-3 max-w-[80%]">
                      <div className="p-2 rounded-lg bg-muted">
                        <Bot className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="rounded-lg p-4 bg-muted">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <Textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about symptoms, differential diagnosis, treatment guidelines..."
                    className="flex-1 min-h-[50px] max-h-32 bg-background"
                    rows={2}
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isTyping}
                    className="medical-gradient text-white"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Questions */}
            <Card className="p-4 medical-card">
              <h3 className="font-semibold mb-4 text-foreground">Quick Questions</h3>
              <div className="space-y-2">
                {quickQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start text-left h-auto p-3 hover:bg-muted/50"
                    onClick={() => handleQuickQuestion(question)}
                  >
                    <span className="text-sm">{question}</span>
                  </Button>
                ))}
              </div>
            </Card>

            {/* AI Capabilities */}
            <Card className="p-4 medical-card">
              <h3 className="font-semibold mb-4 text-foreground">AI Capabilities</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-sm">Clinical documentation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Image className="h-4 w-4 text-primary" />
                  <span className="text-sm">Medical imaging analysis</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <span className="text-sm">Lab result interpretation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Brain className="h-4 w-4 text-primary" />
                  <span className="text-sm">Differential diagnosis</span>
                </div>
              </div>
            </Card>

            {/* Disclaimer */}
            <Card className="p-4 medical-card border-orange-200 bg-orange-50/50 dark:bg-orange-950/20">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm text-orange-800 dark:text-orange-200">Medical Disclaimer</h4>
                  <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                    This AI assistant provides clinical decision support only. Always verify information and use clinical judgment.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalAssistant;