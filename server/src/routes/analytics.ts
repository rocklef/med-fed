import { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { 
  getAllPatients, 
  getQueryHistory, 
  listPayments 
} from '../services/databaseService';
import { getLlamaService } from '../services/llamaService';

const router = Router();

// Get overview analytics data
router.get('/overview', async (_req: Request, res: Response) => {
  try {
    // Get patient data
    const patients = getAllPatients();
    
    // Get query history for AI usage stats
    const queryHistory = getQueryHistory(100);
    
    // Get payment data
    const payments = listPayments(100);
    
    // Calculate analytics metrics
    const totalPatients = patients.length;
    const totalQueries = queryHistory.length;
    const totalPayments = payments.length;
    
    // Calculate recent activity (last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentPatients = patients.filter(p => new Date(p.createdAt) > twentyFourHoursAgo).length;
    const recentQueries = queryHistory.filter(q => new Date(q.createdAt!) > twentyFourHoursAgo).length;
    const recentPayments = payments.filter(p => new Date(p.createdAt!) > twentyFourHoursAgo).length;
    
    // Calculate patient demographics
    const genderDistribution = {
      male: patients.filter(p => p.gender === 'male').length,
      female: patients.filter(p => p.gender === 'female').length,
      other: patients.filter(p => p.gender === 'other').length
    };
    
    // Calculate average patient age
    const currentYear = new Date().getFullYear();
    const ages = patients.map(p => currentYear - p.dob.getFullYear());
    const averageAge = ages.length > 0 ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : 0;
    
    // AI Model performance data (mocked for now)
    const llamaService = getLlamaService();
    const modelStatus = llamaService ? llamaService.getStatus() : null;
    
    const responseData = {
      patients: {
        total: totalPatients,
        recent: recentPatients,
        genderDistribution,
        averageAge
      },
      ai: {
        totalQueries,
        recentQueries,
        modelStatus: modelStatus ? {
          ready: modelStatus.ready,
          queueLength: modelStatus.queueLength,
          processing: modelStatus.processing
        } : null
      },
      payments: {
        total: totalPayments,
        recent: recentPayments,
        totalAmount: payments.reduce((sum, p) => sum + p.amount, 0)
      },
      timestamp: new Date().toISOString()
    };
    
    res.status(StatusCodes.OK).json(responseData);
  } catch (error) {
    console.error('Error fetching overview analytics:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      error: 'Failed to fetch overview analytics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get AI performance data
router.get('/ai-performance', async (_req: Request, res: Response) => {
  try {
    // Get query history for performance analysis
    const queryHistory = getQueryHistory(200);
    
    // Calculate performance metrics
    const totalQueries = queryHistory.length;
    
    // Calculate average processing time
    const queriesWithProcessingTime = queryHistory.filter(q => q.processingTime !== undefined);
    const avgProcessingTime = queriesWithProcessingTime.length > 0 
      ? Math.round(queriesWithProcessingTime.reduce((sum, q) => sum + (q.processingTime || 0), 0) / queriesWithProcessingTime.length)
      : 0;
    
    // Calculate average tokens used
    const queriesWithTokens = queryHistory.filter(q => q.tokensUsed !== undefined);
    const avgTokensUsed = queriesWithTokens.length > 0
      ? Math.round(queriesWithTokens.reduce((sum, q) => sum + (q.tokensUsed || 0), 0) / queriesWithTokens.length)
      : 0;
    
    // Group queries by type
    const queryTypes: Record<string, number> = {};
    queryHistory.forEach(q => {
      const type = q.queryType || 'unknown';
      queryTypes[type] = (queryTypes[type] || 0) + 1;
    });
    
    // Calculate trend data (grouped by day for the last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentQueries = queryHistory.filter(q => 
      q.createdAt && new Date(q.createdAt) > thirtyDaysAgo
    );
    
    // Group by day
    const dailyQueryCounts: Record<string, { date: string; count: number }> = {};
    recentQueries.forEach(q => {
      if (q.createdAt) {
        const dateStr = q.createdAt.toISOString().split('T')[0];
        if (!dailyQueryCounts[dateStr]) {
          dailyQueryCounts[dateStr] = { date: dateStr, count: 0 };
        }
        dailyQueryCounts[dateStr].count++;
      }
    });
    
    // Convert to array and sort by date
    const trendData = Object.values(dailyQueryCounts)
      .sort((a, b) => a.date.localeCompare(b.date));
    
    const responseData = {
      totalQueries,
      avgProcessingTime,
      avgTokensUsed,
      queryTypes,
      trendData,
      timestamp: new Date().toISOString()
    };
    
    res.status(StatusCodes.OK).json(responseData);
  } catch (error) {
    console.error('Error fetching AI performance analytics:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      error: 'Failed to fetch AI performance analytics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get patient outcomes data
router.get('/patient-outcomes', async (_req: Request, res: Response) => {
  try {
    // Get patient data
    const patients = getAllPatients();
    
    // Calculate patient outcomes metrics
    const totalPatients = patients.length;
    
    // Calculate age distribution
    const currentYear = new Date().getFullYear();
    const ageGroups = {
      '0-18': 0,
      '19-35': 0,
      '36-50': 0,
      '51-65': 0,
      '65+': 0
    };
    
    patients.forEach(p => {
      const age = currentYear - p.dob.getFullYear();
      if (age <= 18) ageGroups['0-18']++;
      else if (age <= 35) ageGroups['19-35']++;
      else if (age <= 50) ageGroups['36-50']++;
      else if (age <= 65) ageGroups['51-65']++;
      else ageGroups['65+']++;
    });
    
    // Calculate condition distribution (top 10 conditions)
    const conditionCounts: Record<string, number> = {};
    patients.forEach(p => {
      if (p.conditions) {
        p.conditions.forEach(condition => {
          conditionCounts[condition] = (conditionCounts[condition] || 0) + 1;
        });
      }
    });
    
    // Sort conditions by count and take top 10
    const topConditions = Object.entries(conditionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([condition, count]) => ({ name: condition, value: count }));
    
    // Calculate medication distribution (top 10 medications)
    const medicationCounts: Record<string, number> = {};
    patients.forEach(p => {
      if (p.medications) {
        p.medications.forEach(medication => {
          medicationCounts[medication] = (medicationCounts[medication] || 0) + 1;
        });
      }
    });
    
    // Sort medications by count and take top 10
    const topMedications = Object.entries(medicationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([medication, count]) => ({ name: medication, value: count }));
    
    const responseData = {
      totalPatients,
      ageGroups,
      topConditions,
      topMedications,
      genderDistribution: {
        male: patients.filter(p => p.gender === 'male').length,
        female: patients.filter(p => p.gender === 'female').length,
        other: patients.filter(p => p.gender === 'other').length
      },
      timestamp: new Date().toISOString()
    };
    
    res.status(StatusCodes.OK).json(responseData);
  } catch (error) {
    console.error('Error fetching patient outcomes analytics:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      error: 'Failed to fetch patient outcomes analytics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get usage statistics
router.get('/usage', async (_req: Request, res: Response) => {
  try {
    // Get query history for usage analysis
    const queryHistory = getQueryHistory(500);
    
    // Get payments for financial usage
    const payments = listPayments(100);
    
    // Calculate usage metrics
    const totalQueries = queryHistory.length;
    
    // Calculate queries by hour of day (for peak usage times)
    const hourlyUsage: Record<number, number> = {};
    for (let i = 0; i < 24; i++) {
      hourlyUsage[i] = 0;
    }
    
    queryHistory.forEach(q => {
      if (q.createdAt) {
        const hour = q.createdAt.getHours();
        hourlyUsage[hour]++;
      }
    });
    
    // Convert to array format for charting
    const hourlyUsageData = Object.entries(hourlyUsage)
      .map(([hour, count]) => ({ hour: parseInt(hour), queries: count }))
      .sort((a, b) => a.hour - b.hour);
    
    // Find peak hour
    const peakHour = Object.entries(hourlyUsage)
      .reduce((a, b) => (hourlyUsage[parseInt(a[0])] > hourlyUsage[parseInt(b[0])] ? a : b))[0];
    
    // Calculate data growth over time (patients added per week)
    const patients = getAllPatients();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentPatients = patients.filter(p => new Date(p.createdAt) > thirtyDaysAgo);
    
    // Group patients by day
    const dailyPatientCounts: Record<string, { date: string; count: number }> = {};
    recentPatients.forEach(p => {
      const dateStr = p.createdAt.toISOString().split('T')[0];
      if (!dailyPatientCounts[dateStr]) {
        dailyPatientCounts[dateStr] = { date: dateStr, count: 0 };
      }
      dailyPatientCounts[dateStr].count++;
    });
    
    // Convert to array and sort by date
    const patientGrowthData = Object.values(dailyPatientCounts)
      .sort((a, b) => a.date.localeCompare(b.date));
    
    // Calculate payment statistics
    const totalPayments = payments.length;
    const totalPaymentAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const avgPaymentAmount = totalPayments > 0 ? totalPaymentAmount / totalPayments : 0;
    
    // Group payments by method
    const paymentMethods: Record<string, number> = {};
    payments.forEach(p => {
      paymentMethods[p.method] = (paymentMethods[p.method] || 0) + 1;
    });
    
    const responseData = {
      queries: {
        total: totalQueries,
        hourlyUsage: hourlyUsageData,
        peakHour: parseInt(peakHour),
        growthData: patientGrowthData
      },
      payments: {
        total: totalPayments,
        totalAmount: totalPaymentAmount,
        averageAmount: Math.round(avgPaymentAmount * 100) / 100,
        methods: paymentMethods
      },
      timestamp: new Date().toISOString()
    };
    
    res.status(StatusCodes.OK).json(responseData);
  } catch (error) {
    console.error('Error fetching usage analytics:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      error: 'Failed to fetch usage analytics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;