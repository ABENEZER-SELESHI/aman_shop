import type { Response } from "express";
import type { ApiError, ApiSuccess } from "../types/api.js";

export const sendSuccess = <T>(
  res: Response,
  message: string,
  data: T,
  statusCode = 200,
): Response<ApiSuccess<T>> => res.status(statusCode).json({ success: true, message, data });

export const sendError = (
  res: Response,
  message: string,
  errors: string[] = [],
  statusCode = 500,
): Response<ApiError> => res.status(statusCode).json({ success: false, message, errors });
