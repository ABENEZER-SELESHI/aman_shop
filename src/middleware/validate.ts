import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { z } from "zod";
import { ValidationError } from "../utils/errors.js";

export const validateBody = <T>(schema: ZodType<T>) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = z.treeifyError(result.error).errors;
      next(new ValidationError("Invalid request body", errors.length > 0 ? errors : [result.error.message]));
      return;
    }
    req.body = result.data;
    next();
  };
};
