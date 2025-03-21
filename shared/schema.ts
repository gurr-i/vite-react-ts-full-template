import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  resetToken: text("resetToken"),
  resetTokenExpiry: integer("resetTokenExpiry"),
  rememberMeToken: text("rememberMeToken"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const loginSchema = insertUserSchema.extend({
  rememberMe: z.boolean().default(false),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string(),
});

export const forgotPasswordSchema = z.object({
  username: z.string(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;