import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure neon serverless with websockets
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create a pool connection
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Create a Drizzle ORM instance
export const db = drizzle({ client: pool, schema });

// Helper function to run a query and log the result for testing purposes
export async function testDatabaseConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('Database connection successful:', result.rows[0]);
    return result;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}