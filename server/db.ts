// Import necessary modules
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import * as schema from "@shared/schema";
import 'dotenv/config'; // Add this line to load environment variables

// Ensure database directory exists before creating the database connection
const dbPath = process.env.DATABASE_URL?.replace('file:', '') || '';
const dbDir = path.dirname(dbPath);

// Create the directory if it doesn't exist
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log(`Created database directory: ${dbDir}`);
}

// Initialize the database connection
const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });
