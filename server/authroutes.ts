import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      secure: process.env.NODE_ENV === "production",
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const user = await storage.getUserByUsername(username);
      if (!user || !(await comparePasswords(password, user.password))) {
        return done(null, false);
      } else {
        return done(null, user);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });

  app.post("/api/register", async (req, res, next) => {
    const existingUser = await storage.getUserByUsername(req.body.username);
    if (existingUser) {
      return res.status(400).send("Username already exists");
    }

    // Validate password using the validatePassword function
    const passwordValidation = validatePassword(req.body.password);
    if (!passwordValidation.valid) {
      return res.status(400).send(passwordValidation.message);
    }

    const user = await storage.createUser({
      ...req.body,
      password: await hashPassword(req.body.password),
    });

    req.login(user, (err) => {
      if (err) return next(err);
      res.status(201).json(user);
    });
  });

  app.post("/api/login", passport.authenticate("local"), async (req, res) => {
    const { rememberMe } = req.body;
    if (rememberMe) {
      const rememberMeToken = randomBytes(32).toString("hex");
      await storage.updateUser(req.user!.id, { rememberMeToken });
      req.user!.rememberMeToken = rememberMeToken;
    }
    res.status(200).json(req.user);
  });

  app.post("/api/forgot-password", async (req, res) => {
    const { username } = req.body;
    const user = await storage.getUserByUsername(username);
    if (!user) {
      return res.status(404).send("User not found");
    }

    const resetToken = randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    await storage.updateUser(user.id, {
      resetToken,
      resetTokenExpiry,
    });

    // In a real application, send an email with the reset link
    // For demo purposes, we'll just return the token
    res.json({ message: "Password reset token generated", resetToken });
  });

  app.post("/api/reset-password", async (req, res) => {
    const { token, password } = req.body;
    const user = await storage.getUserByResetToken(token);

    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < Date.now()) {
      return res.status(400).send("Invalid or expired reset token");
    }

    await storage.updateUser(user.id, {
      password: await hashPassword(password),
      resetToken: null,
      resetTokenExpiry: null,
    });

    res.json({ message: "Password reset successful" });
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}


export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (!password || password.length === 0) {
    return { valid: false, message: "Password cannot be empty" };
  }
  
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters long" };
  }
  
  // Add more validation rules as needed
  // Example: require at least one uppercase letter, one lowercase letter, one number, and one special character
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
    return { 
      valid: false, 
      message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character" 
    };
  }
  
  return { valid: true };
};