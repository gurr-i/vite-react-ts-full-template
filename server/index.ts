import express, { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import session, { Store } from "express-session";
import connectSqlite3 from "connect-sqlite3";
import "dotenv/config";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import winston from "winston";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure SQLite session store
const SQLiteStore = connectSqlite3(session) as unknown as { new (options?: any): Store };

// Initialize logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
  ],
});
const sessionsDir = path.join(__dirname, "../sessions");
if (!fs.existsSync(sessionsDir)) {
  fs.mkdirSync(sessionsDir, { recursive: true });
}


// Ensure logs directory exists
const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const app = express();

// Apply rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP
  message: "Too many requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);

// Session configuration
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET is not defined.");
}

app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "strict" as const,
      maxAge: 1000 * 60 * 60 * 24,
      path: "/",
      domain: process.env.NODE_ENV === "production" ? process.env.DOMAIN : undefined,
    },
    rolling: true,
    name: "secureSessionId",
    store: new SQLiteStore({
      table: "sessions",
      db: "sessions.db",
      dir: sessionsDir,
      concurrentDB: true, // Boolean, not string
    }),
    unset: "destroy",
    proxy: process.env.NODE_ENV === "production",
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"],
      },
    },
  })
);

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const reqPath = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (reqPath.startsWith("/api")) {
      let logLine = `${req.method} ${reqPath} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      logger.info(logLine);
      log(logLine);
    }
  });

  next();
});

// Graceful shutdown handling
const gracefulShutdown = (signal: string) => {
  logger.info(`${signal} received. Shutting down gracefully.`);
  setTimeout(() => {
    logger.info("Server did not terminate in time. Forcefully shutting down.");
    process.exit(1);
  }, 10000);

  server.close(() => {
    logger.info("HTTP server closed.");
    process.exit(0);
  });
};

// Start the server
let server: http.Server;
(async () => {
  try {
    server = http.createServer(app); // Explicitly create HTTP server
    await registerRoutes(app);

    // Global error handler
    app.use((err: any, req: Request, res: Response, next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = process.env.NODE_ENV === "production" ? "Internal Server Error" : err.message;

      logger.error("Error occurred", {
        status,
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        ip: req.ip,
      });

      res.status(status).json({
        error: message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
      });
    });

    // Setup Vite or serve static files
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    const port = process.env.PORT || 5000;
    server.listen(Number(port), "0.0.0.0", () => {
      logger.info(`Server running on port ${port}`);
      log(`Serving on port ${port}`);
    });

    // Handle shutdown signals
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    logger.error("Failed to start server", { error });
    process.exit(1);
  }
})();

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception", { error });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled rejection", { reason });
});
