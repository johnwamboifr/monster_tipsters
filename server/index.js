import cookieParser from "cookie-parser";
import express from "express";
import dotenv from "dotenv";
import path from "node:path";
import cors from "cors";
import { fileURLToPath } from "node:url";

import db from "./models/index.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import tipsRoutes from "./routes/tipsRoutes.js";
import jackpotRoutes from "./routes/jackpotRoutes.js";
import codeRoutes from "./routes/codeRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";
import statisticsRoutes from "./routes/statisticsRoutes.js";
import footballRoutes from "./routes/footballRoutes.js";
import adminFootballRoutes from "./routes/adminFootballRoutes.js";

import { startScheduledSync } from "./utils/sync/scheduler.js";

import { arcjetMiddleware } from "./middlewares/arcjet.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const port = Number(
  process.env.PORT || 3001
);

/*
 * ============================================================
 * MIDDLEWARE
 * ============================================================
 */

app.use(
  express.json({
    limit: "1mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(cookieParser());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://monster-tipsters-xyra.onrender.com",
    ],
    methods: [
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "PATCH",
      "OPTIONS",
    ],
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-auth-token",
    ],
  })
);

app.use(arcjetMiddleware);

/*
 * ============================================================
 * API ROUTES
 * ============================================================
 */

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/users",
  userRoutes
);

app.use(
  "/api/tips",
  tipsRoutes
);

app.use(
  "/api/jackpots",
  jackpotRoutes
);

app.use(
  "/api/codes",
  codeRoutes
);

app.use(
  "/api/payment",
  paymentRoutes
);

app.use(
  "/api/images",
  imageRoutes
);

app.use(
  "/api/statistics",
  statisticsRoutes
);

app.use(
  "/api/football",
  footballRoutes
);

app.use("/api/admin/football", adminFootballRoutes);

/*
 * ============================================================
 * PRODUCTION FRONTEND
 * ============================================================
 */

if (
  process.env.NODE_ENV === "production"
) {
  const clientDistPath = path.join(
    __dirname,
    "../client/dist"
  );

  app.use(
    express.static(clientDistPath)
  );

  app.get("*", (_req, res) => {
    res.sendFile(
      path.join(
        clientDistPath,
        "index.html"
      )
    );
  });
}

/*
 * ============================================================
 * START SERVER
 * ============================================================
 */

const startServer = async () => {
  try {
    /*
     * --------------------------------------------------------
     * 1. Test database connection
     * --------------------------------------------------------
     */

    await db.sequelize.authenticate();

    console.log(
      "Database connection established successfully"
    );

    /*
     * --------------------------------------------------------
     * 2. Start HTTP server FIRST
     * --------------------------------------------------------
     *
     * This is important for Render.
     *
     * We do NOT wait for football synchronization
     * before starting the web server.
     */

    app.listen(
      port,
      "0.0.0.0",
      () => {
        console.log(
          `Server running on port ${port}`
        );

        /*
         * ----------------------------------------------------
         * 3. Start football scheduler in background
         * ----------------------------------------------------
         *
         * startScheduledSync() does NOT block startup.
         *
         * It:
         *   - starts cron jobs immediately
         *   - starts initial football sync in background
         */

        try {
          const jobs =
            startScheduledSync();

          console.log(
            `[Football Scheduler] Started with ${jobs.length} scheduled jobs`
          );
        } catch (error) {
          console.error(
            "[Football Scheduler] Failed to start:",
            error?.message
          );
        }
      }
    );
  } catch (error) {
    console.error(
      "Unable to start server:",
      error?.message
    );

    process.exit(1);
  }
};

startServer();
