import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StatCard from "@/components/dashboard/StatCard";
import DealCard from "@/components/dashboard/DealCard";
import PriceChart from "@/components/dashboard/PriceChart";
import MarketInsights from "@/components/dashboard/MarketInsights";
import QuickActions from "@/components/dashboard/QuickActions";
import InventorySummary from "@/components/dashboard/InventorySummary";
import DealAnalyzer from "@/components/dashboard/DealAnalyzer";
import AIMarketInsights from "@/components/dashboard/AIMarketInsights";
import PricePrediction from "@/components/dashboard/PricePrediction";
import { Deal, Inventory, MarketInsight, PriceHistory, Stat, User } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Dashboard() {
  // Fetch user data
  const { data: user, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: ['/api/auth/user']
  });

  // Fetch stats for the dashboard
  const { data: stats, isLoading: isLoadingStats } = useQuery<Stat[]>({
    queryKey: ['/api/stats/user/1']
  });

  // Fetch deals for the dashboard
  const { data: deals, isLoading: isLoadingDeals } = useQuery<Deal[]>({
    queryKey: ['/api/deals/user/1']
  });

  // Fetch inventory data
  const { data: inventory, isLoading: isLoadingInventory } = useQuery<Inventory[]>({
    queryKey: ['/api/inventory/user/1']
  });

  // Fetch market insights
  const { data: marketInsights, isLoading: isLoadingInsights } = useQuery<MarketInsight[]>({
    queryKey: ['/api/market-insights']
  });

  // Fetch price history data
  const { data: priceHistory, isLoading: isLoadingPriceHistory } = useQuery<PriceHistory[]>({
    queryKey: ['/api/price-history/nike-air-jordan-1-retro']
  });

  return (
    <div className="min-h-screen flex flex-col bg-warmGrey text-navy font-sans">
      {/* Navbar */}
      <Navbar user={user} />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-navy">
            {isLoadingUser ? (
              <Skeleton className="h-10 w-64" />
            ) : (
              `Welcome back, ${user?.fullName?.split(' ')[0] || 'User'}`
            )}
          </h1>
          <p className="text-navy-light mt-1">
            {isLoadingStats ? (
              <Skeleton className="h-6 w-80" />
            ) : (
              "Your deal performance is up 12% from last week."
            )}
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isLoadingStats ? (
            Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))
          ) : (
            stats?.map((stat) => (
              <StatCard key={stat.id} stat={stat} />
            ))
          )}
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Deal Opportunities & AI Tools */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs for switching between Deal Opportunities and AI Tools */}
            <Tabs defaultValue="deals" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="deals">Deal Opportunities</TabsTrigger>
                <TabsTrigger value="ai-tools">AI Tools</TabsTrigger>
              </TabsList>
              
              <TabsContent value="deals" className="space-y-6">
                {/* Section Header */}
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-display font-bold text-navy">Deal Opportunities</h2>
                    <p className="text-navy-light text-sm">AI-powered recommendations based on your success patterns</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1.5 bg-warmGrey border border-gray-300 rounded-lg hover:bg-warmGrey-dark transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-navy" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button className="px-3 py-1.5 bg-navy text-white rounded-lg hover:bg-navy-light transition-all">
                      View All
                    </button>
                  </div>
                </div>

                {/* Deal Cards */}
                <div className="space-y-4">
                  {isLoadingDeals ? (
                    Array(3).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-48 rounded-xl" />
                    ))
                  ) : (
                    deals?.map((deal) => (
                      <DealCard key={deal.id} deal={deal} />
                    ))
                  )}
                </div>

                {/* Price Analysis */}
                <div className="flex justify-between items-center pt-6">
                  <div>
                    <h2 className="text-xl font-display font-bold text-navy">Price Analysis</h2>
                    <p className="text-navy-light text-sm">AI-powered pricing predictions for your active deals</p>
                  </div>
                  <div>
                    <select className="bg-white border border-gray-300 text-navy text-sm rounded-lg focus:ring-gold focus:border-gold block p-2">
                      <option selected>Last 30 days</option>
                      <option>Last 90 days</option>
                      <option>Last 6 months</option>
                      <option>Last year</option>
                    </select>
                  </div>
                </div>

                {/* Price Chart */}
                {isLoadingPriceHistory ? (
                  <Skeleton className="h-96 rounded-xl" />
                ) : (
                  <PriceChart priceHistory={priceHistory || []} />
                )}
              </TabsContent>
              
              <TabsContent value="ai-tools" className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-display font-bold text-navy">AI Tools</h2>
                    <p className="text-navy-light text-sm">Powerful AI tools to maximize your profits</p>
                  </div>
                </div>
                
                {/* AI Deal Analyzer */}
                <DealAnalyzer />
                
                {/* AI Price Prediction */}
                <PricePrediction />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Market Insights vs Regular Insights Tabs */}
            <Tabs defaultValue="ai-insights" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
                <TabsTrigger value="regular-insights">Regular Insights</TabsTrigger>
              </TabsList>
              
              <TabsContent value="ai-insights">
                <AIMarketInsights />
              </TabsContent>
              
              <TabsContent value="regular-insights">
                {isLoadingInsights ? (
                  <Skeleton className="h-64 rounded-xl" />
                ) : (
                  <MarketInsights insights={marketInsights || []} />
                )}
              </TabsContent>
            </Tabs>

            {/* Quick Actions */}
            <QuickActions />

            {/* Inventory Summary */}
            {isLoadingInventory ? (
              <Skeleton className="h-80 rounded-xl" />
            ) : (
              <InventorySummary inventory={inventory || []} />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
