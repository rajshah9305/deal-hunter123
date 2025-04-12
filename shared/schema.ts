import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  email: text("email"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  email: true,
  avatarUrl: true,
});

// Deal table
export const deals = pgTable("deals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  source: text("source"),
  postedTime: text("posted_time"),
  imageUrl: text("image_url"),
  originalPrice: doublePrecision("original_price"),
  currentPrice: doublePrecision("current_price"),
  estimatedProfit: doublePrecision("estimated_profit"),
  condition: text("condition"),
  sellTimeEstimate: text("sell_time_estimate"),
  demand: text("demand"),
  matchScore: integer("match_score"),
  isHotDeal: boolean("is_hot_deal").default(false),
  status: text("status").default("active"),
  avgResellLow: doublePrecision("avg_resell_low"),
  avgResellHigh: doublePrecision("avg_resell_high"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertDealSchema = createInsertSchema(deals).pick({
  userId: true,
  title: true,
  description: true,
  source: true,
  postedTime: true,
  imageUrl: true,
  originalPrice: true,
  currentPrice: true,
  estimatedProfit: true,
  condition: true,
  sellTimeEstimate: true,
  demand: true,
  matchScore: true,
  isHotDeal: true,
  status: true,
  avgResellLow: true,
  avgResellHigh: true,
});

// Inventory table
export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  category: text("category").notNull(),
  count: integer("count").notNull().default(0),
  value: doublePrecision("value").notNull().default(0),
  marketValue: doublePrecision("market_value"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertInventorySchema = createInsertSchema(inventory).pick({
  userId: true,
  category: true,
  count: true,
  value: true,
  marketValue: true,
});

// Stats table
export const stats = pgTable("stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  value: doublePrecision("value").notNull(),
  change: doublePrecision("change"),
  changeType: text("change_type"),
  icon: text("icon"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertStatSchema = createInsertSchema(stats).pick({
  userId: true,
  name: true,
  value: true,
  change: true,
  changeType: true,
  icon: true,
});

// Market insights table
export const marketInsights = pgTable("market_insights", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  changePercentage: doublePrecision("change_percentage"),
  iconType: text("icon_type").notNull(),
  colorType: text("color_type").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMarketInsightSchema = createInsertSchema(marketInsights).pick({
  title: true,
  description: true,
  changePercentage: true,
  iconType: true,
  colorType: true,
});

// Price history table
export const priceHistory = pgTable("price_history", {
  id: serial("id").primaryKey(),
  productId: text("product_id").notNull(),
  date: timestamp("date").notNull(),
  price: doublePrecision("price").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPriceHistorySchema = createInsertSchema(priceHistory).pick({
  productId: true,
  date: true,
  price: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Deal = typeof deals.$inferSelect;
export type InsertDeal = z.infer<typeof insertDealSchema>;

export type Inventory = typeof inventory.$inferSelect;
export type InsertInventory = z.infer<typeof insertInventorySchema>;

export type Stat = typeof stats.$inferSelect;
export type InsertStat = z.infer<typeof insertStatSchema>;

export type MarketInsight = typeof marketInsights.$inferSelect;
export type InsertMarketInsight = z.infer<typeof insertMarketInsightSchema>;

export type PriceHistory = typeof priceHistory.$inferSelect;
export type InsertPriceHistory = z.infer<typeof insertPriceHistorySchema>;
