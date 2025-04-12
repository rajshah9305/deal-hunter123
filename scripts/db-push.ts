import { db, pool } from "../server/db";
import * as schema from "../shared/schema";
import { drizzle } from "drizzle-orm/neon-serverless";
import { migrate } from "drizzle-orm/neon-serverless/migrator";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// Enable WebSocket for Neon database
neonConfig.webSocketConstructor = ws;

async function main() {
  try {
    console.log("Pushing schema to database...");
    
    // Create a sample user for testing if none exists
    console.log("Checking for existing users...");
    const existingUsers = await db.select().from(schema.users);
    
    if (existingUsers.length === 0) {
      console.log("No users found. Creating sample user...");
      // Create a sample user (alex/password123)
      await db.insert(schema.users).values({
        username: 'alex',
        password: '5b722b307fce6c944905d132691d5e4a2214b7fe92b738920eb3fce3a90420a19511c3010a0e7712b054daef5b57bad59ecbd93b3280f210578f547f4aed4d25.d8b2c09a5d37d9ca4cdc7f3452f55211',
        fullName: 'Alex Smith',
        email: 'alex@example.com',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=48&h=48&q=80',
        createdAt: new Date()
      });
      console.log("Sample user created.");
    }
    
    console.log("Schema push completed successfully.");
  } catch (error) {
    console.error("Error pushing schema to database:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();