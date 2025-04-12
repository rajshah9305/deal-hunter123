import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDealSchema, insertInventorySchema, insertMarketInsightSchema, insertStatSchema, insertUserSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { analyzeDeal, generateMarketInsights, predictPriceTrend, generateListing } from "./services/openai";

export async function registerRoutes(app: Express): Promise<Server> {
  const apiRouter = express.Router();

  // Get authenticated user
  apiRouter.get("/auth/user", async (req: Request, res: Response) => {
    try {
      // For demo, just return the first user
      const user = await storage.getUser(1);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Don't return password in response
      const { password, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get deals
  apiRouter.get("/deals", async (req: Request, res: Response) => {
    try {
      const deals = await storage.getDeals();
      return res.json(deals);
    } catch (error) {
      console.error("Error fetching deals:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get deals for a user
  apiRouter.get("/deals/user/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const deals = await storage.getDealsByUserId(userId);
      return res.json(deals);
    } catch (error) {
      console.error("Error fetching user deals:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create a new deal
  apiRouter.post("/deals", async (req: Request, res: Response) => {
    try {
      const validatedDeal = insertDealSchema.parse(req.body);
      const newDeal = await storage.createDeal(validatedDeal);
      return res.status(201).json(newDeal);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating deal:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get a specific deal
  apiRouter.get("/deals/:id", async (req: Request, res: Response) => {
    try {
      const dealId = parseInt(req.params.id);
      if (isNaN(dealId)) {
        return res.status(400).json({ message: "Invalid deal ID" });
      }

      const deal = await storage.getDeal(dealId);
      if (!deal) {
        return res.status(404).json({ message: "Deal not found" });
      }

      return res.json(deal);
    } catch (error) {
      console.error("Error fetching deal:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update a deal
  apiRouter.patch("/deals/:id", async (req: Request, res: Response) => {
    try {
      const dealId = parseInt(req.params.id);
      if (isNaN(dealId)) {
        return res.status(400).json({ message: "Invalid deal ID" });
      }

      const existingDeal = await storage.getDeal(dealId);
      if (!existingDeal) {
        return res.status(404).json({ message: "Deal not found" });
      }

      // Get fields to update and validate
      const dealUpdate = req.body;
      const updatedDeal = await storage.updateDeal(dealId, dealUpdate);
      
      return res.json(updatedDeal);
    } catch (error) {
      console.error("Error updating deal:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete a deal
  apiRouter.delete("/deals/:id", async (req: Request, res: Response) => {
    try {
      const dealId = parseInt(req.params.id);
      if (isNaN(dealId)) {
        return res.status(400).json({ message: "Invalid deal ID" });
      }

      const success = await storage.deleteDeal(dealId);
      if (!success) {
        return res.status(404).json({ message: "Deal not found" });
      }

      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting deal:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get inventory items for a user
  apiRouter.get("/inventory/user/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const inventory = await storage.getInventoryByUserId(userId);
      return res.json(inventory);
    } catch (error) {
      console.error("Error fetching user inventory:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get user stats
  apiRouter.get("/stats/user/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const stats = await storage.getStatsByUserId(userId);
      return res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get market insights
  apiRouter.get("/market-insights", async (req: Request, res: Response) => {
    try {
      const insights = await storage.getMarketInsights();
      return res.json(insights);
    } catch (error) {
      console.error("Error fetching market insights:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get price history for a product
  apiRouter.get("/price-history/:productId", async (req: Request, res: Response) => {
    try {
      const productId = req.params.productId;
      const priceHistory = await storage.getPriceHistoryByProductId(productId);
      return res.json(priceHistory);
    } catch (error) {
      console.error("Error fetching price history:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // AI-powered Deal Analysis
  apiRouter.post("/ai/analyze-deal", async (req: Request, res: Response) => {
    try {
      const { title, description, originalPrice, currentPrice, condition, source } = req.body;
      
      if (!title || !currentPrice) {
        return res.status(400).json({ message: "Title and current price are required" });
      }

      const analysis = await analyzeDeal({
        title,
        description,
        originalPrice,
        currentPrice,
        condition,
        source
      });

      return res.json(analysis);
    } catch (error) {
      console.error("Error analyzing deal with AI:", error);
      return res.status(500).json({ 
        message: "Error analyzing deal with AI", 
        details: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // AI-powered Market Insights
  apiRouter.post("/ai/market-insights", async (req: Request, res: Response) => {
    try {
      const { categories } = req.body;
      const insights = await generateMarketInsights(categories || []);
      return res.json(insights);
    } catch (error) {
      console.error("Error generating market insights with AI:", error);
      return res.status(500).json({ 
        message: "Error generating market insights with AI", 
        details: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // AI-powered Price Trend Prediction
  apiRouter.post("/ai/price-prediction", async (req: Request, res: Response) => {
    try {
      const { title, category, currentPrice, historicalPrices } = req.body;
      
      if (!title || !currentPrice) {
        return res.status(400).json({ message: "Title and current price are required" });
      }

      const prediction = await predictPriceTrend({
        title,
        category,
        currentPrice,
        historicalPrices
      });

      return res.json(prediction);
    } catch (error) {
      console.error("Error predicting price trends with AI:", error);
      return res.status(500).json({ 
        message: "Error predicting price trends with AI", 
        details: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // AI-powered Listing Generator
  apiRouter.post("/ai/generate-listing", async (req: Request, res: Response) => {
    try {
      const { item, platform, template } = req.body;
      
      if (!item || !item.title || !platform) {
        return res.status(400).json({ message: "Item title and platform are required" });
      }

      const listing = await generateListing(item, platform, template);

      return res.json(listing);
    } catch (error) {
      console.error("Error generating listing with AI:", error);
      return res.status(500).json({ 
        message: "Error generating listing with AI", 
        details: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Mount the API router
  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}
