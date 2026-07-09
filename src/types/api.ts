export type ApiSuccess<T = unknown> = {
  success: true;
  message: string;
  data: T;
};

export type ApiError = {
  success: false;
  message: string;
  errors: string[];
};
