import {Elysia} from "elysia";
import {getTrendingResponse} from "../../services/snapshot.service";
import {clampLimit} from "../../utils/validators";

export const trendingRoute = new Elysia({prefix: "/api"}).get(
  "/trending",
  async ({query}) => {
    const queryPage =
      typeof query.page === "string" ? Number(query.page) : undefined;
    const queryLimit =
      typeof query.limit === "string" ? Number(query.limit) : undefined;

    const page = clampLimit(queryPage, 1, Number.MAX_SAFE_INTEGER, 1);
    const limit = clampLimit(queryLimit, 1, 30, 10);

    return getTrendingResponse(page, limit);
  },
);
