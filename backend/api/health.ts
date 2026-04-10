import type {IncomingMessage, ServerResponse} from "node:http";
import {getHealthStatus} from "../src/services/health.service";
import {requireMethod, sendJson, withDb} from "./_utils";

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  await withDb(req, res, async (request, response) => {
    if (!requireMethod(request, response, "GET")) {
      return;
    }

    const payload = await getHealthStatus();
    sendJson(response, 200, payload);
  });
}
