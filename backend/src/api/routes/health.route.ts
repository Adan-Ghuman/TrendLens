import {Elysia} from "elysia";
import {getHealthStatus} from "../../services/health.service";

export const healthRoute = new Elysia().get("/health", async () => {
  return getHealthStatus();
});
