import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DealAnalyzer from "@/components/dashboard/DealAnalyzer";
import AIMarketInsights from "@/components/dashboard/AIMarketInsights";
import PricePrediction from "@/components/dashboard/PricePrediction";
import { 
  BarChart, LineChart, TrendingUp, Inbox, ShoppingBag, 
  Settings, Bell, Search, ChevronDown, Menu, Star, Clock
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

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("analyzer");
  
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
                <Button variant="ghost" className="justify-start">
                  <Inbox className="mr-2 h-4 w-4" />
                  Inventory
                </Button>
                <Button variant="ghost" className="justify-start">
                  <TrendingUp className="mr-2 h-4 w-4" />
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
            <Button variant="outline" size="icon">
              <Bell className="h-4 w-4" />
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
            <Button variant="ghost" className="justify-start">
              <Inbox className="mr-2 h-4 w-4" />
              Inventory
            </Button>
            <Button variant="ghost" className="justify-start">
              <TrendingUp className="mr-2 h-4 w-4" />
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
            {/* Dashboard Header */}
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h1 className="text-2xl font-semibold">AI Deal Tools</h1>
                <p className="text-muted-foreground">
                  Use AI to analyze deals, predict prices, and track market insights
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="default" className="shadow-sm">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  My Deals
                </Button>
              </div>
            </div>

            {/* Dashboard Tabs (Mobile) */}
            <div className="block md:hidden mb-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="analyzer">Analyzer</TabsTrigger>
                  <TabsTrigger value="insights">Insights</TabsTrigger>
                  <TabsTrigger value="prediction">Prediction</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Dashboard Content */}
            {activeTab === "analyzer" && (
              <div className="space-y-8">
                <DealAnalyzer />
              </div>
            )}

            {activeTab === "insights" && (
              <div className="space-y-8">
                <AIMarketInsights />
              </div>
            )}

            {activeTab === "prediction" && (
              <div className="space-y-8">
                <PricePrediction />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}