import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';

export interface ValidationConfig {
  schema: AnyZodObject;
  location?: 'body' | 'query' | 'params' | 'all';
}

export const validateRequest = (config: ValidationConfig | ValidationConfig[]) => {
  const configs = Array.isArray(config) ? config : [config];

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      for (const { schema, location = 'body' } of configs) {
        if (location === 'all') {
          await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params
          });
        } else {
          await schema.parseAsync(req[location]);
        }
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: validationError.details.map(detail => ({
            path: detail.path.join('.'),
            message: detail.message,
            code: detail.code
          })),
          location: configs.map(c => c.location || 'body')
        });
      }
      next(error);
    }
  };
};

// Helper function to combine multiple validation schemas
export const combineValidations = (...configs: ValidationConfig[]) => validateRequest(configs);