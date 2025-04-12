import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Deal Analysis
export interface DealAnalysisInput {
  title: string;
  description?: string;
  originalPrice?: number;
  currentPrice: number;
  condition?: string;
  source?: string;
}

export interface DealAnalysisOutput {
  estimatedValue: number;
  estimatedProfit: number;
  resellLow: number;
  resellHigh: number;
  demand: string;
  marketTrend: string;
  sellTimeEstimate: string;
  recommendedPlatforms: string[];
  competitorPrices?: {
    platform: string;
    price: number;
  }[];
  category: string;
  tags: string[];
  riskAssessment: string;
  confidenceScore: number;
  summary: string;
}

// Price Prediction
export interface PricePredictionInput {
  title: string;
  category?: string;
  currentPrice: number;
  historicalPrices?: {
    date: string;
    price: number;
    source?: string;
  }[];
}

export interface PricePredictionOutput {
  projectedPrice30Days: number;
  projectedPrice90Days: number;
  priceDirection: string;
  seasonalityFactor: string;
  confidenceScore: number;
  recommendedAction: string;
  reasoning: string;
  bestResellSeason: string;
}

// Market Insights
export interface MarketInsight {
  title: string;
  description: string;
  category: string;
  changePercentage?: number;
  iconType: string;
  colorType: string;
  source?: string;
  period: string;
}

// Listing Generation
export interface ListingGenerationInput {
  item: {
    title: string;
    description?: string;
    condition?: string;
    category?: string;
    purchasePrice?: number;
    estimatedValue?: number;
    images?: string[];
    tags?: string[];
  };
  platform: string;
  template?: string;
}

export interface ListingGenerationOutput {
  title: string;
  description: string;
  suggestedPrice: number;
  tags: string[];
}

// Custom hooks
export function useAnalyzeDeal() {
  return useMutation<DealAnalysisOutput, Error, DealAnalysisInput>({
    mutationFn: async (dealData: DealAnalysisInput) => {
      const response = await apiRequest("POST", "/api/ai/analyze-deal", dealData);
      const data = await response.json();
      return data;
    },
  });
}

export function usePricePrediction() {
  return useMutation<PricePredictionOutput, Error, PricePredictionInput>({
    mutationFn: async (predictionData: PricePredictionInput) => {
      const response = await apiRequest("POST", "/api/ai/price-prediction", predictionData);
      const data = await response.json();
      return data;
    },
  });
}

export function useMarketInsights() {
  return useMutation<MarketInsight[], Error, string[]>({
    mutationFn: async (categories: string[] = []) => {
      const response = await apiRequest("POST", "/api/ai/market-insights", { categories });
      const data = await response.json();
      return data;
    },
  });
}

export function useGenerateListing() {
  return useMutation<ListingGenerationOutput, Error, ListingGenerationInput>({
    mutationFn: async (input: ListingGenerationInput) => {
      const response = await apiRequest("POST", "/api/ai/generate-listing", input);
      const data = await response.json();
      return data;
    },
  });
}