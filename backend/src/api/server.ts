import {Elysia} from "elysia";
import {cors} from "@elysiajs/cors";
import {env} from "../config/env";
import {healthRoute} from "./routes/health.route";
import {trendingRoute} from "./routes/trending.route";

export const buildServer = () => {
  return new Elysia()
    .use(cors())
    .use(healthRoute)
    .use(trendingRoute)
    .onStart(() => {
      return {port: env.port};
    });
};
