import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import cron from "node-cron";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";
import { runScraper } from "./services/scraper.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

if (process.env["NODE_ENV"] === "production") {
  const staticPath = path.resolve(__dirname, "../../problem-atlas/dist/public");
  app.use(express.static(staticPath));
  app.get("/{*splat}", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });
}

cron.schedule("0 */6 * * *", () => {
  logger.info("Cron: triggering scraper");
  runScraper().catch((err) => logger.error({ err }, "Cron scraper failed"));
});

setTimeout(() => {
  logger.info("Startup: running initial scraper pass");
  runScraper().catch((err) => logger.error({ err }, "Startup scraper failed"));
}, 15_000);

export default app;
