export type LogLevel = "info" | "warn" | "error";

const write = (level: LogLevel, message: string, payload?: unknown): void => {
  const time = new Date().toISOString();
  if (payload === undefined) {
    console.log(`${time} [${level}] ${message}`);
    return;
  }
  console.log(`${time} [${level}] ${message}`, payload);
};

export const logger = {
  info: (message: string, payload?: unknown): void =>
    write("info", message, payload),
  warn: (message: string, payload?: unknown): void =>
    write("warn", message, payload),
  error: (message: string, payload?: unknown): void =>
    write("error", message, payload),
};
