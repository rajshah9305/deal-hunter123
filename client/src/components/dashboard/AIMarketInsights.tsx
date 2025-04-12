import { useState } from "react";
import { useMarketInsights, type MarketInsight } from "@/hooks/use-ai";
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { 
  TrendingUp, TrendingDown, AlertTriangle, Info, RefreshCw, Filter, Calendar
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function AIMarketInsights() {
  const { toast } = useToast();
  const [insights, setInsights] = useState<MarketInsight[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [filterPeriod, setFilterPeriod] = useState<string>("all");
  const marketInsightsMutation = useMarketInsights();

  // Generate insights when component mounts or when requested
  const generateInsights = async () => {
    try {
      const results = await marketInsightsMutation.mutateAsync(categories);
      setInsights(results);
      toast({
        title: "Market insights updated",
        description: "Latest market insights have been generated",
      });
    } catch (error) {
      console.error("Error generating market insights:", error);
      toast({
        title: "Failed to generate insights",
        description: "There was an error generating market insights",
        variant: "destructive",
      });
    }
  };

  // Add a category to the list
  const handleAddCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setNewCategory("");
    }
  };

  // Remove a category from the list
  const handleRemoveCategory = (categoryToRemove: string) => {
    setCategories(categories.filter(cat => cat !== categoryToRemove));
  };

  // Filter insights by period
  const filteredInsights = filterPeriod === "all"
    ? insights
    : insights.filter(insight => insight.period === filterPeriod);

  // Helper to get the appropriate icon for each insight
  const getInsightIcon = (iconType: string) => {
    switch (iconType.toLowerCase()) {
      case 'trending_up':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'trending_down':
        return <TrendingDown className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  // Helper to get the appropriate badge color for each insight
  const getInsightBadgeColor = (colorType: string) => {
    switch (colorType.toLowerCase()) {
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'danger':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Market Insights</h2>
          <p className="text-muted-foreground">
            AI-powered market trends and insights to help you make better deals
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={filterPeriod} onValueChange={setFilterPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Periods</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            onClick={generateInsights} 
            disabled={marketInsightsMutation.isPending}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Categories
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Filter by Categories</DialogTitle>
                <DialogDescription>
                  Add categories to focus the market insights on specific product types.
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-2">
                <Input 
                  placeholder="Add a category..." 
                  value={newCategory} 
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                />
                <Button onClick={handleAddCategory}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {categories.map((category, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {category}
                    <button 
                      onClick={() => handleRemoveCategory(category)}
                      className="ml-1 text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
                {categories.length === 0 && (
                  <p className="text-sm text-muted-foreground">No categories selected. Default insights will include various popular categories.</p>
                )}
              </div>
              <DialogFooter>
                <Button onClick={generateInsights} disabled={marketInsightsMutation.isPending}>
                  Apply & Generate Insights
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Loading state */}
      {marketInsightsMutation.isPending && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-3 w-1/3" />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Insights display */}
      {!marketInsightsMutation.isPending && (
        <>
          {filteredInsights.length === 0 ? (
            <div className="py-12 text-center">
              <Info className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No insights available</h3>
              <p className="text-muted-foreground mt-2">
                Click the "Refresh" button to generate market insights or adjust your category filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredInsights.map((insight, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {getInsightIcon(insight.iconType)}
                      {insight.title}
                    </CardTitle>
                    <div className="flex justify-between items-center">
                      <CardDescription>{insight.category}</CardDescription>
                      {insight.changePercentage !== undefined && (
                        <Badge 
                          variant="outline" 
                          className={getInsightBadgeColor(insight.colorType)}
                        >
                          {insight.changePercentage > 0 ? '+' : ''}{insight.changePercentage}%
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{insight.description}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {insight.period}
                    </div>
                    {insight.source && <div>Source: {insight.source}</div>}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}