import { useState } from "react";
import { motion } from "framer-motion";
import { usePredictPriceTrend, PricePrediction as PricePredictionType } from "@/hooks/use-ai";
import { Loader2Icon, XCircle, Sparkles, TrendingUpIcon, TrendingDownIcon, MinusIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  TooltipProps
} from "recharts";

// Using PricePredictionType imported from use-ai.ts

export default function PricePrediction() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    currentPrice: "",
  });
  const [showForm, setShowForm] = useState(false);

  const predictPriceTrendMutation = usePredictPriceTrend();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate input
    if (!formData.title || !formData.currentPrice) {
      toast({
        title: "Missing information",
        description: "Please provide at least the item title and current price.",
        variant: "destructive",
      });
      return;
    }

    // Run prediction
    predictPriceTrendMutation.mutate(
      {
        title: formData.title,
        category: formData.category || undefined,
        currentPrice: parseFloat(formData.currentPrice),
        historicalPrices: [
          { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), price: parseFloat(formData.currentPrice) * 0.9 },
          { date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), price: parseFloat(formData.currentPrice) * 0.95 },
          { date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), price: parseFloat(formData.currentPrice) * 0.98 },
          { date: new Date().toISOString(), price: parseFloat(formData.currentPrice) }
        ]
      },
      {
        onSuccess: (data) => {
          toast({
            title: "Prediction complete",
            description: "Price trend prediction has been completed successfully.",
          });
        },
        onError: (error) => {
          toast({
            title: "Prediction failed",
            description: "Could not predict price trends. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const formatChartData = (prediction: PricePredictionType) => {
    if (!prediction) return [];

    // Start with the historical data
    const today = new Date();
    const historicalData = [
      { 
        day: -30, 
        date: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        price: parseFloat(formData.currentPrice) * 0.9, 
        isPrediction: false 
      },
      { 
        day: -20, 
        date: new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        price: parseFloat(formData.currentPrice) * 0.95, 
        isPrediction: false 
      },
      { 
        day: -10, 
        date: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        price: parseFloat(formData.currentPrice) * 0.98, 
        isPrediction: false 
      },
      { 
        day: 0, 
        date: today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        price: parseFloat(formData.currentPrice), 
        isPrediction: false 
      },
    ];

    // Add the predictions
    const predictionData = prediction.futurePrices.map((p: { daysFromNow: number; predictedPrice: number; trend: "up" | "down" | "stable" }) => ({
      day: p.daysFromNow,
      date: new Date(today.getTime() + p.daysFromNow * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: p.predictedPrice,
      trend: p.trend,
      isPrediction: true
    }));

    return [...historicalData, ...predictionData];
  };

  const getTrendIcon = (trend: string) => {
    switch(trend) {
      case 'up':
        return <TrendingUpIcon className="h-5 w-5 text-green-500" />;
      case 'down':
        return <TrendingDownIcon className="h-5 w-5 text-red-500" />;
      default:
        return <MinusIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getConfidenceLevelColor = (level: number) => {
    if (level >= 75) return 'text-green-500';
    if (level >= 50) return 'text-yellow-600';
    return 'text-red-500';
  };

  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border border-gray-200 rounded shadow text-sm">
          <p className="font-bold">{data.date}</p>
          <p className="text-[#1C1C28]">Price: ${data.price.toFixed(2)}</p>
          {data.isPrediction && (
            <p className="text-xs italic">Predicted</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      className="bg-white rounded-xl shadow-md p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Sparkles className="h-6 w-6 text-[#FFB800] mr-2" />
          <h2 className="text-lg font-display font-bold text-[#1C1C28]">AI Price Prediction</h2>
        </div>
        {!showForm && !predictPriceTrendMutation.data && (
          <button
            className="px-4 py-2 bg-[#FFB800] hover:bg-[#E6A600] text-[#1C1C28] font-medium rounded-lg transition-all"
            onClick={() => setShowForm(true)}
          >
            Predict Price Trend
          </button>
        )}
        {showForm && !predictPriceTrendMutation.data && (
          <button
            className="text-[#2D2D3A] hover:text-[#1C1C28]"
            onClick={() => setShowForm(false)}
          >
            <XCircle className="h-6 w-6" />
          </button>
        )}
      </div>

      {!showForm && !predictPriceTrendMutation.data && (
        <div className="text-center py-10">
          <p className="text-[#2D2D3A] mb-6">
            Our AI can predict price trends to help you determine the best time to buy or sell.
            <br />
            Click "Predict Price Trend" to get started.
          </p>
          <div className="flex justify-center">
            <button
              className="px-6 py-3 bg-[#FFB800] hover:bg-[#E6A600] text-[#1C1C28] font-medium rounded-lg transition-all"
              onClick={() => setShowForm(true)}
            >
              Predict Price Trend
            </button>
          </div>
        </div>
      )}

      {showForm && !predictPriceTrendMutation.data && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-[#2D2D3A] mb-1">
                Item Title*
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB800]"
                placeholder="e.g. Nike Air Jordan 1 Retro"
                required
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-[#2D2D3A] mb-1">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB800]"
              >
                <option value="">Select Category</option>
                <option value="Electronics">Electronics</option>
                <option value="Sneakers">Sneakers</option>
                <option value="Apparel">Apparel</option>
                <option value="Home Goods">Home Goods</option>
                <option value="Collectibles">Collectibles</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="currentPrice" className="block text-sm font-medium text-[#2D2D3A] mb-1">
              Current Price ($)*
            </label>
            <input
              id="currentPrice"
              name="currentPrice"
              type="number"
              min="0"
              step="0.01"
              value={formData.currentPrice}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB800]"
              placeholder="0.00"
              required
            />
          </div>

          <div className="pt-4 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-gray-300 text-[#2D2D3A] rounded-lg hover:bg-gray-100 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={predictPriceTrendMutation.isPending}
              className="px-4 py-2 bg-[#FFB800] hover:bg-[#E6A600] text-[#1C1C28] font-medium rounded-lg transition-all flex items-center disabled:opacity-70"
            >
              {predictPriceTrendMutation.isPending && (
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              )}
              {predictPriceTrendMutation.isPending ? "Predicting..." : "Predict Price Trend"}
            </button>
          </div>
        </motion.form>
      )}

      {predictPriceTrendMutation.isPending && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2Icon className="h-10 w-10 text-[#FFB800] animate-spin mb-4" />
          <p className="text-[#2D2D3A] text-center">
            Analyzing market data with AI...
            <br />
            <span className="text-sm">This may take a few moments</span>
          </p>
        </div>
      )}

      {predictPriceTrendMutation.isError && (
        <div className="text-center py-6 text-red-500">
          <XCircle className="h-10 w-10 mx-auto mb-2" />
          <p>Price prediction failed. Please try again.</p>
          <button
            onClick={() => predictPriceTrendMutation.reset()}
            className="mt-4 px-4 py-2 bg-[#1C1C28] text-white rounded-lg hover:bg-[#2D2D3A] transition-all"
          >
            Try Again
          </button>
        </div>
      )}

      {predictPriceTrendMutation.isSuccess && predictPriceTrendMutation.data && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <div className="flex justify-between mb-4">
            <h3 className="font-bold text-[#1C1C28]">{formData.title}</h3>
            <div className="flex items-center">
              {getTrendIcon(predictPriceTrendMutation.data.overallTrend)}
              <span className={`ml-1 text-sm font-medium ${
                predictPriceTrendMutation.data.overallTrend === 'up' ? 'text-green-500' : 
                predictPriceTrendMutation.data.overallTrend === 'down' ? 'text-red-500' : 
                'text-gray-500'
              }`}>
                {predictPriceTrendMutation.data.overallTrend === 'up' ? 'Upward Trend' : 
                 predictPriceTrendMutation.data.overallTrend === 'down' ? 'Downward Trend' : 
                 'Stable Trend'}
              </span>
            </div>
          </div>
          
          <div className="h-80 w-full mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={formatChartData(predictPriceTrendMutation.data)}
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
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine x={0} stroke="rgba(75, 85, 99, 0.5)" strokeDasharray="3 3" />
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
                          stroke={payload.trend === 'up' ? '#10B981' : 
                                   payload.trend === 'down' ? '#EF4444' : 
                                   '#6B7280'} 
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
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {predictPriceTrendMutation.data.futurePrices.map((prediction, index) => (
              <div key={index} className="bg-[#F5F5F5] rounded-lg p-3">
                <p className="text-sm text-[#2D2D3A] font-medium">
                  {prediction.daysFromNow === 7 ? '7 days' : 
                   prediction.daysFromNow === 14 ? '14 days' : 
                   '30 days'}
                </p>
                <div className="flex items-center mt-1">
                  <p className={`text-xl font-bold ${
                    prediction.trend === 'up' ? 'text-green-500' : 
                    prediction.trend === 'down' ? 'text-red-500' : 
                    'text-[#1C1C28]'
                  }`}>
                    ${prediction.predictedPrice.toFixed(2)}
                  </p>
                  {getTrendIcon(prediction.trend)}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <h4 className="font-medium text-[#1C1C28]">AI Confidence Level</h4>
              <span className={`ml-2 text-sm font-medium ${getConfidenceLevelColor(predictPriceTrendMutation.data.confidenceLevel)}`}>
                {predictPriceTrendMutation.data.confidenceLevel}%
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${
                  predictPriceTrendMutation.data.confidenceLevel >= 75 ? 'bg-green-500' : 
                  predictPriceTrendMutation.data.confidenceLevel >= 50 ? 'bg-yellow-500' : 
                  'bg-red-500'
                }`}
                style={{ width: `${predictPriceTrendMutation.data.confidenceLevel}%` }}
              />
            </div>
          </div>
          
          <div className="mb-6">
            <h4 className="font-medium text-[#1C1C28] mb-2">Analysis</h4>
            <p className="text-[#2D2D3A] text-sm">{predictPriceTrendMutation.data.reasoning}</p>
          </div>
          
          <div className="flex justify-end">
            <button
              className="px-4 py-2 bg-[#1C1C28] text-white rounded-lg hover:bg-[#2D2D3A] transition-all"
              onClick={() => {
                predictPriceTrendMutation.reset();
                setFormData({
                  title: "",
                  category: "",
                  currentPrice: "",
                });
              }}
            >
              Predict Another Item
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}