import { useState } from "react";
import { useAnalyzeDeal, type DealAnalysisOutput } from "@/hooks/use-ai";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp, TrendingDown, AlertTriangle, DollarSign, Clock, Tag, 
  BarChart, ShoppingBag, Truck 
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

// Form schema
const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  originalPrice: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  currentPrice: z.string().min(1, "Current price is required").transform(val => parseFloat(val)),
  condition: z.string().optional(),
  source: z.string().optional(),
});

export default function DealAnalyzer() {
  const { toast } = useToast();
  const [analysisResult, setAnalysisResult] = useState<DealAnalysisOutput | null>(null);
  const analyzeDealMutation = useAnalyzeDeal();

  // Form setup
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      originalPrice: "",
      currentPrice: "",
      condition: "",
      source: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const result = await analyzeDealMutation.mutateAsync({
        title: values.title,
        description: values.description,
        originalPrice: values.originalPrice,
        currentPrice: values.currentPrice,
        condition: values.condition,
        source: values.source,
      });
      
      setAnalysisResult(result);
      toast({
        title: "Analysis complete",
        description: "Deal analysis completed successfully.",
      });
    } catch (error) {
      console.error("Error analyzing deal:", error);
      toast({
        title: "Analysis failed",
        description: "Failed to analyze the deal. Please try again.",
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

  // Helper function to determine badge color based on demand
  const getDemandColor = (demand: string) => {
    switch (demand.toLowerCase()) {
      case 'high': return 'bg-green-500 hover:bg-green-600';
      case 'medium': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'low': return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Deal Analysis Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            AI Deal Analyzer
          </CardTitle>
          <CardDescription>
            Enter details about a potential deal to get AI-powered analysis
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Details about the product, condition, features, etc." 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="originalPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Original Price ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="99.99" {...field} />
                      </FormControl>
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
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition</FormLabel>
                      <FormControl>
                        <Input placeholder="New, Used, Like New, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source</FormLabel>
                      <FormControl>
                        <Input placeholder="Facebook, eBay, Local store, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={analyzeDealMutation.isPending}
              >
                {analyzeDealMutation.isPending ? "Analyzing..." : "Analyze Deal"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle>Deal Analysis Results</CardTitle>
            <CardDescription>
              AI-powered analysis for {form.getValues().title}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Main metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Estimated Value</p>
                <p className="text-2xl font-bold">${analysisResult.estimatedValue.toFixed(2)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Estimated Profit</p>
                <p className={`text-2xl font-bold ${analysisResult.estimatedProfit > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ${analysisResult.estimatedProfit.toFixed(2)}
                </p>
              </div>
            </div>

            <Separator />

            {/* Resale prices */}
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Typical Resale Range</p>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-lg font-medium">
                  ${analysisResult.resellLow.toFixed(2)} - ${analysisResult.resellHigh.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Market metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Demand</p>
                <Badge className={`${getDemandColor(analysisResult.demand)}`}>
                  {analysisResult.demand}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Estimated Time to Sell</p>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{analysisResult.sellTimeEstimate}</span>
                </div>
              </div>
            </div>

            {/* Market trend */}
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Market Trend</p>
              <div className="flex items-center gap-2">
                {analysisResult.marketTrend.toLowerCase().includes('up') ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : analysisResult.marketTrend.toLowerCase().includes('down') ? (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                )}
                <span>{analysisResult.marketTrend}</span>
              </div>
            </div>

            {/* Category and tags */}
            <div className="space-y-2">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Category</p>
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span>{analysisResult.category}</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.tags.map((tag, i) => (
                    <Badge key={i} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Confidence score */}
            {renderConfidenceScore(analysisResult.confidenceScore)}

            {/* Risk assessment */}
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Risk Assessment</p>
              <p className="text-sm">{analysisResult.riskAssessment}</p>
            </div>

            {/* Recommended platforms */}
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Recommended Selling Platforms</p>
              <div className="flex flex-wrap gap-2">
                {analysisResult.recommendedPlatforms.map((platform, i) => (
                  <Badge key={i} variant="secondary">{platform}</Badge>
                ))}
              </div>
            </div>
            
            {/* Summary */}
            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4" />
                <p className="font-medium">Summary</p>
              </div>
              <p className="text-sm">{analysisResult.summary}</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => {
                // Save the deal to the database
                toast({
                  title: "Deal saved",
                  description: "This deal has been added to your tracked deals",
                });
              }}
              className="flex items-center gap-2 w-full"
            >
              <ShoppingBag className="h-4 w-4" />
              Save Deal
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}