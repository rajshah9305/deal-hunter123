import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { 
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage 
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, Plus, ArrowUpDown, DollarSign, Star, ShoppingCart, RefreshCw,
  LineChart, Tag, ExternalLink, Trash2, Filter, SortAsc, BarChart
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";

// Interfaces
interface CompetitorPrice {
  id: number;
  userId: number;
  dealId?: number | null;
  platform: string;
  title: string;
  url?: string;
  price: number;
  condition?: string;
  shipping?: number;
  rating?: number;
  sellerName?: string;
  availability?: string;
  lastChecked: string;
  createdAt: string;
  updatedAt: string;
}

interface PriceHistoryPoint {
  date: string;
  price: number;
  platform: string;
}

interface Deal {
  id: number;
  title: string;
}

// Form schema for adding a competitor price
const competitorPriceSchema = z.object({
  dealId: z.coerce.number().optional(),
  platform: z.string().min(1, "Platform is required"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  url: z.string().url("Must be a valid URL").optional(),
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  condition: z.string().optional(),
  shipping: z.coerce.number().optional(),
  rating: z.coerce.number().min(0).max(5, "Rating must be between 0 and 5").optional(),
  sellerName: z.string().optional(),
  availability: z.string().optional(),
});

export default function CompetitorPriceTracker() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddingCompetitor, setIsAddingCompetitor] = useState(false);
  const [selectedPlatformFilter, setSelectedPlatformFilter] = useState<string>("all");
  const [selectedDealFilter, setSelectedDealFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("lastChecked");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedCompetitor, setSelectedCompetitor] = useState<CompetitorPrice | null>(null);
  const [showPriceHistory, setShowPriceHistory] = useState(false);

  // Form for adding a competitor price
  const competitorForm = useForm<z.infer<typeof competitorPriceSchema>>({
    resolver: zodResolver(competitorPriceSchema),
    defaultValues: {
      dealId: undefined,
      platform: "",
      title: "",
      url: "",
      price: undefined,
      condition: "",
      shipping: undefined,
      rating: undefined,
      sellerName: "",
      availability: "",
    },
  });

  // Fetch competitor prices
  const { data: competitorPrices = [], isLoading: isLoadingPrices } = useQuery<CompetitorPrice[]>({
    queryKey: ["/api/competitor-prices/user/1"],
    onError: (error) => {
      toast({
        title: "Error fetching competitor prices",
        description: "Failed to load competitor price data.",
        variant: "destructive",
      });
    }
  });

  // Fetch deals for the dropdown
  const { data: deals = [], isLoading: isLoadingDeals } = useQuery<Deal[]>({
    queryKey: ["/api/deals/user/1"],
    onError: (error) => {
      toast({
        title: "Error fetching deals",
        description: "Failed to load deals data.",
        variant: "destructive",
      });
    }
  });

  // Fetch price history for the selected competitor
  const { data: priceHistory = [], isLoading: isLoadingHistory } = useQuery<PriceHistoryPoint[]>({
    queryKey: ["/api/price-history", selectedCompetitor?.id],
    enabled: !!selectedCompetitor && showPriceHistory,
    onError: (error) => {
      toast({
        title: "Error fetching price history",
        description: "Failed to load price history data.",
        variant: "destructive",
      });
    }
  });

  // Mutation for adding a competitor price
  const addCompetitorPrice = useMutation({
    mutationFn: async (data: z.infer<typeof competitorPriceSchema>) => {
      const response = await apiRequest("POST", "/api/competitor-prices", {
        ...data,
        userId: 1, // Using the demo user id for now
        lastChecked: new Date().toISOString(),
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Competitor price added",
        description: "The competitor price has been tracked.",
      });
      setIsAddingCompetitor(false);
      competitorForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/competitor-prices/user/1"] });
    },
    onError: (error) => {
      toast({
        title: "Error adding competitor price",
        description: "Failed to add competitor price.",
        variant: "destructive",
      });
    },
  });

  // Mutation for refreshing a competitor price
  const refreshCompetitorPrice = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("POST", `/api/competitor-prices/${id}/refresh`, {});
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Price refreshed",
        description: "The competitor price has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/competitor-prices/user/1"] });
    },
    onError: (error) => {
      toast({
        title: "Error refreshing price",
        description: "Failed to refresh the competitor price.",
        variant: "destructive",
      });
    },
  });

  // Mutation for deleting a competitor price
  const deleteCompetitorPrice = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/competitor-prices/${id}`, {});
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Competitor price removed",
        description: "The competitor price has been removed from tracking.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/competitor-prices/user/1"] });
    },
    onError: (error) => {
      toast({
        title: "Error removing competitor price",
        description: "Failed to remove competitor price.",
        variant: "destructive",
      });
    },
  });

  // Handle competitor price form submission
  const onCompetitorSubmit = (values: z.infer<typeof competitorPriceSchema>) => {
    addCompetitorPrice.mutate(values);
  };

  // Filter and sort competitor prices
  const filteredCompetitorPrices = competitorPrices
    .filter(comp => {
      const matchesPlatform = selectedPlatformFilter === "all" || comp.platform === selectedPlatformFilter;
      const matchesDeal = selectedDealFilter === "all" || 
                          (selectedDealFilter === "none" && comp.dealId === null) || 
                          (comp.dealId?.toString() === selectedDealFilter);
      const matchesSearch = !searchQuery || 
                            comp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (comp.sellerName && comp.sellerName.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesPlatform && matchesDeal && matchesSearch;
    })
    .sort((a, b) => {
      let aValue: any = a[sortField as keyof CompetitorPrice];
      let bValue: any = b[sortField as keyof CompetitorPrice];
      
      // Handle null values
      if (aValue === null || aValue === undefined) return sortOrder === "asc" ? -1 : 1;
      if (bValue === null || bValue === undefined) return sortOrder === "asc" ? 1 : -1;
      
      // Handle dates
      if (typeof aValue === "string" && (aValue.includes("T") || aValue.includes("-"))) {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Get unique platforms and deals for filtering
  const platforms = ["all", ...new Set(competitorPrices.map(comp => comp.platform))];
  const dealOptions = [
    { id: "all", title: "All Deals" },
    { id: "none", title: "No Associated Deal" },
    ...deals
  ];

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Generate price history chart data
  const chartData = [
    ...priceHistory.map(point => ({
      name: new Date(point.date).toLocaleDateString(),
      price: point.price,
      platform: point.platform
    })),
    // Add current price if we have a selected competitor
    ...(selectedCompetitor ? [{
      name: "Current",
      price: selectedCompetitor.price + (selectedCompetitor.shipping || 0),
      platform: selectedCompetitor.platform
    }] : [])
  ];

  // Calculate price statistics
  const getStats = () => {
    if (!filteredCompetitorPrices.length) return { avg: 0, min: 0, max: 0, count: 0 };
    
    const prices = filteredCompetitorPrices.map(comp => comp.price + (comp.shipping || 0));
    const avg = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    
    return { avg, min, max, count: prices.length };
  };
  
  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Competitor Price Tracker</h2>
          <p className="text-muted-foreground">
            Monitor competitor prices and track price history
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="default" 
            className="gap-2" 
            onClick={() => {
              setIsAddingCompetitor(true);
              competitorForm.reset();
            }}
          >
            <Plus className="h-4 w-4" />
            Add Competitor
          </Button>
        </div>
      </div>

      {/* Price statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tracked Competitors</p>
                <p className="text-2xl font-bold mt-1">{stats.count}</p>
              </div>
              <div className="bg-primary/10 p-2 rounded-full">
                <LineChart className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Price</p>
                <p className="text-2xl font-bold mt-1">${stats.avg.toFixed(2)}</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-full">
                <BarChart className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lowest Price</p>
                <p className="text-2xl font-bold mt-1 text-green-600">${stats.min.toFixed(2)}</p>
              </div>
              <div className="bg-green-100 p-2 rounded-full">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Highest Price</p>
                <p className="text-2xl font-bold mt-1 text-red-600">${stats.max.toFixed(2)}</p>
              </div>
              <div className="bg-red-100 p-2 rounded-full">
                <ArrowUpDown className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and search */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Search</label>
              <Input 
                placeholder="Search by title, seller..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Platform</label>
              <Select value={selectedPlatformFilter} onValueChange={setSelectedPlatformFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by platform" />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map((platform) => (
                    <SelectItem key={platform} value={platform}>
                      {platform === 'all' ? 'All Platforms' : platform}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Associated Deal</label>
              <Select value={selectedDealFilter} onValueChange={setSelectedDealFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by deal" />
                </SelectTrigger>
                <SelectContent>
                  {dealOptions.map((deal) => (
                    <SelectItem key={deal.id} value={deal.id.toString()}>
                      {deal.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Sort</label>
              <div className="flex gap-2">
                <Select value={sortField} onValueChange={setSortField}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="lastChecked">Last Updated</SelectItem>
                    <SelectItem value="platform">Platform</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                >
                  <SortAsc className={`h-4 w-4 ${sortOrder === "desc" ? "rotate-180" : ""}`} />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Competitor prices table */}
      <Card>
        <CardHeader>
          <CardTitle>Competitor Prices</CardTitle>
          <CardDescription>
            Track and compare prices from different sellers and platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingPrices ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredCompetitorPrices.length > 0 ? (
                filteredCompetitorPrices.map((competitorPrice) => {
                  const totalPrice = competitorPrice.price + (competitorPrice.shipping || 0);
                  const associatedDeal = deals.find(d => d.id === competitorPrice.dealId);
                  
                  return (
                    <TableRow key={competitorPrice.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{competitorPrice.title}</div>
                          {competitorPrice.sellerName && (
                            <div className="text-xs text-muted-foreground">
                              Seller: {competitorPrice.sellerName}
                            </div>
                          )}
                          {associatedDeal && (
                            <div className="mt-1">
                              <Badge variant="outline" className="text-xs">
                                {associatedDeal.title}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {competitorPrice.platform}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        ${competitorPrice.price.toFixed(2)}
                        {competitorPrice.shipping !== undefined && competitorPrice.shipping > 0 && (
                          <div className="text-xs text-muted-foreground">
                            +${competitorPrice.shipping.toFixed(2)} shipping
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        ${totalPrice.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {competitorPrice.condition || "-"}
                      </TableCell>
                      <TableCell>
                        {competitorPrice.rating !== undefined && competitorPrice.rating > 0 ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <span>{competitorPrice.rating.toFixed(1)}</span>
                          </div>
                        ) : "-"}
                      </TableCell>
                      <TableCell>
                        {formatDate(competitorPrice.lastChecked)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedCompetitor(competitorPrice);
                                setShowPriceHistory(true);
                              }}
                            >
                              <LineChart className="mr-2 h-4 w-4" />
                              View Price History
                            </DropdownMenuItem>
                            {competitorPrice.url && (
                              <DropdownMenuItem asChild>
                                <a href={competitorPrice.url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="mr-2 h-4 w-4" />
                                  View Listing
                                </a>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => refreshCompetitorPrice.mutate(competitorPrice.id)}
                              disabled={refreshCompetitorPrice.isPending}
                            >
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Refresh Price
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => deleteCompetitorPrice.mutate(competitorPrice.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                    <div className="flex flex-col items-center justify-center">
                      <LineChart className="h-12 w-12 text-muted-foreground/60 mb-3" />
                      <p>No competitor prices found</p>
                      <Button 
                        variant="link" 
                        onClick={() => {
                          setIsAddingCompetitor(true);
                          competitorForm.reset();
                        }}
                      >
                        Add your first competitor price
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add competitor price dialog */}
      <Dialog open={isAddingCompetitor} onOpenChange={setIsAddingCompetitor}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Track Competitor Price</DialogTitle>
            <DialogDescription>
              Add a competitor's price to track and compare
            </DialogDescription>
          </DialogHeader>
          
          <Form {...competitorForm}>
            <form onSubmit={competitorForm.handleSubmit(onCompetitorSubmit)} className="space-y-4">
              <FormField
                control={competitorForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Title*</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Nintendo Switch Console" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={competitorForm.control}
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform*</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="amazon">Amazon</SelectItem>
                        <SelectItem value="ebay">eBay</SelectItem>
                        <SelectItem value="walmart">Walmart</SelectItem>
                        <SelectItem value="bestbuy">Best Buy</SelectItem>
                        <SelectItem value="target">Target</SelectItem>
                        <SelectItem value="facebook">Facebook Marketplace</SelectItem>
                        <SelectItem value="offerup">OfferUp</SelectItem>
                        <SelectItem value="mercari">Mercari</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={competitorForm.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Listing URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/product" {...field} />
                    </FormControl>
                    <FormDescription>
                      Link to the competitor's listing
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={competitorForm.control}
                  name="price"
                  render={({ field: { onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>Price ($)*</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="49.99" 
                          onChange={(e) => onChange(e.target.valueAsNumber)} 
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={competitorForm.control}
                  name="shipping"
                  render={({ field: { onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>Shipping ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="0.00" 
                          onChange={(e) => onChange(e.target.valueAsNumber)} 
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={competitorForm.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition</FormLabel>
                      <Select value={field.value || ""} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Not specified</SelectItem>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="like_new">Like New</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                          <SelectItem value="poor">Poor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={competitorForm.control}
                  name="rating"
                  render={({ field: { onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>Rating (0-5)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          min="0"
                          max="5"
                          placeholder="4.5" 
                          onChange={(e) => onChange(e.target.valueAsNumber)} 
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={competitorForm.control}
                name="sellerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seller Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. TechDeals" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={competitorForm.control}
                name="availability"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Availability</FormLabel>
                    <Select value={field.value || ""} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select availability" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Not specified</SelectItem>
                        <SelectItem value="in_stock">In Stock</SelectItem>
                        <SelectItem value="limited">Limited Stock</SelectItem>
                        <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                        <SelectItem value="pre_order">Pre-order</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={competitorForm.control}
                name="dealId"
                render={({ field: { onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Associated Deal</FormLabel>
                    <Select 
                      value={field.value?.toString() || ""} 
                      onValueChange={(value) => onChange(value ? parseInt(value) : undefined)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a deal" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">No associated deal</SelectItem>
                        {deals.map((deal) => (
                          <SelectItem key={deal.id} value={deal.id.toString()}>
                            {deal.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Link this competitor to one of your deals (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddingCompetitor(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={addCompetitorPrice.isPending}
                >
                  {addCompetitorPrice.isPending ? "Adding..." : "Add Competitor"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Price history dialog */}
      <Dialog open={showPriceHistory} onOpenChange={setShowPriceHistory}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Price History</DialogTitle>
            <DialogDescription>
              {selectedCompetitor ? `Price history for ${selectedCompetitor.title} on ${selectedCompetitor.platform}` : "Price history"}
            </DialogDescription>
          </DialogHeader>
          
          {isLoadingHistory ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : chartData.length > 0 ? (
            <div className="h-80 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart
                  data={chartData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis
                    domain={['auto', 'auto']}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    formatter={(value) => [`$${Number(value).toFixed(2)}`, "Price"]}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-10">
              <LineChart className="mx-auto h-12 w-12 text-muted-foreground/60 mb-4" />
              <h3 className="text-lg font-medium">No price history available</h3>
              <p className="text-muted-foreground mt-2">
                Price history will be recorded as prices are updated
              </p>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setShowPriceHistory(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}