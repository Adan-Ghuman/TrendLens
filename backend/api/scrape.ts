import type {IncomingMessage, ServerResponse} from "node:http";
import {runScrapeJob} from "../src/services/scrape.service";
import {ensureCronAuth, requireMethod, sendJson, withDb} from "./_utils";

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  await withDb(req, res, async (request, response) => {
    if (!requireMethod(request, response, "POST")) {
      return;
    }

    if (!ensureCronAuth(request, response)) {
      return;
    }

    const result = await runScrapeJob();
    sendJson(response, result.status === "success" ? 200 : 500, {
      ok: result.status === "success",
      ...result,
    });
  });
}
