import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DealAnalyzer from "@/components/dashboard/DealAnalyzer";
import AIMarketInsights from "@/components/dashboard/AIMarketInsights";
import PricePrediction from "@/components/dashboard/PricePrediction";
import InventoryManagement from "@/components/dashboard/InventoryManagement";
import NotificationCenter from "@/components/dashboard/NotificationCenter";
import CompetitorPriceTracker from "@/components/dashboard/CompetitorPriceTracker";
import ListingGenerator from "@/components/dashboard/ListingGenerator";
import { 
  BarChart, LineChart, TrendingUp, Inbox, ShoppingBag, 
  Settings, Bell, Search, ChevronDown, Menu, Star, Clock,
  ArrowUpDown, FileEdit, BellRing, Activity, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("analyzer");
  const unreadNotifications = 3; // This would come from an API call in a real app
  
  const renderTabContent = () => {
    switch (activeTab) {
      case "analyzer":
        return <DealAnalyzer />;
      case "insights":
        return <AIMarketInsights />;
      case "prediction":
        return <PricePrediction />;
      case "inventory":
        return <InventoryManagement />;
      case "notifications":
        return <NotificationCenter />;
      case "competitor":
        return <CompetitorPriceTracker />;
      case "listing":
        return <ListingGenerator />;
      default:
        return <DealAnalyzer />;
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="flex h-16 items-center px-4 sm:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
              <nav className="mt-10 flex flex-col gap-4">
                <Button variant="ghost" className="justify-start">
                  <BarChart className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
                <Button variant="ghost" className="justify-start">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  My Deals
                </Button>
                <Button 
                  variant="ghost" 
                  className="justify-start"
                  onClick={() => setActiveTab("inventory")}
                >
                  <Inbox className="mr-2 h-4 w-4" />
                  Inventory
                </Button>
                <Button 
                  variant="ghost" 
                  className="justify-start"
                  onClick={() => setActiveTab("notifications")}
                >
                  <BellRing className="mr-2 h-4 w-4" />
                  Notifications
                  {unreadNotifications > 0 && (
                    <Badge className="ml-auto" variant="secondary">{unreadNotifications}</Badge>
                  )}
                </Button>
                <Button variant="ghost" className="justify-start">
                  <Activity className="mr-2 h-4 w-4" />
                  Stats
                </Button>
                <Button variant="ghost" className="justify-start">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2 font-semibold">
            <Star className="h-6 w-6 text-primary" />
            <span className="text-lg">FlipAI</span>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <form className="relative hidden md:block">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search deals..."
                className="w-[200px] lg:w-[300px] pl-8"
              />
            </form>
            <Button 
              variant="outline" 
              size="icon"
              className="relative"
              onClick={() => setActiveTab("notifications")}
            >
              <Bell className="h-4 w-4" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white grid place-items-center">
                  {unreadNotifications}
                </span>
              )}
              <span className="sr-only">Notifications</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt="User" />
                    <AvatarFallback>AS</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Subscription</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1">
        {/* Sidebar (Hidden on Mobile) */}
        <div className="hidden border-r bg-muted/40 md:block md:w-64 lg:w-72">
          <div className="flex h-full flex-col gap-2 p-4">
            <Button variant="ghost" className="justify-start">
              <BarChart className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            <Button variant="ghost" className="justify-start">
              <ShoppingBag className="mr-2 h-4 w-4" />
              My Deals
            </Button>
            <Button 
              variant={activeTab === "inventory" ? "default" : "ghost"} 
              className="justify-start"
              onClick={() => setActiveTab("inventory")}
            >
              <Inbox className="mr-2 h-4 w-4" />
              Inventory
            </Button>
            <Button 
              variant={activeTab === "notifications" ? "default" : "ghost"} 
              className="justify-between"
              onClick={() => setActiveTab("notifications")}
            >
              <div className="flex items-center">
                <BellRing className="mr-2 h-4 w-4" />
                Notifications
              </div>
              {unreadNotifications > 0 && (
                <Badge variant="secondary">{unreadNotifications}</Badge>
              )}
            </Button>
            <Button variant="ghost" className="justify-start">
              <Activity className="mr-2 h-4 w-4" />
              Stats
            </Button>
            
            <Separator className="my-2" />
            <div className="px-4 py-2">
              <h3 className="text-sm font-medium">AI Tools</h3>
            </div>
            <Button 
              variant={activeTab === "analyzer" ? "default" : "ghost"} 
              className="justify-start"
              onClick={() => setActiveTab("analyzer")}
            >
              <BarChart className="mr-2 h-4 w-4" />
              Deal Analyzer
            </Button>
            <Button 
              variant={activeTab === "insights" ? "default" : "ghost"} 
              className="justify-start"
              onClick={() => setActiveTab("insights")}
            >
              <LineChart className="mr-2 h-4 w-4" />
              Market Insights
            </Button>
            <Button 
              variant={activeTab === "prediction" ? "default" : "ghost"} 
              className="justify-start"
              onClick={() => setActiveTab("prediction")}
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Price Prediction
            </Button>
            <Button 
              variant={activeTab === "competitor" ? "default" : "ghost"} 
              className="justify-start"
              onClick={() => setActiveTab("competitor")}
            >
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Competitor Tracker
            </Button>
            <Button 
              variant={activeTab === "listing" ? "default" : "ghost"} 
              className="justify-start"
              onClick={() => setActiveTab("listing")}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Listing Generator
            </Button>
            
            <Separator className="my-2" />
            <Button variant="ghost" className="justify-start">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 overflow-auto">
          <main className="container mx-auto p-4 md:p-6 lg:p-8">
            {/* Mobile Tabs */}
            <div className="block md:hidden mb-6">
              <div className="overflow-x-auto pb-2">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="inline-flex w-auto h-9 items-center justify-start rounded-lg bg-muted p-1 text-muted-foreground">
                    <TabsTrigger 
                      value="analyzer" 
                      className="rounded-md px-3 py-1 text-xs data-[state=active]:bg-background data-[state=active]:text-foreground"
                    >
                      Analyzer
                    </TabsTrigger>
                    <TabsTrigger 
                      value="insights" 
                      className="rounded-md px-3 py-1 text-xs data-[state=active]:bg-background data-[state=active]:text-foreground"
                    >
                      Insights
                    </TabsTrigger>
                    <TabsTrigger 
                      value="prediction" 
                      className="rounded-md px-3 py-1 text-xs data-[state=active]:bg-background data-[state=active]:text-foreground"
                    >
                      Prediction
                    </TabsTrigger>
                    <TabsTrigger 
                      value="inventory" 
                      className="rounded-md px-3 py-1 text-xs data-[state=active]:bg-background data-[state=active]:text-foreground"
                    >
                      Inventory
                    </TabsTrigger>
                    <TabsTrigger 
                      value="notifications" 
                      className="rounded-md px-3 py-1 text-xs data-[state=active]:bg-background data-[state=active]:text-foreground"
                    >
                      Notifications
                    </TabsTrigger>
                    <TabsTrigger 
                      value="competitor" 
                      className="rounded-md px-3 py-1 text-xs data-[state=active]:bg-background data-[state=active]:text-foreground"
                    >
                      Competitor
                    </TabsTrigger>
                    <TabsTrigger 
                      value="listing" 
                      className="rounded-md px-3 py-1 text-xs data-[state=active]:bg-background data-[state=active]:text-foreground"
                    >
                      Listing
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="space-y-8">
              {renderTabContent()}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}