import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import cron from "node-cron";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";
import { runScraper } from "./services/scraper.js";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

cron.schedule("0 */6 * * *", () => {
  logger.info("Cron: triggering scraper");
  runScraper().catch((err) => logger.error({ err }, "Cron scraper failed"));
});

setTimeout(() => {
  logger.info("Startup: running initial scraper pass");
  runScraper().catch((err) => logger.error({ err }, "Startup scraper failed"));
}, 15_000);

export default app;
