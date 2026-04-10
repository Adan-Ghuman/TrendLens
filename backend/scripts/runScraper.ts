import {connectToDatabase, disconnectFromDatabase} from "../src/db/connection";
import {runScrapeJob} from "../src/services/scrape.service";

const run = async (): Promise<void> => {
  await connectToDatabase();
  await runScrapeJob();
  await disconnectFromDatabase();
};

void run();
