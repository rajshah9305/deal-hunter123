import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Define types for the AI responses
export type DealAnalysis = {
  matchScore: number;
  estimatedProfit: number;
  avgResellLow: number;
  avgResellHigh: number;
  sellTimeEstimate: string;
  demand: string;
  isHotDeal: boolean;
  analysis: string;
  sellingTips: string[];
};

export type MarketInsightAI = {
  title: string;
  description: string;
  changePercentage: number;
  iconType: string;
  colorType: string;
};

export type PricePrediction = {
  futurePrices: Array<{
    daysFromNow: number;
    predictedPrice: number;
    trend: "up" | "down" | "stable";
  }>;
  overallTrend: "up" | "down" | "stable";
  confidenceLevel: number;
  reasoning: string;
};

/**
 * Hook for analyzing a deal using AI
 * @returns Mutation function and state for deal analysis
 */
export function useAnalyzeDeal() {
  return useMutation({
    mutationFn: async (dealDetails: {
      title: string;
      description?: string;
      originalPrice?: number;
      currentPrice: number;
      condition?: string;
      source?: string;
    }) => {
      return apiRequest("/api/ai/analyze-deal", {
        method: "POST",
        body: JSON.stringify(dealDetails),
        headers: {
          "Content-Type": "application/json",
        },
      }) as Promise<DealAnalysis>;
    },
  });
}

/**
 * Hook for generating market insights using AI
 * @returns Mutation function and state for market insights
 */
export function useGenerateMarketInsights() {
  return useMutation({
    mutationFn: async (categories?: string[]) => {
      return apiRequest("/api/ai/market-insights", {
        method: "POST",
        body: JSON.stringify({ categories }),
        headers: {
          "Content-Type": "application/json",
        },
      }) as Promise<MarketInsightAI[]>;
    },
  });
}

/**
 * Hook for predicting price trends using AI
 * @returns Mutation function and state for price prediction
 */
export function usePredictPriceTrend() {
  return useMutation({
    mutationFn: async (productDetails: {
      title: string;
      category?: string;
      currentPrice: number;
      historicalPrices?: { date: string; price: number }[];
    }) => {
      return apiRequest("/api/ai/price-prediction", {
        method: "POST",
        body: JSON.stringify(productDetails),
        headers: {
          "Content-Type": "application/json",
        },
      }) as Promise<PricePrediction>;
    },
  });
}