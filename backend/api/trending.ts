import type {IncomingMessage, ServerResponse} from "node:http";
import {getTrendingResponse} from "../src/services/snapshot.service.js";
import {clampLimit} from "../src/utils/validators.js";
import {readQueryNumber, requireMethod, sendJson, withDb} from "./_utils.js";

export default async function handler(
  req: IncomingMessage & {
    query?: Record<string, string | string[] | undefined>;
  },
  res: ServerResponse,
): Promise<void> {
  await withDb(req, res, async (request, response) => {
    if (!requireMethod(request, response, "GET")) {
      return;
    }

    const page = clampLimit(
      readQueryNumber(request.query?.page),
      1,
      Number.MAX_SAFE_INTEGER,
      1,
    );

    const limit = clampLimit(readQueryNumber(request.query?.limit), 1, 30, 10);

    const payload = await getTrendingResponse(page, limit);
    sendJson(response, 200, payload);
  });
}
