import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Type for price prediction
export interface PricePredictionInput {
  title: string;
  category?: string;
  condition?: string;
  platform?: string;
  description?: string;
  additionalInfo?: string;
}

export interface PricePredictionOutput {
  estimatedPrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  confidenceScore: number;
  comparablePrices: Array<{
    platform: string;
    price: number;
  }>;
  factors: Array<{
    factor: string;
    impact: string;
  }>;
  recommendation: string;
}

// Type for market insights
export interface MarketInsightsInput {
  query: string;
  category?: string;
  location?: string;
  timeframe?: string;
}

export interface MarketInsightsOutput {
  demandLevel: string;
  competitionLevel: string;
  trendDirection: string;
  seasonalityImpact: string;
  bestPlatforms: string[];
  bestTimeToSell: string;
  priceRange: {
    low: number;
    average: number;
    high: number;
  };
  insights: string[];
  riskLevel: string;
  marketSize: string;
  growth: string;
  categoryInsights: string;
  summary: string;
}

// Type for deal analyzer
export interface DealAnalyzerInput {
  title: string;
  description?: string;
  originalPrice?: number;
  currentPrice: number;
  condition?: string;
  source?: string;
  category?: string;
  location?: string;
}

export interface DealAnalyzerOutput {
  estimatedValue: number;
  estimatedProfit: number;
  resellLow: number;
  resellHigh: number;
  sellTimeEstimate: string;
  demand: string;
  marketTrend: string;
  riskAssessment: string;
  confidenceScore: number;
  recommendedPlatforms: string[];
  category: string;
  tags: string[];
  summary: string;
}

// Type for listing generator
export interface ListingGeneratorInput {
  item: {
    title: string;
    description?: string;
    condition?: string;
    category?: string;
    purchasePrice?: number;
    estimatedValue?: number;
    tags?: string[];
  };
  platform: string;
  template?: string;
}

export interface ListingGeneratorOutput {
  title: string;
  description: string;
  suggestedPrice: number;
  tags: string[];
}

// Custom hook for price prediction
export function usePricePrediction() {
  return useMutation({
    mutationFn: async (data: PricePredictionInput): Promise<PricePredictionOutput> => {
      const response = await apiRequest("POST", "/api/ai/price-prediction", data);
      return await response.json();
    },
  });
}

// Custom hook for market insights
export function useMarketInsights() {
  return useMutation({
    mutationFn: async (data: MarketInsightsInput): Promise<MarketInsightsOutput> => {
      const response = await apiRequest("POST", "/api/ai/market-insights", data);
      return await response.json();
    },
  });
}

// Custom hook for deal analyzer
export function useDealAnalyzer() {
  return useMutation({
    mutationFn: async (data: DealAnalyzerInput): Promise<DealAnalyzerOutput> => {
      const response = await apiRequest("POST", "/api/ai/analyze-deal", data);
      return await response.json();
    },
  });
}

// Custom hook for listing generator
export function useGenerateListing() {
  return useMutation({
    mutationFn: async (data: ListingGeneratorInput): Promise<ListingGeneratorOutput> => {
      const response = await apiRequest("POST", "/api/ai/generate-listing", data);
      return await response.json();
    },
  });
}