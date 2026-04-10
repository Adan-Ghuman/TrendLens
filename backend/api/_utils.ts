import type {IncomingMessage, ServerResponse} from "node:http";
import {env} from "../src/config/env.js";
import {connectToDatabase} from "../src/db/connection.js";
import {logger} from "../src/utils/logger.js";

type ApiHandler = (
  req: IncomingMessage & {
    query?: Record<string, string | string[] | undefined>;
  },
  res: ServerResponse,
) => Promise<void>;

export const sendJson = (
  res: ServerResponse,
  statusCode: number,
  payload: unknown,
): void => {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
};

export const requireMethod = (
  req: IncomingMessage,
  res: ServerResponse,
  method: string,
): boolean => {
  if ((req.method ?? "").toUpperCase() !== method.toUpperCase()) {
    res.setHeader("Allow", method.toUpperCase());
    sendJson(res, 405, {
      error: "Method Not Allowed",
      expected: method.toUpperCase(),
    });
    return false;
  }

  return true;
};

export const readQueryNumber = (
  value: string | string[] | undefined,
): number | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const extractSecret = (req: IncomingMessage): string => {
  const authHeader = req.headers.authorization;
  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }

  const cronHeader = req.headers["x-cron-secret"];
  if (typeof cronHeader === "string") {
    return cronHeader;
  }

  return "";
};

export const ensureCronAuth = (
  req: IncomingMessage,
  res: ServerResponse,
): boolean => {
  if (!env.scrapeTriggerSecret) {
    sendJson(res, 500, {
      error: "SCRAPE_TRIGGER_SECRET is not configured",
    });
    return false;
  }

  const providedSecret = extractSecret(req);
  if (!providedSecret || providedSecret !== env.scrapeTriggerSecret) {
    sendJson(res, 401, {error: "Unauthorized"});
    return false;
  }

  return true;
};

export const withDb = async (
  req: IncomingMessage,
  res: ServerResponse,
  handler: ApiHandler,
): Promise<void> => {
  try {
    await connectToDatabase();
    await handler(
      req as IncomingMessage & {
        query?: Record<string, string | string[] | undefined>;
      },
      res,
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    logger.error("Serverless handler failed", {
      method: req.method,
      url: req.url,
      errorMessage,
    });

    sendJson(res, 500, {error: "Internal Server Error"});
  }
};
