import {Elysia} from "elysia";
import {getHealthStatus} from "../../services/health.service";

export const healthRoute = new Elysia({prefix: "/api"}).get(
  "/health",
  async () => {
    return getHealthStatus();
  },
);
