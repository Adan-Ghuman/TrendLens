import {logger} from "../utils/logger";

export interface FetchPageResult {
  html: string;
  httpStatus: number;
  durationMs: number;
}

const RETRY_ATTEMPTS = 2;

const waitFor = async (ms: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, ms));
};

const retryJitterMs = (): number => {
  return Math.floor(200 + Math.random() * 400);
};

export const fetchSourceHtml = async (
  sourceUrl: string,
  timeoutMs: number,
  userAgent: string,
): Promise<FetchPageResult> => {
  const startedAt = Date.now();
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(sourceUrl, {
        signal: controller.signal,
        headers: {
          "user-agent": userAgent,
        },
      });

      if (!response.ok) {
        throw new Error(`Source responded with status ${response.status}`);
      }

      const html = await response.text();
      const durationMs = Date.now() - startedAt;
      logger.info("Fetched source HTML", {
        sourceUrl,
        httpStatus: response.status,
        durationMs,
      });
      return {
        html,
        httpStatus: response.status,
        durationMs,
      };
    } catch (error) {
      lastError = error;
      if (attempt < RETRY_ATTEMPTS) {
        await waitFor(retryJitterMs());
      }
      logger.warn("Fetch attempt failed", {
        sourceUrl,
        attempt,
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Failed to fetch source HTML");
};
