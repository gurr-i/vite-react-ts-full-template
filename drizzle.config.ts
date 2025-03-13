import { defineConfig } from "drizzle-kit";
import * as fs from 'fs';
import * as path from 'path';

// Add validation for SQLite file path
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

if (!process.env.DATABASE_URL.startsWith('file:')) {
  throw new Error("DATABASE_URL must start with 'file:' for SQLite");
}

if (!process.env.DATABASE_URL.endsWith('.db')) {
  throw new Error("DATABASE_URL must end with '.db' for SQLite");
}

// Extract the file path from the DATABASE_URL
const dbPath = process.env.DATABASE_URL.replace('file:', '');
const dbDir = path.dirname(dbPath);

// Create the directory if it doesn't exist
if (!fs.existsSync(dbDir)) {
  try {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log(`Created database directory: ${dbDir}`);
  } catch (error) {
    console.error(`Failed to create database directory: ${error}`);
    throw new Error(`Failed to create database directory: ${error}`);
  }
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
