// User type
export interface User {
  id: number;
  username: string;
  fullName?: string;
  email?: string;
  avatarUrl?: string;
  createdAt: Date;
}

// Deal type
export interface Deal {
  id: number;
  userId: number;
  title: string;
  description?: string;
  source?: string;
  postedTime?: string;
  imageUrl?: string;
  originalPrice?: number;
  currentPrice?: number;
  estimatedProfit?: number;
  condition?: string;
  sellTimeEstimate?: string;
  demand?: string;
  matchScore?: number;
  isHotDeal?: boolean;
  status?: string;
  avgResellLow?: number;
  avgResellHigh?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Inventory type
export interface Inventory {
  id: number;
  userId: number;
  category: string;
  count: number;
  value: number;
  marketValue?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Stat type
export interface Stat {
  id: number;
  userId: number;
  name: string;
  value: number;
  change?: number;
  changeType?: string;
  icon?: string;
  createdAt: Date;
}

// Market Insight type
export interface MarketInsight {
  id: number;
  title: string;
  description?: string;
  changePercentage?: number;
  iconType: string;
  colorType: string;
  createdAt: Date;
}

// Price History type
export interface PriceHistory {
  id: number;
  productId: string;
  date: Date;
  price: number;
  createdAt: Date;
}
