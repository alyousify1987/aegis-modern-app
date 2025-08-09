import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ValidationError } from './errorHandler';

export const validateRequest = (schema: {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: any = {};

    // Validate request body
    if (schema.body) {
      const { error } = schema.body.validate(req.body);
      if (error) {
        errors.body = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }));
      }
    }

    // Validate query parameters
    if (schema.query) {
      const { error } = schema.query.validate(req.query);
      if (error) {
        errors.query = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }));
      }
    }

    // Validate route parameters
    if (schema.params) {
      const { error } = schema.params.validate(req.params);
      if (error) {
        errors.params = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }));
      }
    }

    // If there are validation errors, throw ValidationError
    if (Object.keys(errors).length > 0) {
      throw new ValidationError('Validation failed', errors);
    }

    next();
  };
};

// Common validation schemas
export const commonSchemas = {
  id: Joi.string().uuid().required(),
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
  }),
  search: Joi.object({
    q: Joi.string().min(1).max(100).optional(),
    filter: Joi.string().optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional()
  })
};

// User validation schemas
export const userSchemas = {
  create: Joi.object({
    email: Joi.string().email().required(),
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(8).required(),
    firstName: Joi.string().min(1).max(50).required(),
    lastName: Joi.string().min(1).max(50).required(),
    role: Joi.string().valid('SUPER_ADMIN', 'ADMIN', 'AUDITOR', 'MANAGER', 'USER', 'VIEWER').default('USER'),
    department: Joi.string().optional(),
    position: Joi.string().optional(),
    phone: Joi.string().optional()
  }),
  
  update: Joi.object({
    email: Joi.string().email().optional(),
    username: Joi.string().alphanum().min(3).max(30).optional(),
    firstName: Joi.string().min(1).max(50).optional(),
    lastName: Joi.string().min(1).max(50).optional(),
    role: Joi.string().valid('SUPER_ADMIN', 'ADMIN', 'AUDITOR', 'MANAGER', 'USER', 'VIEWER').optional(),
    department: Joi.string().optional(),
    position: Joi.string().optional(),
    phone: Joi.string().optional(),
    isActive: Joi.boolean().optional()
  })
};

// Audit validation schemas
export const auditSchemas = {
  create: Joi.object({
    title: Joi.string().min(1).max(200).required(),
    description: Joi.string().max(1000).optional(),
    type: Joi.string().valid('INTERNAL', 'EXTERNAL', 'SURVEILLANCE', 'CERTIFICATION', 'COMPLIANCE', 'MANAGEMENT_REVIEW', 'SUPPLIER', 'CUSTOMER').required(),
    priority: Joi.string().valid('CRITICAL', 'HIGH', 'MEDIUM', 'LOW').default('MEDIUM'),
    standard: Joi.string().required(),
    scope: Joi.string().required(),
    objectives: Joi.array().items(Joi.string()).required(),
    criteria: Joi.array().items(Joi.string()).required(),
    methodology: Joi.string().optional(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
    estimatedHours: Joi.number().positive().optional(),
    budget: Joi.number().positive().optional(),
    departmentId: Joi.string().uuid().optional(),
    leadAuditorId: Joi.string().uuid().optional(),
    auditorIds: Joi.array().items(Joi.string().uuid()).optional()
  }),
  
  update: Joi.object({
    title: Joi.string().min(1).max(200).optional(),
    description: Joi.string().max(1000).optional(),
    type: Joi.string().valid('INTERNAL', 'EXTERNAL', 'SURVEILLANCE', 'CERTIFICATION', 'COMPLIANCE', 'MANAGEMENT_REVIEW', 'SUPPLIER', 'CUSTOMER').optional(),
    status: Joi.string().valid('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ON_HOLD', 'DRAFT').optional(),
    priority: Joi.string().valid('CRITICAL', 'HIGH', 'MEDIUM', 'LOW').optional(),
    standard: Joi.string().optional(),
    scope: Joi.string().optional(),
    objectives: Joi.array().items(Joi.string()).optional(),
    criteria: Joi.array().items(Joi.string()).optional(),
    methodology: Joi.string().optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    estimatedHours: Joi.number().positive().optional(),
    actualHours: Joi.number().positive().optional(),
    budget: Joi.number().positive().optional(),
    score: Joi.number().min(0).max(100).optional(),
    recommendations: Joi.array().items(Joi.string()).optional(),
    followUpDate: Joi.date().iso().optional()
  })
};

// Finding validation schemas
export const findingSchemas = {
  create: Joi.object({
    auditId: Joi.string().uuid().required(),
    title: Joi.string().min(1).max(200).required(),
    description: Joi.string().required(),
    type: Joi.string().valid('NON_CONFORMITY', 'OBSERVATION', 'IMPROVEMENT_OPPORTUNITY', 'POSITIVE_FINDING', 'RECOMMENDATION').required(),
    severity: Joi.string().valid('CRITICAL', 'MAJOR', 'MINOR').required(),
    category: Joi.string().optional(),
    clause: Joi.string().optional(),
    location: Joi.string().optional(),
    evidence: Joi.string().optional(),
    rootCause: Joi.string().optional(),
    impact: Joi.string().optional(),
    likelihood: Joi.string().optional(),
    dueDate: Joi.date().iso().optional()
  }),
  
  update: Joi.object({
    title: Joi.string().min(1).max(200).optional(),
    description: Joi.string().optional(),
    type: Joi.string().valid('NON_CONFORMITY', 'OBSERVATION', 'IMPROVEMENT_OPPORTUNITY', 'POSITIVE_FINDING', 'RECOMMENDATION').optional(),
    severity: Joi.string().valid('CRITICAL', 'MAJOR', 'MINOR').optional(),
    category: Joi.string().optional(),
    clause: Joi.string().optional(),
    location: Joi.string().optional(),
    evidence: Joi.string().optional(),
    rootCause: Joi.string().optional(),
    impact: Joi.string().optional(),
    likelihood: Joi.string().optional(),
    status: Joi.string().valid('OPEN', 'IN_PROGRESS', 'RESOLVED', 'VERIFIED', 'CLOSED').optional(),
    dueDate: Joi.date().iso().optional()
  })
};

// Risk validation schemas
export const riskSchemas = {
  create: Joi.object({
    title: Joi.string().min(1).max(200).required(),
    description: Joi.string().required(),
    category: Joi.string().required(),
    type: Joi.string().valid('OPERATIONAL', 'STRATEGIC', 'FINANCIAL', 'COMPLIANCE', 'REPUTATIONAL', 'TECHNOLOGICAL', 'ENVIRONMENTAL', 'SAFETY').required(),
    probability: Joi.number().integer().min(1).max(5).required(),
    impact: Joi.number().integer().min(1).max(5).required(),
    tolerance: Joi.string().optional(),
    owner: Joi.string().required(),
    departmentId: Joi.string().uuid().optional(),
    reviewDate: Joi.date().iso().optional()
  }),
  
  update: Joi.object({
    title: Joi.string().min(1).max(200).optional(),
    description: Joi.string().optional(),
    category: Joi.string().optional(),
    type: Joi.string().valid('OPERATIONAL', 'STRATEGIC', 'FINANCIAL', 'COMPLIANCE', 'REPUTATIONAL', 'TECHNOLOGICAL', 'ENVIRONMENTAL', 'SAFETY').optional(),
    probability: Joi.number().integer().min(1).max(5).optional(),
    impact: Joi.number().integer().min(1).max(5).optional(),
    tolerance: Joi.string().optional(),
    owner: Joi.string().optional(),
    status: Joi.string().valid('IDENTIFIED', 'ASSESSED', 'MITIGATED', 'MONITORED', 'CLOSED').optional(),
    reviewDate: Joi.date().iso().optional()
  })
};

// Action validation schemas
export const actionSchemas = {
  create: Joi.object({
    title: Joi.string().min(1).max(200).required(),
    description: Joi.string().required(),
    type: Joi.string().valid('CORRECTIVE', 'PREVENTIVE', 'IMPROVEMENT', 'MAINTENANCE', 'INVESTIGATION').required(),
    priority: Joi.string().valid('CRITICAL', 'HIGH', 'MEDIUM', 'LOW').default('MEDIUM'),
    assigneeId: Joi.string().uuid().required(),
    auditId: Joi.string().uuid().optional(),
    findingId: Joi.string().uuid().optional(),
    riskId: Joi.string().uuid().optional(),
    dueDate: Joi.date().iso().required(),
    estimatedEffort: Joi.string().optional(),
    cost: Joi.number().positive().optional()
  }),
  
  update: Joi.object({
    title: Joi.string().min(1).max(200).optional(),
    description: Joi.string().optional(),
    type: Joi.string().valid('CORRECTIVE', 'PREVENTIVE', 'IMPROVEMENT', 'MAINTENANCE', 'INVESTIGATION').optional(),
    priority: Joi.string().valid('CRITICAL', 'HIGH', 'MEDIUM', 'LOW').optional(),
    status: Joi.string().valid('OPEN', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED', 'CLOSED', 'OVERDUE').optional(),
    assigneeId: Joi.string().uuid().optional(),
    dueDate: Joi.date().iso().optional(),
    completedDate: Joi.date().iso().optional(),
    estimatedEffort: Joi.string().optional(),
    actualEffort: Joi.string().optional(),
    cost: Joi.number().positive().optional(),
    verification: Joi.string().optional()
  })
};
