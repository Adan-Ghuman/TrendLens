import type {IncomingMessage, ServerResponse} from "node:http";
import {getMetaResponse} from "../src/services/meta.service";
import {requireMethod, sendJson, withDb} from "./_utils";

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
