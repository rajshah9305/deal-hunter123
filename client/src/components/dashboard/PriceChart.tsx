import { PriceHistory } from "@/lib/types";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Area,
  ReferenceLine
} from "recharts";

interface PriceChartProps {
  priceHistory: PriceHistory[];
}

export default function PriceChart({ priceHistory }: PriceChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [prediction, setPrediction] = useState<{ date: string; price: number; isPrediction: boolean } | null>(null);
  
  useEffect(() => {
    if (priceHistory && priceHistory.length > 0) {
      // Process the data for the chart
      const processedData = priceHistory.map(point => ({
        date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        price: point.price,
        isPrediction: false
      }));
      
      // Create a prediction point (7 days in the future from the last data point)
      const lastPoint = priceHistory[priceHistory.length - 1];
      if (lastPoint) {
        const lastDate = new Date(lastPoint.date);
        const predictionDate = new Date(lastDate);
        predictionDate.setDate(lastDate.getDate() + 7);
        
        // Calculate a trending price (slightly higher in this example)
        const lastPrice = lastPoint.price;
        const predictedPrice = lastPrice * 1.06; // 6% increase
        
        const predictionPoint = {
          date: predictionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          price: predictedPrice,
          isPrediction: true
        };
        
        setPrediction(predictionPoint);
        setChartData([...processedData, predictionPoint]);
      } else {
        setChartData(processedData);
      }
    }
  }, [priceHistory]);

  // Custom tooltip component for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border border-gray-200 rounded shadow text-sm">
          <p className="font-bold">{label}</p>
          <p className="text-[#FFB800]">Price: ${data.price.toFixed(2)}</p>
          {data.isPrediction && (
            <p className="text-[#FF7F6B] text-xs italic">Predicted</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      className="bg-white p-6 rounded-xl shadow-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <div className="flex justify-between mb-6">
        <div>
          <h3 className="font-bold text-[#1C1C28]">Nike Air Jordan 1 Retro</h3>
          <p className="text-[#2D2D3A] text-sm">Price trend & future prediction</p>
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-1 bg-[#1C1C28] text-xs text-white rounded-lg">
            Market Price
          </button>
          <button className="px-3 py-1 bg-[#F5F5F5] border border-gray-300 text-xs text-[#1C1C28] rounded-lg">
            Your Cost
          </button>
          <button className="px-3 py-1 bg-[#F5F5F5] border border-gray-300 text-xs text-[#1C1C28] rounded-lg">
            Prediction
          </button>
        </div>
      </div>
      
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(209, 213, 219, 0.3)" />
            <XAxis 
              dataKey="date" 
              axisLine={{ stroke: 'rgba(209, 213, 219, 0.5)' }}
              tickLine={false}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              axisLine={{ stroke: 'rgba(209, 213, 219, 0.5)' }}
              tickLine={false}
              tick={{ fontSize: 12 }}
              domain={['dataMin - 20', 'dataMax + 20']}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FFB800" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#FFB800" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area 
              type="monotone" 
              dataKey="price" 
              fill="url(#colorPrice)" 
              stroke="none"
            />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#FFB800" 
              strokeWidth={2}
              dot={(props: any) => {
                const { cx, cy, payload } = props;
                if (payload.isPrediction) {
                  return (
                    <circle 
                      cx={cx} 
                      cy={cy} 
                      r={4} 
                      fill="white" 
                      stroke="#FF7F6B" 
                      strokeWidth={2} 
                    />
                  );
                }
                return (
                  <circle 
                    cx={cx} 
                    cy={cy} 
                    r={4} 
                    fill="#FFB800" 
                    stroke="white" 
                    strokeWidth={2} 
                  />
                );
              }}
              activeDot={{ r: 6, fill: "#FFB800", stroke: "white", strokeWidth: 2 }}
            />
            {/* Reference horizontal lines for cost basis */}
            <ReferenceLine y={180} stroke="rgba(75, 85, 99, 0.5)" strokeDasharray="3 3" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-2 grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-[#2D2D3A] text-xs">Current Market Price</p>
          <p className="text-[#1C1C28] font-bold text-lg">$245</p>
        </div>
        <div className="text-center">
          <p className="text-[#2D2D3A] text-xs">Your Cost Basis</p>
          <p className="text-[#1C1C28] font-bold text-lg">$180</p>
        </div>
        <div className="text-center">
          <p className="text-[#2D2D3A] text-xs">Predicted (7d)</p>
          <p className="text-[#FF7F6B] font-bold text-lg">$260</p>
        </div>
      </div>
    </motion.div>
  );
}
