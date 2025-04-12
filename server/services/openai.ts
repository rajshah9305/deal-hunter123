import OpenAI from "openai";

// Initialize the OpenAI client with the API key from environment variables
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

/**
 * Analyzes a deal and provides AI-powered insights
 * @param dealDetails Object containing details about the deal
 * @returns Analysis results including profit potential, market assessment, and selling tips
 */
export async function analyzeDeal(dealDetails: {
  title: string;
  description?: string;
  originalPrice?: number;
  currentPrice: number;
  condition?: string;
  source?: string;
}) {
  try {
    const prompt = `
      As an AI assistant for a deal flipping platform, analyze this potential deal:
      
      Item: ${dealDetails.title}
      Description: ${dealDetails.description || "Not provided"}
      Original Price: $${dealDetails.originalPrice || "Unknown"}
      Current Price: $${dealDetails.currentPrice}
      Condition: ${dealDetails.condition || "Unknown"}
      Source: ${dealDetails.source || "Unknown"}
      
      Please provide a comprehensive analysis in JSON format with the following structure:
      {
        "matchScore": A number from 0-100 representing how good this deal is,
        "estimatedProfit": Estimated profit in dollars based on market research,
        "avgResellLow": Estimated low-end resell value in dollars,
        "avgResellHigh": Estimated high-end resell value in dollars,
        "sellTimeEstimate": Estimated time to sell (e.g., "1-2 days", "1 week", "2-4 weeks"),
        "demand": Categorize demand as "High", "Medium", or "Low",
        "isHotDeal": Boolean indicating if this is an exceptionally good deal,
        "analysis": A brief paragraph with market analysis and reasons for the assessment,
        "sellingTips": Array of 2-3 specific tips for maximizing profit on this deal
      }
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    return JSON.parse(content);
  } catch (error: any) {
    console.error("Error analyzing deal with OpenAI:", error);
    throw new Error(`Failed to analyze deal: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Generates market insights based on recent deals and trends
 * @param categories Array of product categories to get insights for
 * @returns Array of market insights with trend information
 */
export async function generateMarketInsights(categories: string[] = []) {
  try {
    const prompt = `
      As an AI assistant for a deal flipping platform, generate market insights for these product categories:
      ${categories.length > 0 ? categories.join(", ") : "general market"}
      
      Provide insights in JSON format with an array of 4-5 insight objects with this structure:
      {
        "insights": [
          {
            "title": Short, specific title of the insight,
            "description": Brief explanation of the trend or pattern,
            "changePercentage": A positive or negative percentage change related to the insight,
            "iconType": One of: "trend-up", "trend-down", or "info",
            "colorType": One of: "gold", "coral", or "teal"
          },
          ...
        ]
      }
      
      Make the insights specific, data-driven, and actionable for resellers. Include both positive and negative trends.
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    return JSON.parse(content).insights;
  } catch (error: any) {
    console.error("Error generating market insights with OpenAI:", error);
    throw new Error(`Failed to generate market insights: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Predicts price trends for a specific product
 * @param productDetails Product details for prediction
 * @returns Prediction data including future price points and confidence level
 */
export async function predictPriceTrend(productDetails: {
  title: string;
  category?: string;
  currentPrice: number;
  historicalPrices?: {date: string, price: number}[];
}) {
  try {
    const prompt = `
      As an AI assistant for a deal flipping platform, predict the price trend for this product:
      
      Product: ${productDetails.title}
      Category: ${productDetails.category || "Unknown"}
      Current Price: $${productDetails.currentPrice}
      Historical Prices: ${productDetails.historicalPrices ? 
        JSON.stringify(productDetails.historicalPrices) : 
        "Not provided"}
      
      Provide the prediction in JSON format with this structure:
      {
        "futurePrices": [
          {"daysFromNow": 7, "predictedPrice": price in dollars, "trend": "up" or "down" or "stable"},
          {"daysFromNow": 14, "predictedPrice": price in dollars, "trend": "up" or "down" or "stable"},
          {"daysFromNow": 30, "predictedPrice": price in dollars, "trend": "up" or "down" or "stable"}
        ],
        "overallTrend": "up" or "down" or "stable",
        "confidenceLevel": a number from 0 to 100,
        "reasoning": A brief explanation of the prediction with factors considered
      }
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    return JSON.parse(content);
  } catch (error: any) {
    console.error("Error predicting price trend with OpenAI:", error);
    throw new Error(`Failed to predict price trend: ${error.message || 'Unknown error'}`);
  }
}