import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';
import { AppError } from '../utils/errors.js';

type Source = 'body' | 'query' | 'params';

/**
 * Validates `req[source]` against a Zod schema and replaces it with the
 * parsed (and coerced/defaulted) value. The frontend also validates with
 * Zod, but that is only a UX convenience — this is the authoritative check.
 */
export function validate(schema: ZodType, source: Source = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));
      next(AppError.validation('Invalid request.', details));
      return;
    }
    req[source] = result.data;
    next();
  };
}
