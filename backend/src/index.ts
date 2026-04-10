import {connectToDatabase} from "./db/connection";
import {buildServer} from "./api/server";
import {env} from "./config/env";
import {startScheduler} from "./scheduler/cron";
import {logger} from "./utils/logger";

const bootstrap = async (): Promise<void> => {
  await connectToDatabase();
  const app = buildServer();
  startScheduler();
  logger.info("Backend booted", {
    nodeEnv: env.nodeEnv,
    schedulerMode: env.scrapeSchedulerMode,
  });
  app.listen(env.port);
};

void bootstrap();
