import { useState } from "react";
import { usePricePrediction, type PricePredictionInput, type PricePredictionOutput } from "@/hooks/use-ai";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { 
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  TrendingUp, TrendingDown, Clock, DollarSign, Calendar, Gauge, AlertTriangle, 
  LineChart
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";

// Form schema
const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  category: z.string().optional(),
  currentPrice: z.string().min(1, "Current price is required").transform(val => parseFloat(val)),
  // Historical prices are added dynamically
});

export default function PricePrediction() {
  const { toast } = useToast();
  const [prediction, setPrediction] = useState<PricePredictionOutput | null>(null);
  const [historicalPrices, setHistoricalPrices] = useState<
    { date: string; price: number; source?: string }[]
  >([]);
  const [newPrice, setNewPrice] = useState({ date: "", price: "", source: "" });
  const pricePredictionMutation = usePricePrediction();

  // Form setup
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      category: "",
      currentPrice: "",
    },
  });

  // Add a historical price entry
  const addHistoricalPrice = () => {
    if (newPrice.date && newPrice.price) {
      const priceValue = parseFloat(newPrice.price);
      if (!isNaN(priceValue)) {
        setHistoricalPrices([
          ...historicalPrices,
          { 
            date: newPrice.date, 
            price: priceValue,
            source: newPrice.source || undefined
          }
        ]);
        setNewPrice({ date: "", price: "", source: "" });
      }
    }
  };

  // Remove a historical price entry
  const removeHistoricalPrice = (index: number) => {
    setHistoricalPrices(historicalPrices.filter((_, i) => i !== index));
  };

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const predictionInput: PricePredictionInput = {
        title: values.title,
        category: values.category,
        currentPrice: values.currentPrice,
        historicalPrices: historicalPrices.length > 0 ? historicalPrices : undefined,
      };
      
      const result = await pricePredictionMutation.mutateAsync(predictionInput);
      
      setPrediction(result);
      toast({
        title: "Price prediction complete",
        description: "Price trend prediction has been generated.",
      });
    } catch (error) {
      console.error("Error predicting price trend:", error);
      toast({
        title: "Prediction failed",
        description: "Failed to predict price trend. Please try again.",
        variant: "destructive",
      });
    }
  }

  // Helper function for rendering the confidence score
  const renderConfidenceScore = (score: number) => {
    let color = "bg-red-500";
    if (score >= 70) color = "bg-green-500";
    else if (score >= 40) color = "bg-yellow-500";
    
    return (
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm font-medium">Confidence Score</span>
          <span className="text-sm font-medium">{score}%</span>
        </div>
        <Progress value={score} className={`h-2 ${color}`} />
      </div>
    );
  };

  // Generate chart data for the price prediction
  const generateChartData = () => {
    if (!prediction) return [];
    
    // Combine historical data with predictions
    const chartData = [
      // Start with current price
      {
        name: "Current",
        price: form.getValues().currentPrice,
        type: "actual"
      },
      // Add prediction for 30 days
      {
        name: "30 Days",
        price: prediction.projectedPrice30Days,
        type: "predicted"
      },
      // Add prediction for 90 days
      {
        name: "90 Days",
        price: prediction.projectedPrice90Days,
        type: "predicted"
      }
    ];
    
    return chartData;
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Price Prediction Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            Price Trend Prediction
          </CardTitle>
          <CardDescription>
            Predict future price trends for products with AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Title*</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Apple iPhone 13 Pro Max 256GB" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Electronics, Clothing, Toys" {...field} />
                    </FormControl>
                    <FormDescription>
                      Product category helps improve prediction accuracy
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="currentPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Price ($)*</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="49.99" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Separator className="my-4" />
              
              <div>
                <h3 className="text-sm font-medium mb-2">Historical Prices (Optional)</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Add previous prices to improve prediction accuracy
                </p>
                
                <div className="space-y-4">
                  {/* Historical price inputs */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Input
                        type="date"
                        placeholder="Date"
                        value={newPrice.date}
                        onChange={(e) => setNewPrice({ ...newPrice, date: e.target.value })}
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Price ($)"
                        value={newPrice.price}
                        onChange={(e) => setNewPrice({ ...newPrice, price: e.target.value })}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Source (optional)"
                        value={newPrice.source}
                        onChange={(e) => setNewPrice({ ...newPrice, source: e.target.value })}
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={addHistoricalPrice}
                        disabled={!newPrice.date || !newPrice.price}
                        className="shrink-0"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                  
                  {/* Display added historical prices */}
                  {historicalPrices.length > 0 && (
                    <div className="border rounded-md p-3">
                      <h4 className="text-sm font-medium mb-2">Added Historical Prices</h4>
                      <div className="space-y-2">
                        {historicalPrices.map((price, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <div>
                              <span className="font-medium">{price.date}</span>: ${price.price.toFixed(2)}
                              {price.source && <span className="text-muted-foreground ml-2">({price.source})</span>}
                            </div>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeHistoricalPrice(index)}
                              className="h-6 w-6 p-0"
                            >
                              ✕
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={pricePredictionMutation.isPending}
              >
                {pricePredictionMutation.isPending ? "Predicting..." : "Predict Price Trend"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Prediction Results */}
      {prediction && (
        <Card>
          <CardHeader>
            <CardTitle>Price Prediction Results</CardTitle>
            <CardDescription>
              AI-powered price trend prediction for {form.getValues().title}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Price projection chart */}
            <div className="h-64 border p-4 rounded-lg">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart
                  data={generateChartData()}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis 
                    domain={['auto', 'auto']}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    formatter={(value) => [`$${Number(value).toFixed(2)}`, "Price"]}
                  />
                  <ReferenceLine 
                    y={form.getValues().currentPrice} 
                    stroke="#888" 
                    strokeDasharray="3 3"
                    label="Current"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>

            {/* Main projections */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="border shadow-none">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">30-Day Projection</p>
                    <div className="flex items-end gap-2">
                      <p className="text-2xl font-bold">${prediction.projectedPrice30Days.toFixed(2)}</p>
                      {prediction.priceDirection === "up" ? (
                        <span className="text-green-500 flex items-center">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          {(((prediction.projectedPrice30Days - form.getValues().currentPrice) / form.getValues().currentPrice) * 100).toFixed(1)}%
                        </span>
                      ) : prediction.priceDirection === "down" ? (
                        <span className="text-red-500 flex items-center">
                          <TrendingDown className="h-4 w-4 mr-1" />
                          {(((form.getValues().currentPrice - prediction.projectedPrice30Days) / form.getValues().currentPrice) * 100).toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-gray-500">Stable</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border shadow-none">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">90-Day Projection</p>
                    <div className="flex items-end gap-2">
                      <p className="text-2xl font-bold">${prediction.projectedPrice90Days.toFixed(2)}</p>
                      {prediction.priceDirection === "up" ? (
                        <span className="text-green-500 flex items-center">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          {(((prediction.projectedPrice90Days - form.getValues().currentPrice) / form.getValues().currentPrice) * 100).toFixed(1)}%
                        </span>
                      ) : prediction.priceDirection === "down" ? (
                        <span className="text-red-500 flex items-center">
                          <TrendingDown className="h-4 w-4 mr-1" />
                          {(((form.getValues().currentPrice - prediction.projectedPrice90Days) / form.getValues().currentPrice) * 100).toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-gray-500">Stable</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator />

            {/* Price direction and recommended action */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Price Direction</p>
                <div className="flex items-center gap-2">
                  {prediction.priceDirection === "up" ? (
                    <>
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      <span className="font-medium">Rising</span>
                    </>
                  ) : prediction.priceDirection === "down" ? (
                    <>
                      <TrendingDown className="h-5 w-5 text-red-500" />
                      <span className="font-medium">Falling</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      <span className="font-medium">Stable</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Recommended Action</p>
                <Badge
                  className={
                    prediction.recommendedAction === "buy"
                      ? "bg-green-100 text-green-800 hover:bg-green-200"
                      : prediction.recommendedAction === "sell"
                      ? "bg-red-100 text-red-800 hover:bg-red-200"
                      : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                  }
                >
                  {prediction.recommendedAction.toUpperCase()}
                </Badge>
              </div>
            </div>

            {/* Seasonality and best time to sell */}
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Seasonality Factor</p>
                <p className="text-sm">{prediction.seasonalityFactor}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Best Season to Resell</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{prediction.bestResellSeason}</span>
                </div>
              </div>
            </div>

            {/* Confidence score */}
            {renderConfidenceScore(prediction.confidenceScore)}

            {/* Reasoning */}
            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-center gap-2 mb-2">
                <Gauge className="h-4 w-4" />
                <p className="font-medium">Analysis Reasoning</p>
              </div>
              <p className="text-sm">{prediction.reasoning}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}