type LogLevel = "info" | "warn" | "error" | "debug";

type LogMeta = Record<string, unknown> & { requestId?: string };

const write = (level: LogLevel, message: string, meta: LogMeta = {}) => {
  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  };

  const line = JSON.stringify(payload);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
};

export const logger = {
  info: (message: string, meta?: LogMeta) => write("info", message, meta),
  warn: (message: string, meta?: LogMeta) => write("warn", message, meta),
  error: (message: string, meta?: LogMeta) => write("error", message, meta),
  debug: (message: string, meta?: LogMeta) => {
    if (process.env.NODE_ENV !== "production") write("debug", message, meta);
  },
};
