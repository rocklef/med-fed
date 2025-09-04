import { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { hospital1Pool, hospital2Pool, hospital3Pool, aggregatorPool } from '../config/database';

const router = Router();

// Get federated network status
router.get('/status', async (req: Request, res: Response) => {
  try {
    const hospitals = [
      { id: 1, name: 'Memorial Hospital', pool: hospital1Pool },
      { id: 2, name: 'City Medical Center', pool: hospital2Pool },
      { id: 3, name: 'Regional Clinic', pool: hospital3Pool }
    ];

    const networkStatus = await Promise.all(
      hospitals.map(async (hospital) => {
        try {
          // Test connection and get basic stats
          const connectionTest = await hospital.pool.query('SELECT NOW() as current_time');
          const patientCount = await hospital.pool.query('SELECT COUNT(*) as count FROM patients');
          const recordCount = await hospital.pool.query('SELECT COUNT(*) as count FROM medical_records');

          return {
            id: hospital.id,
            name: hospital.name,
            status: 'active',
            lastUpdate: new Date().toISOString(),
            patientCount: parseInt(patientCount.rows[0]?.count || '0'),
            recordCount: parseInt(recordCount.rows[0]?.count || '0'),
            progress: Math.min(95, 60 + Math.random() * 35), // Simulated progress
            uptime: '99.9%'
          };
        } catch (error) {
          return {
            id: hospital.id,
            name: hospital.name,
            status: 'offline',
            lastUpdate: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
            patientCount: 0,
            recordCount: 0,
            progress: 0,
            uptime: '0%'
          };
        }
      })
    );

    // Calculate aggregate stats
    const totalPatients = networkStatus.reduce((sum, node) => sum + node.patientCount, 0);
    const totalRecords = networkStatus.reduce((sum, node) => sum + node.recordCount, 0);
    const activeNodes = networkStatus.filter(node => node.status === 'active').length;
    const avgProgress = networkStatus.reduce((sum, node) => sum + node.progress, 0) / networkStatus.length;

    res.json({
      network: {
        totalNodes: hospitals.length,
        activeNodes,
        totalPatients,
        totalRecords,
        avgAccuracy: Math.round(avgProgress * 100) / 100,
        lastSync: new Date().toISOString()
      },
      nodes: networkStatus
    });

  } catch (error) {
    console.error('Error getting federated status:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      error: 'Failed to get network status' 
    });
  }
});

// Get cross-hospital analytics
router.get('/analytics', async (req: Request, res: Response) => {
  try {
    const hospitals = [
      { id: 1, name: 'Memorial Hospital', pool: hospital1Pool },
      { id: 2, name: 'City Medical Center', pool: hospital2Pool },
      { id: 3, name: 'Regional Clinic', pool: hospital3Pool }
    ];

    const analytics = await Promise.all(
      hospitals.map(async (hospital) => {
        try {
          // Get common conditions
          const conditions = await hospital.pool.query(`
            SELECT diagnosis, COUNT(*) as count
            FROM medical_records 
            WHERE diagnosis IS NOT NULL AND diagnosis != ''
            GROUP BY diagnosis
            ORDER BY count DESC
            LIMIT 5
          `);

          // Get age distribution
          const ageDistribution = await hospital.pool.query(`
            SELECT 
              CASE 
                WHEN EXTRACT(YEAR FROM AGE(date_of_birth)) < 18 THEN 'Under 18'
                WHEN EXTRACT(YEAR FROM AGE(date_of_birth)) BETWEEN 18 AND 35 THEN '18-35'
                WHEN EXTRACT(YEAR FROM AGE(date_of_birth)) BETWEEN 36 AND 65 THEN '36-65'
                ELSE 'Over 65'
              END as age_group,
              COUNT(*) as count
            FROM patients
            WHERE date_of_birth IS NOT NULL
            GROUP BY age_group
          `);

          return {
            hospitalId: hospital.id,
            hospitalName: hospital.name,
            topConditions: conditions.rows,
            ageDistribution: ageDistribution.rows,
            lastUpdated: new Date().toISOString()
          };
        } catch (error) {
          return {
            hospitalId: hospital.id,
            hospitalName: hospital.name,
            topConditions: [],
            ageDistribution: [],
            lastUpdated: new Date().toISOString(),
            error: 'Database unavailable'
          };
        }
      })
    );

    res.json({
      analytics,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      error: 'Failed to get analytics data' 
    });
  }
});

// Simulate federated learning training
router.post('/train', async (req: Request, res: Response) => {
  try {
    const { modelType = 'classification', epochs = 10 } = req.body;

    // Simulate training process
    const trainingJob = {
      id: `training_${Date.now()}`,
      modelType,
      epochs,
      status: 'started',
      startTime: new Date().toISOString(),
      estimatedDuration: epochs * 30, // 30 seconds per epoch
      participants: [1, 2, 3], // All hospitals
      currentEpoch: 0
    };

    res.status(StatusCodes.ACCEPTED).json({
      message: 'Federated training started',
      job: trainingJob
    });

  } catch (error) {
    console.error('Error starting training:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      error: 'Failed to start federated training' 
    });
  }
});

// Get training job status
router.get('/training/:jobId', async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;

    // Simulate job progress
    const progress = Math.min(100, Math.random() * 100);
    const isComplete = progress > 95;

    const job = {
      id: jobId,
      status: isComplete ? 'completed' : 'training',
      progress: Math.round(progress),
      currentEpoch: Math.floor(progress / 10),
      accuracy: isComplete ? 94.2 + Math.random() * 2 : null,
      loss: isComplete ? 0.1 + Math.random() * 0.05 : null,
      participants: [
        { hospitalId: 1, status: 'active', contribution: 33.3 },
        { hospitalId: 2, status: 'active', contribution: 33.3 },
        { hospitalId: 3, status: 'active', contribution: 33.4 }
      ]
    };

    res.json({ job });

  } catch (error) {
    console.error('Error getting training status:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      error: 'Failed to get training status' 
    });
  }
});

export default router;
