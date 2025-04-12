import { useState } from "react";
import { motion } from "framer-motion";
import { useAnalyzeDeal, DealAnalysis } from "@/hooks/use-ai";
import { Loader2Icon, Sparkles, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DealAnalyzer() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    originalPrice: "",
    currentPrice: "",
    condition: "New",
    source: "",
  });
  const [showForm, setShowForm] = useState(false);

  const analyzeDealMutation = useAnalyzeDeal();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

    // Run analysis
    analyzeDealMutation.mutate(
      {
        title: formData.title,
        description: formData.description,
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        currentPrice: parseFloat(formData.currentPrice),
        condition: formData.condition,
        source: formData.source,
      },
      {
        onSuccess: (data) => {
          toast({
            title: "Analysis complete",
            description: "Deal analysis has been completed successfully.",
          });
        },
        onError: (error) => {
          toast({
            title: "Analysis failed",
            description: "Could not analyze the deal. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const renderAnalysisResult = () => {
    if (!analyzeDealMutation.data) return null;

    const result = analyzeDealMutation.data;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 bg-white rounded-xl p-6 shadow-md"
      >
        <div className="flex justify-between mb-4">
          <h3 className="text-lg font-bold text-[#1C1C28]">Analysis Results</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            result.matchScore >= 75 ? "bg-green-100 text-green-800" : 
            result.matchScore >= 50 ? "bg-yellow-100 text-yellow-800" : 
            "bg-red-100 text-red-800"
          }`}>
            {result.matchScore}% Match
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-[#F5F5F5] rounded-lg p-3">
            <p className="text-sm text-[#2D2D3A] font-medium">Estimated Profit</p>
            <p className="text-xl font-bold text-green-600">${result.estimatedProfit}</p>
          </div>
          <div className="bg-[#F5F5F5] rounded-lg p-3">
            <p className="text-sm text-[#2D2D3A] font-medium">Resell Range</p>
            <p className="text-xl font-bold text-[#1C1C28]">${result.avgResellLow} - ${result.avgResellHigh}</p>
          </div>
          <div className="bg-[#F5F5F5] rounded-lg p-3">
            <p className="text-sm text-[#2D2D3A] font-medium">Estimated Sell Time</p>
            <p className="text-xl font-bold text-[#1C1C28]">{result.sellTimeEstimate}</p>
          </div>
          <div className="bg-[#F5F5F5] rounded-lg p-3">
            <p className="text-sm text-[#2D2D3A] font-medium">Market Demand</p>
            <p className={`text-xl font-bold ${
              result.demand === 'High' ? 'text-green-600' : 
              result.demand === 'Medium' ? 'text-yellow-600' : 
              'text-red-600'
            }`}>
              {result.demand}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <h4 className="font-medium text-[#1C1C28] mb-2">Market Analysis</h4>
          <p className="text-[#2D2D3A] text-sm">{result.analysis}</p>
        </div>

        <div>
          <h4 className="font-medium text-[#1C1C28] mb-2">Selling Tips</h4>
          <ul className="list-disc pl-5 text-sm text-[#2D2D3A] space-y-1">
            {result.sellingTips.map((tip: string, index: number) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            className="px-4 py-2 bg-[#1C1C28] text-white rounded-lg hover:bg-[#2D2D3A] transition-all"
            onClick={() => {
              analyzeDealMutation.reset();
              setFormData({
                title: "",
                description: "",
                originalPrice: "",
                currentPrice: "",
                condition: "New",
                source: "",
              });
            }}
          >
            Analyze Another Deal
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      className="bg-white rounded-xl shadow-md p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Sparkles className="h-6 w-6 text-[#FFB800] mr-2" />
          <h2 className="text-lg font-display font-bold text-[#1C1C28]">AI Deal Analyzer</h2>
        </div>
        {!showForm && !analyzeDealMutation.data && (
          <button
            className="px-4 py-2 bg-[#FFB800] hover:bg-[#E6A600] text-[#1C1C28] font-medium rounded-lg transition-all"
            onClick={() => setShowForm(true)}
          >
            Analyze New Deal
          </button>
        )}
        {showForm && !analyzeDealMutation.data && (
          <button
            className="text-[#2D2D3A] hover:text-[#1C1C28]"
            onClick={() => setShowForm(false)}
          >
            <XCircle className="h-6 w-6" />
          </button>
        )}
      </div>

      {!showForm && !analyzeDealMutation.data && (
        <div className="text-center py-10">
          <p className="text-[#2D2D3A] mb-6">
            Our AI can analyze potential deals to estimate profit, demand, and selling time.
            <br />
            Click "Analyze New Deal" to get started.
          </p>
          <div className="flex justify-center">
            <button
              className="px-6 py-3 bg-[#FFB800] hover:bg-[#E6A600] text-[#1C1C28] font-medium rounded-lg transition-all"
              onClick={() => setShowForm(true)}
            >
              Analyze New Deal
            </button>
          </div>
        </div>
      )}

      {showForm && !analyzeDealMutation.data && (
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
                placeholder="e.g. iPhone 13 Pro Max 256GB"
                required
              />
            </div>
            <div>
              <label htmlFor="source" className="block text-sm font-medium text-[#2D2D3A] mb-1">
                Source
              </label>
              <input
                id="source"
                name="source"
                type="text"
                value={formData.source}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB800]"
                placeholder="e.g. Facebook Marketplace, eBay"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-[#2D2D3A] mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB800]"
              placeholder="Briefly describe the item..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="originalPrice" className="block text-sm font-medium text-[#2D2D3A] mb-1">
                Original Price ($)
              </label>
              <input
                id="originalPrice"
                name="originalPrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.originalPrice}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB800]"
                placeholder="0.00"
              />
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
            <div>
              <label htmlFor="condition" className="block text-sm font-medium text-[#2D2D3A] mb-1">
                Condition
              </label>
              <select
                id="condition"
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB800]"
              >
                <option value="New">New</option>
                <option value="Like New">Like New</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>
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
              disabled={analyzeDealMutation.isPending}
              className="px-4 py-2 bg-[#FFB800] hover:bg-[#E6A600] text-[#1C1C28] font-medium rounded-lg transition-all flex items-center disabled:opacity-70"
            >
              {analyzeDealMutation.isPending && (
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              )}
              {analyzeDealMutation.isPending ? "Analyzing..." : "Analyze Deal"}
            </button>
          </div>
        </motion.form>
      )}

      {analyzeDealMutation.isPending && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2Icon className="h-10 w-10 text-[#FFB800] animate-spin mb-4" />
          <p className="text-[#2D2D3A] text-center">
            Analyzing deal with AI...
            <br />
            <span className="text-sm">This may take a few moments</span>
          </p>
        </div>
      )}

      {analyzeDealMutation.isError && (
        <div className="text-center py-6 text-red-500">
          <XCircle className="h-10 w-10 mx-auto mb-2" />
          <p>Analysis failed. Please try again.</p>
          <button
            onClick={() => analyzeDealMutation.reset()}
            className="mt-4 px-4 py-2 bg-[#1C1C28] text-white rounded-lg hover:bg-[#2D2D3A] transition-all"
          >
            Try Again
          </button>
        </div>
      )}

      {renderAnalysisResult()}
    </motion.div>
  );
}