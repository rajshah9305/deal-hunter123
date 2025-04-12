import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useGenerateMarketInsights, MarketInsightAI } from "@/hooks/use-ai";
import { Loader2Icon, RefreshCwIcon, TrendingDownIcon, TrendingUpIcon, InfoIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AIMarketInsights() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<string[]>(["Electronics", "Sneakers", "Home Goods", "Apparel"]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const generateInsightsMutation = useGenerateMarketInsights();

  // Generate insights on component mount
  useEffect(() => {
    handleGenerateInsights();
  }, []);

  const handleGenerateInsights = () => {
    const categoriesToUse = selectedCategory ? [selectedCategory] : categories;
    
    generateInsightsMutation.mutate(categoriesToUse, {
      onSuccess: () => {
        setLastUpdated(new Date());
        toast({
          title: "Market insights updated",
          description: "The latest market trends have been analyzed.",
        });
      },
      onError: () => {
        toast({
          title: "Failed to update insights",
          description: "Could not retrieve market insights. Please try again.",
          variant: "destructive",
        });
      },
    });
  };

  // Helper function to get the appropriate icon
  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'trend-up':
        return <TrendingUpIcon className="h-5 w-5 text-[#FFB800]" />;
      case 'trend-down':
        return <TrendingDownIcon className="h-5 w-5 text-[#FF7F6B]" />;
      case 'info':
        return <InfoIcon className="h-5 w-5 text-[#4A6670]" />;
      default:
        return <InfoIcon className="h-5 w-5 text-[#4A6670]" />;
    }
  };

  // Helper function to get the background color based on color type
  const getBgColor = (colorType: string) => {
    switch (colorType) {
      case 'gold':
        return 'bg-[#FFB800]/10';
      case 'coral':
        return 'bg-[#FF7F6B]/10';
      case 'teal':
        return 'bg-[#4A6670]/10';
      default:
        return 'bg-gray-100';
    }
  };

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-md p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-display font-bold text-[#1C1C28]">AI Market Insights</h2>
        <button 
          onClick={handleGenerateInsights}
          disabled={generateInsightsMutation.isPending}
          className="flex items-center text-[#2D2D3A] hover:text-[#1C1C28] disabled:opacity-70"
        >
          {generateInsightsMutation.isPending ? (
            <Loader2Icon className="h-5 w-5 animate-spin" />
          ) : (
            <RefreshCwIcon className="h-5 w-5" />
          )}
          <span className="ml-2 text-sm">Refresh</span>
        </button>
      </div>
      
      <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
        <button
          className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
            selectedCategory === null 
              ? 'bg-[#1C1C28] text-white' 
              : 'bg-[#F5F5F5] text-[#2D2D3A] hover:bg-gray-200'
          }`}
          onClick={() => setSelectedCategory(null)}
        >
          All Categories
        </button>
        {categories.map((category) => (
          <button
            key={category}
            className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
              selectedCategory === category 
                ? 'bg-[#1C1C28] text-white' 
                : 'bg-[#F5F5F5] text-[#2D2D3A] hover:bg-gray-200'
            }`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>
      
      {generateInsightsMutation.isPending && (
        <div className="py-12 flex flex-col items-center justify-center">
          <Loader2Icon className="h-10 w-10 text-[#FFB800] animate-spin mb-4" />
          <p className="text-[#2D2D3A]">Analyzing market trends...</p>
        </div>
      )}

      {generateInsightsMutation.isError && (
        <div className="py-6 text-center">
          <p className="text-red-500 mb-4">Failed to retrieve market insights</p>
          <button
            onClick={handleGenerateInsights}
            className="px-4 py-2 bg-[#1C1C28] text-white rounded-lg hover:bg-[#2D2D3A] transition-all"
          >
            Try Again
          </button>
        </div>
      )}

      {generateInsightsMutation.isSuccess && generateInsightsMutation.data && (
        <>
          <div className="space-y-4">
            {generateInsightsMutation.data.map((insight: MarketInsightAI, index: number) => (
              <motion.div 
                key={index}
                className="flex items-start"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className={`${getBgColor(insight.colorType)} p-2 rounded-lg mr-3 mt-1`}>
                  {getIcon(insight.iconType)}
                </div>
                <div>
                  <div className="flex items-center">
                    <p className="text-[#1C1C28] text-sm font-medium">{insight.title}</p>
                    {insight.changePercentage !== undefined && (
                      <span className={`ml-2 text-xs font-medium ${
                        insight.changePercentage > 0 ? 'text-green-500' : 
                        insight.changePercentage < 0 ? 'text-red-500' : 
                        'text-[#2D2D3A]'
                      }`}>
                        {insight.changePercentage > 0 ? '+' : ''}{insight.changePercentage}%
                      </span>
                    )}
                  </div>
                  <p className="text-[#2D2D3A] text-xs mt-0.5">{insight.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
          
          {lastUpdated && (
            <p className="text-xs text-[#2D2D3A] mt-6 text-right">
              Last updated: {lastUpdated.toLocaleString()}
            </p>
          )}
        </>
      )}
      
      <div className="mt-6">
        <button className="w-full py-2 bg-[#F5F5F5] border border-gray-300 rounded-lg hover:bg-[#E5E5E5] transition-all text-[#1C1C28] font-medium">
          View Full Market Report
        </button>
      </div>
    </motion.div>
  );
}