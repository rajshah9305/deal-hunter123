import { Inventory } from "@/lib/types";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { MoreVerticalIcon } from "lucide-react";

interface InventorySummaryProps {
  inventory: Inventory[];
}

export default function InventorySummary({ inventory }: InventorySummaryProps) {
  const [totalValue, setTotalValue] = useState(0);
  const [totalMarketValue, setTotalMarketValue] = useState(0);

  useEffect(() => {
    if (inventory && inventory.length > 0) {
      const inventoryValue = inventory.reduce((sum, item) => sum + item.value, 0);
      const marketValue = inventory.reduce((sum, item) => sum + (item.marketValue || 0), 0);
      
      setTotalValue(inventoryValue);
      setTotalMarketValue(marketValue);
    }
  }, [inventory]);

  // Helper to get the appropriate color for each category
  const getCategoryColor = (category: string): string => {
    switch (category.toLowerCase()) {
      case 'sneakers':
        return 'bg-[#FFB800]/20 text-[#FFB800]';
      case 'electronics':
        return 'bg-[#4A6670]/20 text-[#4A6670]';
      case 'home goods':
        return 'bg-[#FF7F6B]/20 text-[#FF7F6B]';
      case 'apparel':
        return 'bg-[#E5E5E5] text-[#1C1C28]';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-md p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-display font-bold text-[#1C1C28]">Inventory Summary</h2>
        <button className="text-[#1C1C28] hover:text-[#FFB800] transition-all">
          <MoreVerticalIcon className="h-5 w-5" />
        </button>
      </div>
      
      <div className="space-y-3">
        {inventory.map((item, index) => (
          <motion.div 
            key={item.id}
            className="flex justify-between items-center"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: 0.1 + index * 0.05 }}
          >
            <div className="flex items-center">
              <div className={`h-8 w-8 rounded-full ${getCategoryColor(item.category)} flex items-center justify-center mr-3`}>
                <span className="text-xs font-bold">{item.count}</span>
              </div>
              <span className="text-[#1C1C28] text-sm font-medium">{item.category}</span>
            </div>
            <span className="text-[#1C1C28] text-sm font-medium">${item.value.toLocaleString()}</span>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center text-[#1C1C28]">
          <span className="font-medium">Total Inventory Value</span>
          <span className="font-bold">${totalValue.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center mt-2 text-[#2D2D3A] text-sm">
          <span>Estimated Market Value</span>
          <span className="text-green-500">${totalMarketValue.toLocaleString()}</span>
        </div>
      </div>
      
      <div className="mt-4">
        <button className="w-full py-2 bg-[#1C1C28] text-white rounded-lg hover:bg-[#2D2D3A] transition-all font-medium">
          Manage Inventory
        </button>
      </div>
    </motion.div>
  );
}
