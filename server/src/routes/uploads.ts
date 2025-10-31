import { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage based on upload type from URL
const getStorage = (uploadType: string) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      // Organize uploads by type (images, documents, lab-data)
      const typeDir = path.join(uploadsDir, uploadType);
      
      if (!fs.existsSync(typeDir)) {
        fs.mkdirSync(typeDir, { recursive: true });
      }
      
      cb(null, typeDir);
    },
    filename: (req, file, cb) => {
      // Generate unique filename with timestamp
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
  });
};

// File filter for allowed file types
const getFileFilter = (fileType: string) => {
  return (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Allowed extensions based on file type
    const allowedExtensions: Record<string, string[]> = {
      'images': ['.jpg', '.jpeg', '.png', '.dcm', '.nii', '.nii.gz'], // Medical images including DICOM
      'documents': ['.pdf', '.txt', '.doc', '.docx'],
      'lab-data': ['.csv', '.xlsx', '.json', '.xml'],
      'general': ['.jpg', '.jpeg', '.png', '.pdf', '.txt', '.csv', '.json']
    };
    
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = allowedExtensions[fileType] || allowedExtensions['general'];
    
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${ext} is not allowed for ${fileType} uploads. Allowed: ${allowed.join(', ')}`));
    }
  };
};

// Configure multer for each upload type
const getUpload = (uploadType: string) => {
  return multer({
    storage: getStorage(uploadType),
    fileFilter: getFileFilter(uploadType),
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB max file size
      files: 10 // Max 10 files per upload
    }
  });
};

// Image upload endpoint
router.post('/images', getUpload('images').array('images', 10), async (req: Request, res: Response) => {
  try {
    if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: 'No files uploaded',
        message: 'Please select at least one image file to upload'
      });
    }

    const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
    
    const uploadedFiles = files.map((file) => ({
      originalName: file.originalname,
      filename: file.filename,
      path: file.path.replace(uploadsDir, '').replace(/\\/g, '/'), // Use forward slashes for web paths
      size: file.size,
      mimetype: file.mimetype
    }));

    res.status(StatusCodes.OK).json({
      success: true,
      message: `${files.length} image(s) uploaded successfully`,
      files: uploadedFiles,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to upload images',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Document upload endpoint
router.post('/documents', getUpload('documents').array('documents', 10), async (req: Request, res: Response) => {
  try {
    if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: 'No files uploaded',
        message: 'Please select at least one document file to upload'
      });
    }

    const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
    
    const uploadedFiles = files.map((file) => ({
      originalName: file.originalname,
      filename: file.filename,
      path: file.path.replace(uploadsDir, '').replace(/\\/g, '/'),
      size: file.size,
      mimetype: file.mimetype
    }));

    res.status(StatusCodes.OK).json({
      success: true,
      message: `${files.length} document(s) uploaded successfully`,
      files: uploadedFiles,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error uploading documents:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to upload documents',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Lab data upload endpoint
router.post('/lab-data', getUpload('lab-data').array('labData', 10), async (req: Request, res: Response) => {
  try {
    if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: 'No files uploaded',
        message: 'Please select at least one lab data file to upload'
      });
    }

    const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
    
    const uploadedFiles = files.map((file) => ({
      originalName: file.originalname,
      filename: file.filename,
      path: file.path.replace(uploadsDir, '').replace(/\\/g, '/'),
      size: file.size,
      mimetype: file.mimetype
    }));

    res.status(StatusCodes.OK).json({
      success: true,
      message: `${files.length} lab data file(s) uploaded successfully`,
      files: uploadedFiles,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error uploading lab data:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to upload lab data',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;

