import { 
  users, type User, type InsertUser,
  deals, type Deal, type InsertDeal,
  inventory, type Inventory, type InsertInventory,
  stats, type Stat, type InsertStat,
  marketInsights, type MarketInsight, type InsertMarketInsight,
  priceHistory, type PriceHistory, type InsertPriceHistory
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Deal operations
  getDeals(): Promise<Deal[]>;
  getDealsByUserId(userId: number): Promise<Deal[]>;
  getDeal(id: number): Promise<Deal | undefined>;
  createDeal(deal: InsertDeal): Promise<Deal>;
  updateDeal(id: number, deal: Partial<InsertDeal>): Promise<Deal | undefined>;
  deleteDeal(id: number): Promise<boolean>;

  // Inventory operations
  getInventoryByUserId(userId: number): Promise<Inventory[]>;
  getInventoryTotalValueByUserId(userId: number): Promise<number>;
  createInventory(inventory: InsertInventory): Promise<Inventory>;
  updateInventory(id: number, inventory: Partial<InsertInventory>): Promise<Inventory | undefined>;

  // Stats operations
  getStatsByUserId(userId: number): Promise<Stat[]>;
  createStat(stat: InsertStat): Promise<Stat>;
  updateStat(id: number, stat: Partial<InsertStat>): Promise<Stat | undefined>;

  // Market insights operations
  getMarketInsights(): Promise<MarketInsight[]>;
  createMarketInsight(insight: InsertMarketInsight): Promise<MarketInsight>;

  // Price history operations
  getPriceHistoryByProductId(productId: string): Promise<PriceHistory[]>;
  createPriceHistory(priceHistory: InsertPriceHistory): Promise<PriceHistory>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private deals: Map<number, Deal>;
  private inventories: Map<number, Inventory>;
  private statsData: Map<number, Stat>;
  private marketInsightsData: Map<number, MarketInsight>;
  private priceHistoryData: Map<number, PriceHistory>;
  
  private currentUserId: number;
  private currentDealId: number;
  private currentInventoryId: number;
  private currentStatId: number;
  private currentMarketInsightId: number;
  private currentPriceHistoryId: number;

  constructor() {
    this.users = new Map();
    this.deals = new Map();
    this.inventories = new Map();
    this.statsData = new Map();
    this.marketInsightsData = new Map();
    this.priceHistoryData = new Map();
    
    this.currentUserId = 1;
    this.currentDealId = 1;
    this.currentInventoryId = 1;
    this.currentStatId = 1;
    this.currentMarketInsightId = 1;
    this.currentPriceHistoryId = 1;

    // Initialize with sample data for development
    this._initSampleData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }

  // Deal operations
  async getDeals(): Promise<Deal[]> {
    return Array.from(this.deals.values());
  }

  async getDealsByUserId(userId: number): Promise<Deal[]> {
    return Array.from(this.deals.values()).filter(
      (deal) => deal.userId === userId,
    );
  }

  async getDeal(id: number): Promise<Deal | undefined> {
    return this.deals.get(id);
  }

  async createDeal(insertDeal: InsertDeal): Promise<Deal> {
    const id = this.currentDealId++;
    const now = new Date();
    const deal: Deal = { ...insertDeal, id, createdAt: now, updatedAt: now };
    this.deals.set(id, deal);
    return deal;
  }

  async updateDeal(id: number, dealUpdate: Partial<InsertDeal>): Promise<Deal | undefined> {
    const deal = this.deals.get(id);
    if (!deal) return undefined;
    
    const updatedDeal: Deal = { 
      ...deal, 
      ...dealUpdate, 
      updatedAt: new Date() 
    };
    
    this.deals.set(id, updatedDeal);
    return updatedDeal;
  }

  async deleteDeal(id: number): Promise<boolean> {
    return this.deals.delete(id);
  }

  // Inventory operations
  async getInventoryByUserId(userId: number): Promise<Inventory[]> {
    return Array.from(this.inventories.values()).filter(
      (inventory) => inventory.userId === userId,
    );
  }

  async getInventoryTotalValueByUserId(userId: number): Promise<number> {
    const userInventory = await this.getInventoryByUserId(userId);
    return userInventory.reduce((sum, item) => sum + item.value, 0);
  }

  async createInventory(insertInventory: InsertInventory): Promise<Inventory> {
    const id = this.currentInventoryId++;
    const now = new Date();
    const inventory: Inventory = { ...insertInventory, id, createdAt: now, updatedAt: now };
    this.inventories.set(id, inventory);
    return inventory;
  }

  async updateInventory(id: number, inventoryUpdate: Partial<InsertInventory>): Promise<Inventory | undefined> {
    const inventory = this.inventories.get(id);
    if (!inventory) return undefined;
    
    const updatedInventory: Inventory = { 
      ...inventory, 
      ...inventoryUpdate, 
      updatedAt: new Date() 
    };
    
    this.inventories.set(id, updatedInventory);
    return updatedInventory;
  }

  // Stats operations
  async getStatsByUserId(userId: number): Promise<Stat[]> {
    return Array.from(this.statsData.values()).filter(
      (stat) => stat.userId === userId,
    );
  }

  async createStat(insertStat: InsertStat): Promise<Stat> {
    const id = this.currentStatId++;
    const now = new Date();
    const stat: Stat = { ...insertStat, id, createdAt: now };
    this.statsData.set(id, stat);
    return stat;
  }

  async updateStat(id: number, statUpdate: Partial<InsertStat>): Promise<Stat | undefined> {
    const stat = this.statsData.get(id);
    if (!stat) return undefined;
    
    const updatedStat: Stat = { 
      ...stat, 
      ...statUpdate
    };
    
    this.statsData.set(id, updatedStat);
    return updatedStat;
  }

  // Market insights operations
  async getMarketInsights(): Promise<MarketInsight[]> {
    return Array.from(this.marketInsightsData.values());
  }

  async createMarketInsight(insertInsight: InsertMarketInsight): Promise<MarketInsight> {
    const id = this.currentMarketInsightId++;
    const now = new Date();
    const insight: MarketInsight = { ...insertInsight, id, createdAt: now };
    this.marketInsightsData.set(id, insight);
    return insight;
  }

  // Price history operations
  async getPriceHistoryByProductId(productId: string): Promise<PriceHistory[]> {
    return Array.from(this.priceHistoryData.values()).filter(
      (priceHistory) => priceHistory.productId === productId,
    );
  }

  async createPriceHistory(insertPriceHistory: InsertPriceHistory): Promise<PriceHistory> {
    const id = this.currentPriceHistoryId++;
    const now = new Date();
    const priceHistory: PriceHistory = { ...insertPriceHistory, id, createdAt: now };
    this.priceHistoryData.set(id, priceHistory);
    return priceHistory;
  }

  // Helper method to initialize sample data for development
  private _initSampleData() {
    // Create a sample user
    const user: User = {
      id: this.currentUserId++,
      username: 'alex',
      password: 'password123', // In a real app, this would be hashed
      fullName: 'Alex Smith',
      email: 'alex@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=48&h=48&q=80',
      createdAt: new Date()
    };
    this.users.set(user.id, user);

    // Create sample deals
    const deal1: Deal = {
      id: this.currentDealId++,
      userId: user.id,
      title: 'Nike Air Zoom Pegasus 38',
      description: 'Brand new Nike running shoes in original box',
      source: 'Facebook Marketplace',
      postedTime: '2 hours ago',
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=320&q=80',
      originalPrice: 130,
      currentPrice: 65,
      estimatedProfit: 45,
      condition: 'New',
      sellTimeEstimate: '~2-4 days',
      demand: 'High',
      matchScore: 98,
      isHotDeal: true,
      status: 'active',
      avgResellLow: 110,
      avgResellHigh: 130,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.deals.set(deal1.id, deal1);

    const deal2: Deal = {
      id: this.currentDealId++,
      userId: user.id,
      title: 'MacBook Pro 2019 (16")',
      description: 'MacBook Pro in excellent condition, barely used',
      source: 'Craigslist',
      postedTime: 'yesterday',
      imageUrl: 'https://images.unsplash.com/photo-1585155770447-2f66e2a397b5?ixlib=rb-1.2.1&auto=format&fit=crop&w=320&q=80',
      originalPrice: 1800,
      currentPrice: 1250,
      estimatedProfit: 250,
      condition: 'Excellent',
      sellTimeEstimate: '~7-10 days',
      demand: 'Medium',
      matchScore: 92,
      isHotDeal: false,
      status: 'active',
      avgResellLow: 1400,
      avgResellHigh: 1600,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.deals.set(deal2.id, deal2);

    const deal3: Deal = {
      id: this.currentDealId++,
      userId: user.id,
      title: 'Mid-Century Designer Chair',
      description: 'Authentic mid-century modern chair in good condition',
      source: 'Offerup',
      postedTime: '1 day ago',
      imageUrl: 'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?ixlib=rb-1.2.1&auto=format&fit=crop&w=320&q=80',
      originalPrice: 350,
      currentPrice: 120,
      estimatedProfit: 180,
      condition: 'Good',
      sellTimeEstimate: '~14-21 days',
      demand: 'Moderate',
      matchScore: 86,
      isHotDeal: false,
      status: 'active',
      avgResellLow: 280,
      avgResellHigh: 350,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.deals.set(deal3.id, deal3);

    // Create sample inventory categories
    const inventory1: Inventory = {
      id: this.currentInventoryId++,
      userId: user.id,
      category: 'Sneakers',
      count: 12,
      value: 4250,
      marketValue: 5800,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.inventories.set(inventory1.id, inventory1);

    const inventory2: Inventory = {
      id: this.currentInventoryId++,
      userId: user.id,
      category: 'Electronics',
      count: 8,
      value: 8760,
      marketValue: 11300,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.inventories.set(inventory2.id, inventory2);

    const inventory3: Inventory = {
      id: this.currentInventoryId++,
      userId: user.id,
      category: 'Home Goods',
      count: 5,
      value: 1850,
      marketValue: 2450,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.inventories.set(inventory3.id, inventory3);

    const inventory4: Inventory = {
      id: this.currentInventoryId++,
      userId: user.id,
      category: 'Apparel',
      count: 3,
      value: 980,
      marketValue: 1600,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.inventories.set(inventory4.id, inventory4);

    // Create sample stats
    const stat1: Stat = {
      id: this.currentStatId++,
      userId: user.id,
      name: 'Active Deals',
      value: 24,
      change: 8.1,
      changeType: 'positive',
      icon: 'file-text',
      createdAt: new Date()
    };
    this.statsData.set(stat1.id, stat1);

    const stat2: Stat = {
      id: this.currentStatId++,
      userId: user.id,
      name: 'Profit (30d)',
      value: 2856,
      change: 12.4,
      changeType: 'positive',
      icon: 'dollar-sign',
      createdAt: new Date()
    };
    this.statsData.set(stat2.id, stat2);

    const stat3: Stat = {
      id: this.currentStatId++,
      userId: user.id,
      name: 'Inventory Value',
      value: 16520,
      change: 3.2,
      changeType: 'negative',
      icon: 'box',
      createdAt: new Date()
    };
    this.statsData.set(stat3.id, stat3);

    const stat4: Stat = {
      id: this.currentStatId++,
      userId: user.id,
      name: 'Deal Success Rate',
      value: 68.4,
      change: 5.1,
      changeType: 'positive',
      icon: 'check-circle',
      createdAt: new Date()
    };
    this.statsData.set(stat4.id, stat4);

    // Create sample market insights
    const insight1: MarketInsight = {
      id: this.currentMarketInsightId++,
      title: 'Sneaker prices trending up',
      description: '+8.3% in the last 14 days',
      changePercentage: 8.3,
      iconType: 'trend-up',
      colorType: 'gold',
      createdAt: new Date()
    };
    this.marketInsightsData.set(insight1.id, insight1);

    const insight2: MarketInsight = {
      id: this.currentMarketInsightId++,
      title: 'Electronics demand falling',
      description: '-4.1% in the last 14 days',
      changePercentage: -4.1,
      iconType: 'trend-down',
      colorType: 'coral',
      createdAt: new Date()
    };
    this.marketInsightsData.set(insight2.id, insight2);

    const insight3: MarketInsight = {
      id: this.currentMarketInsightId++,
      title: 'New marketplace detected',
      description: 'Mercari gaining traction in your area',
      changePercentage: 0,
      iconType: 'info',
      colorType: 'teal',
      createdAt: new Date()
    };
    this.marketInsightsData.set(insight3.id, insight3);

    // Create sample price history for Nike Air Jordans
    const today = new Date();
    const productId = 'nike-air-jordan-1-retro';
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      
      // Create a gradually decreasing price (older dates have higher prices)
      const basePrice = 200; // Starting at $200
      const variation = Math.sin(i / 5) * 10; // Some variation
      const reduction = i * 3; // Gradual price decrease
      
      const pricePoint: PriceHistory = {
        id: this.currentPriceHistoryId++,
        productId,
        date,
        price: basePrice + variation - reduction,
        createdAt: new Date()
      };
      
      this.priceHistoryData.set(pricePoint.id, pricePoint);
    }
  }
}

export const storage = new MemStorage();
