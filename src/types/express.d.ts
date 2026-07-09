declare global {
  namespace Express {
    interface Request {
      requestId: string;
      seller?: {
        id: string;
        email: string;
        name: string;
      };
    }
  }
}

export {};
