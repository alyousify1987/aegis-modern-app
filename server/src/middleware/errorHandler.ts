import { Request, Response, NextFunction } from 'express';
import { Logger } from 'winston';

export const errorHandler = (logger: Logger) => {
  return (err: any, req: Request, res: Response, next: NextFunction): void => {
    // Log the error
    logger.error('Error occurred:', {
      error: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });

    // Handle specific error types
    if (err.name === 'ValidationError') {
      res.status(400).json({
        error: 'Validation failed',
        details: err.details || err.message
      });
      return;
    }

    if (err.name === 'UnauthorizedError') {
      res.status(401).json({
        error: 'Unauthorized',
        message: err.message
      });
      return;
    }

    if (err.name === 'ForbiddenError') {
      res.status(403).json({
        error: 'Forbidden',
        message: err.message
      });
      return;
    }

    if (err.name === 'NotFoundError') {
      res.status(404).json({
        error: 'Not found',
        message: err.message
      });
      return;
    }

    // Prisma errors
    if (err.code === 'P2002') {
      res.status(409).json({
        error: 'Conflict',
        message: 'Record already exists'
      });
      return;
    }

    if (err.code === 'P2025') {
      res.status(404).json({
        error: 'Not found',
        message: 'Record not found'
      });
      return;
    }

    // Multer file upload errors
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({
        error: 'File too large',
        message: 'File size exceeds the maximum allowed limit'
      });
      return;
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
      res.status(413).json({
        error: 'Too many files',
        message: 'Number of files exceeds the maximum allowed limit'
      });
      return;
    }

    // JSON parsing errors
    if (err instanceof SyntaxError && 'body' in err) {
      res.status(400).json({
        error: 'Invalid JSON',
        message: 'Request body contains invalid JSON'
      });
      return;
    }

    // Default error response
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    res.status(err.statusCode || 500).json({
      error: 'Internal server error',
      message: isDevelopment ? err.message : 'Something went wrong',
      ...(isDevelopment && { stack: err.stack })
    });
  };
};

// Custom error classes
export class ValidationError extends Error {
  public details: any;
  
  constructor(message: string, details?: any) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  constructor(message: string = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string = 'Not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error {
  constructor(message: string = 'Conflict') {
    super(message);
    this.name = 'ConflictError';
  }
}
