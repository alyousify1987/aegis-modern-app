import { Request, Response, NextFunction } from 'express';
import { Logger } from 'winston';

export const requestLogger = (logger: Logger) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Add start time for response time calculation
    (req as any)._startTime = process.hrtime();
    
    // Log request details
    logger.debug('Incoming request', {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      contentType: req.get('Content-Type'),
      contentLength: req.get('Content-Length'),
      timestamp: new Date().toISOString()
    });

    // Add response logging
    const originalSend = res.send;
    res.send = function(data) {
      logger.debug('Outgoing response', {
        statusCode: res.statusCode,
        contentLength: res.get('Content-Length'),
        contentType: res.get('Content-Type'),
        method: req.method,
        url: req.url,
        timestamp: new Date().toISOString()
      });
      
      return originalSend.call(this, data);
    };

    next();
  };
};
