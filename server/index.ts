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
import { errorHandler } from "./middleware/errorHandler";
import cors from "cors";
import compression from "compression";
import { isValidOrigin } from "./utils/security";

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure SQLite session store
const SQLiteStore = connectSqlite3(session) as any;

// Initialize logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

// Ensure directories exist
const sessionsDir = path.join(__dirname, "../sessions");
const logsDir = path.join(__dirname, "../logs");
[sessionsDir, logsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const app = express();

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || isValidOrigin(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Length", "X-Request-Id"],
  maxAge: 86400,
}));

// Compression middleware
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req: Request, res: Response) => {
    if (req.headers["x-no-compression"]) return false;
    return compression.filter(req, res);
  },
}));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Request body parsers
const jsonParser = express.json({ limit: "1mb" });
const largeJsonParser = express.json({ limit: "5mb" });
const urlEncodedParser = express.urlencoded({ extended: false, limit: "1mb" });

app.use("/api/upload", largeJsonParser);
app.use("/api", jsonParser, urlEncodedParser);

// Rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { status: "error", message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { status: "error", message: "Too many login attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

app.use("/api", globalLimiter);
app.use("/api/auth", authLimiter);

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
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 4,
      path: "/",
      domain: process.env.NODE_ENV === "production" ? process.env.DOMAIN : undefined,
    },
    rolling: true,
    name: "_sid",
    store: new SQLiteStore({
      table: "sessions",
      db: "sessions.db",
      dir: sessionsDir,
      concurrentDB: true,
    }),
  })
);

// Clear expired sessions
setInterval(() => {
  const store = app.get("sessionStore") as Store;
  store.all?.((err: Error | null, sessions?: { [sid: string]: any } | any[] | null) => {
    if (err) {
      logger.error("Error cleaning expired sessions:", err);
      return;
    }
    if (!sessions) return;

    // Handle different possible session formats
    const sessionEntries = Array.isArray(sessions)
      ? sessions.map((session, index) => [index.toString(), session])
      : Object.entries(sessions);

    sessionEntries.forEach(([sid, session]) => {
      if (session?.cookie?.expires && new Date(session.cookie.expires) < new Date()) {
        store.destroy(sid, (err: Error | null) => {
          if (err) logger.error("Error destroying expired session:", err);
        });
      }
    });
  });
}, 1000 * 60 * 60);

// Security headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), interest-cohort=()");
  next();
});

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

// Middleware
app.use(errorHandler);

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  const originalJson = res.json;
  let responseBody: any;

  res.json = function (body) {
    responseBody = body;
    return originalJson.call(this, body);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      let logLine = `${req.method} ${req.path} ${res.statusCode} in ${duration}ms`;
      if (responseBody) {
        logLine += ` :: ${JSON.stringify(responseBody)}`;
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

// Server setup
let server: http.Server;
(async () => {
  try {
    server = http.createServer(app);
    await registerRoutes(app);

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
  } catch (error) {
    logger.error("Failed to start server", { error });
    process.exit(1);
  }
})();

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  logger.info(`${signal} received. Shutting down gracefully.`);
  const timeout = setTimeout(() => {
    logger.info("Server did not terminate in time. Forcefully shutting down.");
    process.exit(1);
  }, 10000);

  server.close(() => {
    clearTimeout(timeout);
    logger.info("HTTP server closed.");
    process.exit(0);
  });
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception", { error });
  process.exit(1);
});
process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled rejection", { reason });
});