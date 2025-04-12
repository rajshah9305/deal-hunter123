import { MarketInsight } from "@/lib/types";
import { motion } from "framer-motion";
import { TrendingDownIcon, TrendingUpIcon, InfoIcon } from "lucide-react";

interface MarketInsightsProps {
  insights: MarketInsight[];
}

export default function MarketInsights({ insights }: MarketInsightsProps) {
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
      <h2 className="text-lg font-display font-bold text-[#1C1C28] mb-4">Market Insights</h2>
      
      <div className="space-y-4">
        {insights.map((insight, index) => (
          <motion.div 
            key={insight.id}
            className="flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className={`${getBgColor(insight.colorType)} p-2 rounded-lg mr-3`}>
              {getIcon(insight.iconType)}
            </div>
            <div>
              <p className="text-[#1C1C28] text-sm font-medium">{insight.title}</p>
              <p className="text-[#2D2D3A] text-xs mt-0.5">{insight.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-6">
        <button className="w-full py-2 bg-[#F5F5F5] border border-gray-300 rounded-lg hover:bg-[#E5E5E5] transition-all text-[#1C1C28] font-medium">
          View Full Report
        </button>
      </div>
    </motion.div>
  );
}
