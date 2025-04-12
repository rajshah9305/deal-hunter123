import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

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
      return apiRequest<any>("/api/ai/analyze-deal", {
        method: "POST",
        body: JSON.stringify(dealDetails),
        headers: {
          "Content-Type": "application/json",
        },
      });
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
      return apiRequest<any>("/api/ai/market-insights", {
        method: "POST",
        body: JSON.stringify({ categories }),
        headers: {
          "Content-Type": "application/json",
        },
      });
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
      return apiRequest<any>("/api/ai/price-prediction", {
        method: "POST",
        body: JSON.stringify(productDetails),
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
  });
}