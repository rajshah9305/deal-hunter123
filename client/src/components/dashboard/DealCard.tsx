import { Deal } from "@/lib/types";
import { motion } from "framer-motion";

interface DealCardProps {
  deal: Deal;
}

export default function DealCard({ deal }: DealCardProps) {
  return (
    <motion.div 
      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-4 cursor-pointer"
      whileHover={{ scale: 1.01 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/4 mb-4 md:mb-0">
          <img 
            src={deal.imageUrl} 
            alt={deal.title} 
            className="w-full h-32 object-cover rounded-lg" 
          />
        </div>
        <div className="md:w-3/4 md:pl-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-2">
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{deal.matchScore}% Match</span>
                {deal.isHotDeal && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Hot Deal</span>
                )}
              </div>
              <h3 className="text-lg font-bold text-[#1C1C28] mt-1">{deal.title}</h3>
              <p className="text-[#2D2D3A] text-sm">Found on: {deal.source} • Posted {deal.postedTime}</p>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center">
                <span className="line-through text-[#2D2D3A] text-sm mr-2">${deal.originalPrice}</span>
                <span className="text-[#1C1C28] font-bold text-lg">${deal.currentPrice}</span>
              </div>
              <div className="mt-1 flex items-center text-green-500 font-medium text-sm">
                <span>Est. profit: ${deal.estimatedProfit}</span>
              </div>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex flex-wrap gap-2">
              <div className="bg-[#F5F5F5] rounded-lg px-3 py-1 text-xs">
                <span className="font-medium">Avg. Resell: </span>
                <span>${deal.avgResellLow}-${deal.avgResellHigh}</span>
              </div>
              <div className="bg-[#F5F5F5] rounded-lg px-3 py-1 text-xs">
                <span className="font-medium">Condition: </span>
                <span>{deal.condition}</span>
              </div>
              <div className="bg-[#F5F5F5] rounded-lg px-3 py-1 text-xs">
                <span className="font-medium">Sell Time: </span>
                <span>{deal.sellTimeEstimate}</span>
              </div>
              <div className="bg-[#F5F5F5] rounded-lg px-3 py-1 text-xs">
                <span className="font-medium">Demand: </span>
                <span className={`font-medium ${deal.demand === 'High' ? 'text-green-500' : deal.demand === 'Medium' ? 'text-green-500' : 'text-yellow-500'}`}>
                  {deal.demand}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <div className="flex space-x-2">
              <button className="px-3 py-1 border border-[#1C1C28] text-[#1C1C28] rounded-lg hover:bg-[#1C1C28] hover:text-white transition-all text-sm font-medium">
                Contact Seller
              </button>
              <button className="px-3 py-1 border border-[#1C1C28] text-[#1C1C28] rounded-lg hover:bg-[#1C1C28] hover:text-white transition-all text-sm font-medium">
                Analyze
              </button>
            </div>
            <button className="text-[#1C1C28] hover:text-[#FFB800] transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
