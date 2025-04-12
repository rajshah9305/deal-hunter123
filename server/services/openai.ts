import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. Do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

// Define the interfaces for AI analysis input/output
interface DealAnalysisInput {
  title: string;
  description?: string;
  originalPrice?: number;
  currentPrice: number;
  condition?: string;
  source?: string;
}

interface DealAnalysisOutput {
  estimatedValue: number;
  estimatedProfit: number;
  resellLow: number;
  resellHigh: number;
  demand: string; // "high", "medium", "low"
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

interface PricePredictionInput {
  title: string;
  category?: string;
  currentPrice: number;
  historicalPrices?: {
    date: string;
    price: number;
    source?: string;
  }[];
}

interface PricePredictionOutput {
  projectedPrice30Days: number;
  projectedPrice90Days: number;
  priceDirection: string; // "up", "down", "stable"
  seasonalityFactor: string;
  confidenceScore: number;
  recommendedAction: string; // "buy", "sell", "hold"
  reasoning: string;
  bestResellSeason: string;
}

// AI-powered deal analysis function
export async function analyzeDeal(dealData: DealAnalysisInput): Promise<DealAnalysisOutput> {
  try {
    const prompt = `
As an expert in product valuation and reselling, analyze this potential deal:

Product: ${dealData.title}
${dealData.description ? `Description: ${dealData.description}` : ''}
${dealData.originalPrice ? `Original Price: $${dealData.originalPrice}` : ''}
Current Price: $${dealData.currentPrice}
${dealData.condition ? `Condition: ${dealData.condition}` : ''}
${dealData.source ? `Source: ${dealData.source}` : ''}

Please provide a comprehensive analysis with these components:
1. Estimated fair market value
2. Estimated profit potential if resold
3. Typical resale price range (low and high)
4. Market demand level (high/medium/low)
5. Current market trend
6. Estimated time to sell
7. Recommended selling platforms
8. Best product category and tags
9. Risk assessment
10. Overall confidence score (0-100)
11. Brief summary of opportunity

Respond in JSON format with these fields:
- estimatedValue: number
- estimatedProfit: number
- resellLow: number
- resellHigh: number
- demand: string (high/medium/low)
- marketTrend: string
- sellTimeEstimate: string
- recommendedPlatforms: string[]
- category: string
- tags: string[]
- riskAssessment: string
- confidenceScore: number
- summary: string
`;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const responseContent = response.choices[0].message.content;
    if (!responseContent) {
      throw new Error("Empty response from OpenAI");
    }

    const analysisResult = JSON.parse(responseContent) as DealAnalysisOutput;
    return analysisResult;
  } catch (error) {
    console.error("Error analyzing deal with OpenAI:", error);
    throw error;
  }
}

// AI-powered price trend prediction
export async function predictPriceTrend(predictionData: PricePredictionInput): Promise<PricePredictionOutput> {
  try {
    const historicalPricesText = predictionData.historicalPrices ? 
      `Historical Prices:\n${predictionData.historicalPrices.map(p => 
        `- Date: ${p.date}, Price: $${p.price}${p.source ? `, Source: ${p.source}` : ''}`
      ).join('\n')}` : 
      "No historical price data available.";

    const prompt = `
As a market analyst specializing in price projections, predict the price trend for this product:

Product: ${predictionData.title}
${predictionData.category ? `Category: ${predictionData.category}` : ''}
Current Price: $${predictionData.currentPrice}

${historicalPricesText}

Please provide a detailed price prediction with these components:
1. Projected price in 30 days
2. Projected price in 90 days
3. Overall price direction (up/down/stable)
4. Seasonality impact on pricing
5. Confidence level in prediction (0-100)
6. Recommended action (buy/sell/hold)
7. Reasoning behind prediction
8. Best season to resell this product

Respond in JSON format with these fields:
- projectedPrice30Days: number
- projectedPrice90Days: number
- priceDirection: string
- seasonalityFactor: string
- confidenceScore: number
- recommendedAction: string
- reasoning: string
- bestResellSeason: string
`;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const responseContent = response.choices[0].message.content;
    if (!responseContent) {
      throw new Error("Empty response from OpenAI");
    }

    const predictionResult = JSON.parse(responseContent) as PricePredictionOutput;
    return predictionResult;
  } catch (error) {
    console.error("Error predicting price trend with OpenAI:", error);
    throw error;
  }
}

// AI-powered market insights generation
export async function generateMarketInsights(categories: string[]): Promise<any[]> {
  try {
    const categoriesText = categories.length > 0 ? 
      `Focus on these specific categories: ${categories.join(', ')}` : 
      "Provide insights across a diverse range of product categories, especially those popular in resale markets.";

    const prompt = `
As a market intelligence expert, generate current market insights for resellers.

${categoriesText}

For each insight, include:
1. Title of the trend or insight
2. Brief description explaining the insight
3. Related product category
4. Percentage change (if applicable)
5. Icon type that would represent this insight (trending_up, trending_down, warning, info, etc.)
6. Color type (success, warning, danger, info)
7. Source of information (if applicable)
8. Time period (daily, weekly, monthly)

Provide 7-10 different insights in JSON format with these fields:
[
  {
    "title": string,
    "description": string,
    "category": string,
    "changePercentage": number,
    "iconType": string,
    "colorType": string,
    "source": string,
    "period": string
  }
]

Ensure insights are data-driven, actionable for resellers, and represent current market conditions.
`;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.4,
    });

    const responseContent = response.choices[0].message.content;
    if (!responseContent) {
      throw new Error("Empty response from OpenAI");
    }

    const insightsResult = JSON.parse(responseContent);
    return insightsResult.insights || [];
  } catch (error) {
    console.error("Error generating market insights with OpenAI:", error);
    throw error;
  }
}

// Generate optimized product listing with AI
export async function generateListing(
  item: {
    title: string;
    description?: string;
    condition?: string;
    category?: string;
    purchasePrice?: number;
    estimatedValue?: number;
    images?: string[];
    tags?: string[];
  },
  platform: string,
  template?: string
): Promise<{
  title: string;
  description: string;
  suggestedPrice: number;
  tags: string[];
}> {
  try {
    const imagesText = item.images && item.images.length > 0 ? 
      `The item has ${item.images.length} image(s) available.` : 
      "No images are available for this item.";
    
    const templateText = template ? 
      `Use this template as a guide: ${template}` : 
      "Create a professional listing from scratch.";

    const prompt = `
As an expert e-commerce listing writer for ${platform}, create an optimized product listing for this item:

Product: ${item.title}
${item.description ? `Description: ${item.description}` : ''}
${item.condition ? `Condition: ${item.condition}` : ''}
${item.category ? `Category: ${item.category}` : ''}
${item.purchasePrice ? `Purchase Price: $${item.purchasePrice}` : ''}
${item.estimatedValue ? `Estimated Value: $${item.estimatedValue}` : ''}
${item.tags && item.tags.length > 0 ? `Tags: ${item.tags.join(', ')}` : ''}
${imagesText}

${templateText}

Your listing should include:
1. An attention-grabbing title optimized for ${platform}'s search algorithm (max 80 characters)
2. A detailed, well-formatted description highlighting key features, condition, and benefits
3. A suggested selling price based on market value and platform
4. Relevant tags/keywords to maximize visibility

Respond in JSON format with these fields:
- title: string
- description: string
- suggestedPrice: number
- tags: string[]
`;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const responseContent = response.choices[0].message.content;
    if (!responseContent) {
      throw new Error("Empty response from OpenAI");
    }

    const listingResult = JSON.parse(responseContent);
    return listingResult;
  } catch (error) {
    console.error("Error generating listing with OpenAI:", error);
    throw error;
  }
}