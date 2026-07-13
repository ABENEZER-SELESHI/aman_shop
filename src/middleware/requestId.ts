import type { NextFunction, Request, Response } from "express";
import { randomUUID } from "node:crypto";

const REQUEST_ID_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/;

export const requestId = (req: Request, res: Response, next: NextFunction): void => {
  const incoming = req.header("x-request-id")?.trim();
  const id = incoming && REQUEST_ID_PATTERN.test(incoming) ? incoming : randomUUID();
  req.requestId = id;
  res.setHeader("x-request-id", id);
  next();
};
