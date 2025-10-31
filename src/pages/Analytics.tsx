import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  BarChartIcon, 
  PieChart, 
  TrendingUp, 
  Activity, 
  Clock, 
  CheckCircle, 
  XCircle,
  Brain,
  Users,
  FileText,
  Image,
  Database,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  BarChart as RechartsBarChart,
  LineChart as RechartsLineChart,
  PieChart as RechartsPieChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Pie,
  Cell
} from 'recharts';

interface AnalyticsData {
  patients: {
    total: number;
    recent: number;
    genderDistribution: {
      male: number;
      female: number;
      other: number;
    };
    averageAge: number;
  };
  ai: {
    totalQueries: number;
    recentQueries: number;
    modelStatus: {
      ready: boolean;
      queueLength: number;
      processing: boolean;
    } | null;
  };
  payments: {
    total: number;
    recent: number;
    totalAmount: number;
  };
  timestamp: string;
}

interface AIPerformanceData {
  totalQueries: number;
  avgProcessingTime: number;
  avgTokensUsed: number;
  queryTypes: Record<string, number>;
  trendData: { date: string; count: number }[];
  timestamp: string;
}

interface PatientOutcomesData {
  totalPatients: number;
  ageGroups: Record<string, number>;
  topConditions: { name: string; value: number }[];
  topMedications: { name: string; value: number }[];
  genderDistribution: {
    male: number;
    female: number;
    other: number;
  };
  timestamp: string;
}

interface UsageData {
  queries: {
    total: number;
    hourlyUsage: { hour: number; queries: number }[];
    peakHour: number;
    growthData: { date: string; count: number }[];
  };
  payments: {
    total: number;
    totalAmount: number;
    averageAmount: number;
    methods: Record<string, number>;
  };
  timestamp: string;
}

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [aiPerformanceData, setAiPerformanceData] = useState<AIPerformanceData | null>(null);
  const [patientOutcomesData, setPatientOutcomesData] = useState<PatientOutcomesData | null>(null);
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const { toast } = useToast();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  const fetchData = async (endpoint: string) => {
    try {
      const response = await fetch(`${API_URL}/api/analytics/${endpoint}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${endpoint} data (${response.status})`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${endpoint} data:`, error);
      toast({
        title: "Error",
        description: `Failed to fetch ${endpoint} data. ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
      return null;
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    
    try {
      // Add a timeout to prevent hanging
      const timeout = 5000; // 5 seconds
      
      const fetchWithTimeout = async (endpoint: string) => {
        return Promise.race([
          fetchData(endpoint),
          new Promise<null>((_, reject) => 
            setTimeout(() => reject(new Error(`Timeout fetching ${endpoint} data`)), timeout)
          )
        ]).catch(error => {
          console.error(`Error fetching ${endpoint} data:`, error);
          toast({
            title: "Timeout",
            description: `Request to fetch ${endpoint} data timed out. Please check your connection.`,
            variant: "destructive",
          });
          return null;
        });
      };
      
      const [overviewData, performanceData, outcomesData, usageData] = await Promise.all([
        fetchWithTimeout('overview'),
        fetchWithTimeout('ai-performance'),
        fetchWithTimeout('patient-outcomes'),
        fetchWithTimeout('usage')
      ]);

      if (overviewData) setAnalyticsData(overviewData);
      if (performanceData) setAiPerformanceData(performanceData);
      if (outcomesData) setPatientOutcomesData(outcomesData);
      if (usageData) setUsageData(usageData);
      
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch analytics data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, []);

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    description, 
    trend 
  }: { 
    title: string; 
    value: string | number; 
    icon: any; 
    description?: string;
    trend?: "up" | "down";
  }) => (
    <Card className="p-6 medical-card hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
          {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        </div>
        <div className="p-3 rounded-lg medical-gradient">
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center">
          {trend === "up" ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
          )}
          <span className="text-sm ml-1">
            {trend === "up" ? "Increased" : "Decreased"} from last period
          </span>
        </div>
      )}
    </Card>
  );

  // Convert query types data for pie chart
  const queryTypesData = aiPerformanceData 
    ? Object.entries(aiPerformanceData.queryTypes).map(([name, value]) => ({ name, value }))
    : [];

  // Convert age groups data for bar chart
  const ageGroupsData = patientOutcomesData 
    ? Object.entries(patientOutcomesData.ageGroups).map(([name, value]) => ({ name, value }))
    : [];

  // Convert payment methods data for pie chart
  const paymentMethodsData = usageData 
    ? Object.entries(usageData.payments.methods).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pt-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg medical-gradient">
                <BarChart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
                <p className="text-muted-foreground">Comprehensive insights into your medical AI system performance</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchAllData}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              {lastUpdated && (
                <span className="text-sm text-muted-foreground">
                  Last updated: {lastUpdated}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="outline" className="text-accent border-accent">
              <Activity className="h-3 w-3 mr-1" />
              Real-time Data
            </Badge>
            <Badge variant="outline" className="text-accent border-accent">
              <Brain className="h-3 w-3 mr-1" />
              AI Performance
            </Badge>
            <Badge variant="outline" className="text-accent border-accent">
              <Users className="h-3 w-3 mr-1" />
              Patient Outcomes
            </Badge>
          </div>
        </div>

        {loading && !analyticsData ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
              <p>Loading analytics data...</p>
            </div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="performance">AI Performance</TabsTrigger>
              <TabsTrigger value="outcomes">Patient Outcomes</TabsTrigger>
              <TabsTrigger value="usage">Usage Statistics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  title="Total Patients" 
                  value={analyticsData?.patients.total || 0} 
                  icon={Users}
                  description="Registered patients"
                  trend="up"
                />
                <StatCard 
                  title="AI Queries" 
                  value={analyticsData?.ai.totalQueries || 0} 
                  icon={Brain}
                  description="Processed queries"
                  trend="up"
                />
                <StatCard 
                  title="Avg Response Time" 
                  value={aiPerformanceData ? `${aiPerformanceData.avgProcessingTime}ms` : "0ms"} 
                  icon={Clock}
                  description="Average processing time"
                  trend="down"
                />
                <StatCard 
                  title="Total Payments" 
                  value={analyticsData?.payments.totalAmount ? `$${analyticsData.payments.totalAmount.toFixed(2)}` : "$0.00"} 
                  icon={Database}
                  description="Payment volume"
                  trend="up"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6 medical-card">
                  <h3 className="text-lg font-semibold mb-4">Patient Demographics</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Male Patients</span>
                        <span className="text-sm font-medium">{analyticsData?.patients.genderDistribution.male || 0}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ 
                            width: `${analyticsData && analyticsData.patients.total > 0 
                              ? (analyticsData.patients.genderDistribution.male / analyticsData.patients.total) * 100 
                              : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Female Patients</span>
                        <span className="text-sm font-medium">{analyticsData?.patients.genderDistribution.female || 0}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-pink-500 h-2 rounded-full" 
                          style={{ 
                            width: `${analyticsData && analyticsData.patients.total > 0 
                              ? (analyticsData.patients.genderDistribution.female / analyticsData.patients.total) * 100 
                              : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Other/Unknown</span>
                        <span className="text-sm font-medium">{analyticsData?.patients.genderDistribution.other || 0}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-gray-500 h-2 rounded-full" 
                          style={{ 
                            width: `${analyticsData && analyticsData.patients.total > 0 
                              ? (analyticsData.patients.genderDistribution.other / analyticsData.patients.total) * 100 
                              : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 medical-card">
                  <h3 className="text-lg font-semibold mb-4">System Status</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Brain className="h-5 w-5 text-primary" />
                        <span>AI Model Status</span>
                      </div>
                      <Badge 
                        variant={analyticsData?.ai.modelStatus?.ready ? "default" : "destructive"}
                      >
                        {analyticsData?.ai.modelStatus?.ready ? "Online" : "Offline"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-5 w-5 text-primary" />
                        <span>Queue Length</span>
                      </div>
                      <span className="font-semibold">{analyticsData?.ai.modelStatus?.queueLength || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Activity className="h-5 w-5 text-primary" />
                        <span>Currently Processing</span>
                      </div>
                      <Badge variant={analyticsData?.ai.modelStatus?.processing ? "default" : "secondary"}>
                        {analyticsData?.ai.modelStatus?.processing ? "Yes" : "No"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Users className="h-5 w-5 text-primary" />
                        <span>Recent Patients</span>
                      </div>
                      <span className="font-semibold">+{analyticsData?.patients.recent || 0}</span>
                    </div>
                  </div>
                </Card>
              </div>

              <Card className="p-6 medical-card">
                <h3 className="text-lg font-semibold mb-4">AI Query Trends (Last 30 Days)</h3>
                <div className="h-80">
                  {aiPerformanceData?.trendData && aiPerformanceData.trendData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart
                        data={aiPerformanceData.trendData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="count" 
                          stroke="#8884d8" 
                          activeDot={{ r: 8 }} 
                          name="Queries"
                        />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">No trend data available</p>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  title="Total Queries" 
                  value={aiPerformanceData?.totalQueries || 0} 
                  icon={Brain}
                  description="Processed queries"
                  trend="up"
                />
                <StatCard 
                  title="Avg Processing Time" 
                  value={aiPerformanceData ? `${aiPerformanceData.avgProcessingTime}ms` : "0ms"} 
                  icon={Clock}
                  description="Average response time"
                  trend="down"
                />
                <StatCard 
                  title="Avg Tokens Used" 
                  value={aiPerformanceData?.avgTokensUsed || 0} 
                  icon={BarChartIcon}
                  description="Average tokens per query"
                />
                <StatCard 
                  title="Query Types" 
                  value={queryTypesData.length} 
                  icon={FileText}
                  description="Different query categories"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6 medical-card">
                  <h3 className="text-lg font-semibold mb-4">Query Type Distribution</h3>
                  <div className="h-80">
                    {queryTypesData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={queryTypesData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {queryTypesData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={
                                ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'][index % 5]
                              } />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">No query type data available</p>
                      </div>
                    )}
                  </div>
                </Card>

                <Card className="p-6 medical-card">
                  <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
                  <div className="h-80 flex items-center justify-center bg-muted/20 rounded-lg">
                    <p className="text-muted-foreground">Detailed performance analysis would appear here</p>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="outcomes" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  title="Total Patients" 
                  value={patientOutcomesData?.totalPatients || 0} 
                  icon={Users}
                  description="Registered patients"
                  trend="up"
                />
                <StatCard 
                  title="Avg Patient Age" 
                  value={analyticsData?.patients.averageAge || 0} 
                  icon={Activity}
                  description="Average patient age"
                />
                <StatCard 
                  title="Top Conditions" 
                  value={patientOutcomesData?.topConditions.length || 0} 
                  icon={AlertTriangle}
                  description="Most common conditions"
                />
                <StatCard 
                  title="Top Medications" 
                  value={patientOutcomesData?.topMedications.length || 0} 
                  icon={FileText}
                  description="Most prescribed medications"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6 medical-card">
                  <h3 className="text-lg font-semibold mb-4">Age Distribution</h3>
                  <div className="h-80">
                    {ageGroupsData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart
                          data={ageGroupsData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="value" fill="#8884d8" name="Patients" />
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">No age distribution data available</p>
                      </div>
                    )}
                  </div>
                </Card>

                <Card className="p-6 medical-card">
                  <h3 className="text-lg font-semibold mb-4">Top Conditions</h3>
                  <div className="h-80">
                    {patientOutcomesData && patientOutcomesData.topConditions.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart
                          data={patientOutcomesData.topConditions}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={50} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="value" fill="#82ca9d" name="Patients" />
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">No condition data available</p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="usage" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  title="Total Queries" 
                  value={usageData?.queries.total || 0} 
                  icon={Brain}
                  description="AI queries processed"
                  trend="up"
                />
                <StatCard 
                  title="Peak Usage Hour" 
                  value={usageData ? `${usageData.queries.peakHour}:00` : "00:00"} 
                  icon={Clock}
                  description="Busiest time of day"
                />
                <StatCard 
                  title="Total Payments" 
                  value={usageData?.payments.total || 0} 
                  icon={Database}
                  description="Payment transactions"
                  trend="up"
                />
                <StatCard 
                  title="Avg Payment" 
                  value={usageData ? `$${usageData.payments.averageAmount.toFixed(2)}` : "$0.00"} 
                  icon={FileText}
                  description="Average payment amount"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6 medical-card">
                  <h3 className="text-lg font-semibold mb-4">Hourly Usage Pattern</h3>
                  <div className="h-80">
                    {usageData && usageData.queries.hourlyUsage.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsLineChart
                          data={usageData.queries.hourlyUsage}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="hour" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="queries" 
                            stroke="#8884d8" 
                            activeDot={{ r: 8 }} 
                            name="Queries"
                          />
                        </RechartsLineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">No usage pattern data available</p>
                      </div>
                    )}
                  </div>
                </Card>

                <Card className="p-6 medical-card">
                  <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
                  <div className="h-80">
                    {paymentMethodsData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={paymentMethodsData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {paymentMethodsData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={
                                ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'][index % 5]
                              } />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">No payment method data available</p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Analytics;