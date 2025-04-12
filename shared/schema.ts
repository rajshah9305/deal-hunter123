import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, json, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  email: text("email"),
  avatarUrl: text("avatar_url"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  isPremium: boolean("is_premium").default(false),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  deals: many(deals),
  inventoryItems: many(inventoryItems),
  notifications: many(notifications),
  competitorPrices: many(competitorPrices),
  dealAlerts: many(dealAlerts),
  salesRecords: many(salesRecords),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  email: true,
  avatarUrl: true,
  isPremium: true,
});

// Deal table
export const deals = pgTable("deals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  source: text("source"),
  sourceUrl: text("source_url"),
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
  status: text("status").default("active"), // "tracked", "purchased", "sold", "ignored"
  avgResellLow: doublePrecision("avg_resell_low"),
  avgResellHigh: doublePrecision("avg_resell_high"),
  tags: text("tags").array(),
  category: text("category"),
  aiAnalysis: json("ai_analysis"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dealsRelations = relations(deals, ({ one, many }) => ({
  user: one(users, {
    fields: [deals.userId],
    references: [users.id],
  }),
  competitorPrices: many(competitorPrices),
  priceHistories: many(priceHistory),
}));

export const insertDealSchema = createInsertSchema(deals).pick({
  userId: true,
  title: true,
  description: true,
  source: true,
  sourceUrl: true,
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
  tags: true,
  category: true,
  aiAnalysis: true,
});

// Inventory Management - New detailed inventory items
export const inventoryItems = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  dealId: integer("deal_id").references(() => deals.id),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  purchasePrice: doublePrecision("purchase_price").notNull(),
  purchaseDate: timestamp("purchase_date").notNull(),
  estimatedValue: doublePrecision("estimated_value"),
  condition: text("condition"),
  status: text("status").notNull(), // "in_inventory", "listed", "sold", "returned"
  location: text("location"),
  imageUrl: text("image_url"),
  tags: text("tags").array(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const inventoryItemsRelations = relations(inventoryItems, ({ one, many }) => ({
  user: one(users, {
    fields: [inventoryItems.userId],
    references: [users.id],
  }),
  deal: one(deals, {
    fields: [inventoryItems.dealId],
    references: [deals.id],
  }),
  salesRecords: many(salesRecords),
}));

export const insertInventoryItemSchema = createInsertSchema(inventoryItems).pick({
  userId: true,
  dealId: true,
  title: true,
  description: true,
  category: true,
  purchasePrice: true,
  purchaseDate: true,
  estimatedValue: true,
  condition: true,
  status: true,
  location: true,
  imageUrl: true,
  tags: true,
  notes: true,
});

// Legacy inventory table - keep for backward compatibility
export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
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

// Sales Dashboard - Track sales records
export const salesRecords = pgTable("sales_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  inventoryItemId: integer("inventory_item_id").references(() => inventoryItems.id),
  salePrice: doublePrecision("sale_price").notNull(),
  saleDate: timestamp("sale_date").notNull(),
  platformSold: text("platform_sold"),
  fees: doublePrecision("fees"),
  shippingCost: doublePrecision("shipping_cost"),
  profit: doublePrecision("profit").notNull(),
  buyerInfo: json("buyer_info"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const salesRecordsRelations = relations(salesRecords, ({ one }) => ({
  user: one(users, {
    fields: [salesRecords.userId],
    references: [users.id],
  }),
  inventoryItem: one(inventoryItems, {
    fields: [salesRecords.inventoryItemId],
    references: [inventoryItems.id],
  }),
}));

export const insertSalesRecordSchema = createInsertSchema(salesRecords).pick({
  userId: true,
  inventoryItemId: true,
  salePrice: true,
  saleDate: true,
  platformSold: true,
  fees: true,
  shippingCost: true,
  profit: true,
  buyerInfo: true,
  notes: true,
});

// Deal Notification System - Notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // "deal_alert", "price_drop", "inventory", "sales"
  read: boolean("read").default(false),
  data: json("data"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  title: true,
  message: true,
  type: true,
  read: true,
  data: true,
});

// Deal Alert System - Create custom alert rules
export const dealAlerts = pgTable("deal_alerts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  keywords: text("keywords").array(),
  category: text("category"),
  minPrice: doublePrecision("min_price"),
  maxPrice: doublePrecision("max_price"),
  condition: text("condition"),
  sources: text("sources").array(), // ["facebook", "ebay", "offerup"]
  enabled: boolean("enabled").default(true),
  instantNotification: boolean("instant_notification").default(false),
  emailNotification: boolean("email_notification").default(false),
  lastRunAt: timestamp("last_run_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dealAlertsRelations = relations(dealAlerts, ({ one }) => ({
  user: one(users, {
    fields: [dealAlerts.userId],
    references: [users.id],
  }),
}));

export const insertDealAlertSchema = createInsertSchema(dealAlerts).pick({
  userId: true,
  name: true,
  keywords: true,
  category: true,
  minPrice: true,
  maxPrice: true,
  condition: true,
  sources: true,
  enabled: true,
  instantNotification: true,
  emailNotification: true,
});

// Competitor Price Tracker - Track competitor prices
export const competitorPrices = pgTable("competitor_prices", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  dealId: integer("deal_id").references(() => deals.id),
  platform: text("platform").notNull(), // "ebay", "amazon", "walmart"
  title: text("title").notNull(),
  url: text("url"),
  price: doublePrecision("price").notNull(),
  condition: text("condition"),
  shipping: doublePrecision("shipping"),
  rating: doublePrecision("rating"),
  sellerName: text("seller_name"),
  availability: text("availability"),
  lastChecked: timestamp("last_checked").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const competitorPricesRelations = relations(competitorPrices, ({ one }) => ({
  user: one(users, {
    fields: [competitorPrices.userId],
    references: [users.id],
  }),
  deal: one(deals, {
    fields: [competitorPrices.dealId],
    references: [deals.id],
  }),
}));

export const insertCompetitorPriceSchema = createInsertSchema(competitorPrices).pick({
  userId: true,
  dealId: true,
  platform: true,
  title: true,
  url: true,
  price: true,
  condition: true,
  shipping: true,
  rating: true,
  sellerName: true,
  availability: true,
  lastChecked: true,
});

// Listing Generator - Templates for product listings
export const listingTemplates = pgTable("listing_templates", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  category: text("category"),
  template: text("template").notNull(),
  defaultPlatform: text("default_platform"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertListingTemplateSchema = createInsertSchema(listingTemplates).pick({
  userId: true,
  name: true,
  category: true,
  template: true,
  defaultPlatform: true,
});

// Generated Listings - AI-generated listings for various platforms
export const generatedListings = pgTable("generated_listings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  inventoryItemId: integer("inventory_item_id").references(() => inventoryItems.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  platform: text("platform").notNull(),
  suggestedPrice: doublePrecision("suggested_price"),
  images: text("images").array(),
  tags: text("tags").array(),
  published: boolean("published").default(false),
  publishedUrl: text("published_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertGeneratedListingSchema = createInsertSchema(generatedListings).pick({
  userId: true,
  inventoryItemId: true,
  title: true,
  description: true,
  platform: true,
  suggestedPrice: true,
  images: true,
  tags: true,
  published: true,
  publishedUrl: true,
});

// Deal Sourcing Scanner - Settings for web scraping
export const sourcingSettings = pgTable("sourcing_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  platform: text("platform").notNull(), // "facebook", "ebay", "offerup"
  enabled: boolean("enabled").default(true),
  searchTerms: text("search_terms").array(),
  zipCode: text("zip_code"),
  distance: integer("distance"),
  minPrice: doublePrecision("min_price"),
  maxPrice: doublePrecision("max_price"),
  categories: text("categories").array(),
  excludeTerms: text("exclude_terms").array(),
  scanFrequency: integer("scan_frequency"), // minutes
  lastScanAt: timestamp("last_scan_at"),
  credentials: json("credentials"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSourcingSettingSchema = createInsertSchema(sourcingSettings).pick({
  userId: true,
  platform: true,
  enabled: true,
  searchTerms: true,
  zipCode: true,
  distance: true,
  minPrice: true,
  maxPrice: true,
  categories: true,
  excludeTerms: true,
  scanFrequency: true,
  credentials: true,
});

// Stats table
export const stats = pgTable("stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  value: doublePrecision("value").notNull(),
  change: doublePrecision("change"),
  changeType: text("change_type"),
  icon: text("icon"),
  period: text("period"), // "daily", "weekly", "monthly", "yearly"
  date: date("date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertStatSchema = createInsertSchema(stats).pick({
  userId: true,
  name: true,
  value: true,
  change: true,
  changeType: true,
  icon: true,
  period: true,
  date: true,
});

// Market insights table
export const marketInsights = pgTable("market_insights", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category"),
  changePercentage: doublePrecision("change_percentage"),
  iconType: text("icon_type").notNull(),
  colorType: text("color_type").notNull(),
  source: text("source"),
  period: text("period"), // "daily", "weekly", "monthly"
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMarketInsightSchema = createInsertSchema(marketInsights).pick({
  title: true,
  description: true,
  category: true,
  changePercentage: true,
  iconType: true,
  colorType: true,
  source: true,
  period: true,
});

// Price history table
export const priceHistory = pgTable("price_history", {
  id: serial("id").primaryKey(),
  dealId: integer("deal_id").references(() => deals.id),
  productId: text("product_id"),
  date: timestamp("date").notNull(),
  price: doublePrecision("price").notNull(),
  source: text("source"),
  condition: text("condition"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const priceHistoryRelations = relations(priceHistory, ({ one }) => ({
  deal: one(deals, {
    fields: [priceHistory.dealId],
    references: [deals.id],
  }),
}));

export const insertPriceHistorySchema = createInsertSchema(priceHistory).pick({
  dealId: true,
  productId: true,
  date: true,
  price: true,
  source: true,
  condition: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Deal = typeof deals.$inferSelect;
export type InsertDeal = z.infer<typeof insertDealSchema>;

export type Inventory = typeof inventory.$inferSelect;
export type InsertInventory = z.infer<typeof insertInventorySchema>;

export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;

export type SalesRecord = typeof salesRecords.$inferSelect;
export type InsertSalesRecord = z.infer<typeof insertSalesRecordSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type DealAlert = typeof dealAlerts.$inferSelect;
export type InsertDealAlert = z.infer<typeof insertDealAlertSchema>;

export type CompetitorPrice = typeof competitorPrices.$inferSelect;
export type InsertCompetitorPrice = z.infer<typeof insertCompetitorPriceSchema>;

export type ListingTemplate = typeof listingTemplates.$inferSelect;
export type InsertListingTemplate = z.infer<typeof insertListingTemplateSchema>;

export type GeneratedListing = typeof generatedListings.$inferSelect;
export type InsertGeneratedListing = z.infer<typeof insertGeneratedListingSchema>;

export type SourcingSetting = typeof sourcingSettings.$inferSelect;
export type InsertSourcingSetting = z.infer<typeof insertSourcingSettingSchema>;

export type Stat = typeof stats.$inferSelect;
export type InsertStat = z.infer<typeof insertStatSchema>;

export type MarketInsight = typeof marketInsights.$inferSelect;
export type InsertMarketInsight = z.infer<typeof insertMarketInsightSchema>;

export type PriceHistory = typeof priceHistory.$inferSelect;
export type InsertPriceHistory = z.infer<typeof insertPriceHistorySchema>;