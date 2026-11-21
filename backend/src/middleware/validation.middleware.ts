import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { sendError } from '../utils/response.js';

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string[]> = {};
        error.errors.forEach((issue) => {
          const path = issue.path.join('.') || 'body';
          if (!errors[path]) {
            errors[path] = [];
          }
          errors[path].push(issue.message);
        });

        sendError(res, 'Validation failed. Please check the supplied data.', 400, errors);
        return;
      }
      sendError(res, 'Invalid request payload', 400);
      return;
    }
  };
};
