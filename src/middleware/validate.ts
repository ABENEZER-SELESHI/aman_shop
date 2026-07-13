import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { z } from "zod";
import { ValidationError } from "../utils/errors.js";

const toErrors = (error: z.ZodError): string[] => {
  const tree = z.treeifyError(error);
  return tree.errors.length > 0 ? tree.errors : [error.message];
};

export const validateBody = <T>(schema: ZodType<T>) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(new ValidationError("Invalid request body", toErrors(result.error)));
      return;
    }
    req.body = result.data;
    next();
  };
};

export const validateQuery = <T>(schema: ZodType<T>) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      next(new ValidationError("Invalid query parameters", toErrors(result.error)));
      return;
    }
    // Express 5 exposes req.query as a getter-only property — mutate in place.
    const query = req.query as Record<string, unknown>;
    for (const key of Object.keys(query)) {
      delete query[key];
    }
    Object.assign(query, result.data as object);
    next();
  };
};

export const validateParams = <T>(schema: ZodType<T>) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      next(new ValidationError("Invalid route parameters", toErrors(result.error)));
      return;
    }
    const params = req.params as Record<string, unknown>;
    for (const key of Object.keys(params)) {
      delete params[key];
    }
    Object.assign(params, result.data as object);
    next();
  };
};
