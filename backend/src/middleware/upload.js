import multer from 'multer';

/**
 * Configure multer for memory storage
 * Files are stored in memory as Buffer objects
 */
const storage = multer.memoryStorage();

/**
 * File filter to validate file types
 */
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed'), false);
  }
};

/**
 * Multer upload configuration
 */
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: fileFilter,
});

/**
 * Error handler for multer errors
 */
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File size exceeds 5MB limit'
      });
    }
    return res.status(400).json({
      error: err.message
    });
  } else if (err) {
    return res.status(400).json({
      error: err.message
    });
  }
  next();
};
