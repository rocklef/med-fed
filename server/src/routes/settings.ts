import { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

const router = Router();

// In-memory storage for settings (in a real app, this would be in a database)
let appSettings = {
  // AI Model Settings
  aiModel: {
    modelPath: 'llama3:latest',
    temperature: 0.7,
    maxTokens: 2048,
    contextLength: 4096,
    topP: 0.9
  },
  
  // Privacy Settings
  privacy: {
    encryptData: true,
    anonymizePatients: true,
    auditLogs: true,
    dataRetention: '2 years'
  },
  
  // Notification Settings
  notifications: {
    emailNotifications: true,
    inAppAlerts: true,
    aiCompletion: true,
    systemUpdates: false,
    paymentConfirmations: true
  },
  
  // Appearance Settings
  appearance: {
    theme: 'dark',
    fontSize: 'medium',
    language: 'en'
  }
};

// Get all settings
router.get('/', async (_req: Request, res: Response) => {
  try {
    res.status(StatusCodes.OK).json(appSettings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      error: 'Failed to fetch settings',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update settings
router.put('/', async (req: Request, res: Response) => {
  try {
    const newSettings = req.body;
    
    // Merge new settings with existing settings
    appSettings = {
      ...appSettings,
      ...newSettings,
      aiModel: {
        ...appSettings.aiModel,
        ...newSettings.aiModel
      },
      privacy: {
        ...appSettings.privacy,
        ...newSettings.privacy
      },
      notifications: {
        ...appSettings.notifications,
        ...newSettings.notifications
      },
      appearance: {
        ...appSettings.appearance,
        ...newSettings.appearance
      }
    };
    
    res.status(StatusCodes.OK).json({
      message: 'Settings updated successfully',
      settings: appSettings
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      error: 'Failed to update settings',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get specific settings category
router.get('/:category', async (req: Request, res: Response) => {
  try {
    const category = req.params.category;
    
    if (!(category in appSettings)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ 
        error: 'Invalid settings category' 
      });
    }
    
    res.status(StatusCodes.OK).json({
      category,
      settings: (appSettings as any)[category]
    });
  } catch (error) {
    console.error('Error fetching settings category:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      error: 'Failed to fetch settings category',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update specific settings category
router.put('/:category', async (req: Request, res: Response) => {
  try {
    const category = req.params.category;
    const categorySettings = req.body;
    
    if (!(category in appSettings)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ 
        error: 'Invalid settings category' 
      });
    }
    
    // Update the specific category
    (appSettings as any)[category] = {
      ...(appSettings as any)[category],
      ...categorySettings
    };
    
    res.status(StatusCodes.OK).json({
      message: `Settings category '${category}' updated successfully`,
      category,
      settings: (appSettings as any)[category]
    });
  } catch (error) {
    console.error('Error updating settings category:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      error: 'Failed to update settings category',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;