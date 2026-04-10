import type {IncomingMessage, ServerResponse} from "node:http";
import {getMetaResponse} from "../src/services/meta.service.js";
import {requireMethod, sendJson, withDb} from "./_utils.js";

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  await withDb(req, res, async (request, response) => {
    if (!requireMethod(request, response, "GET")) {
      return;
    }

    const payload = await getMetaResponse();
    sendJson(response, 200, payload);
  });
}
