import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { 
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage 
} from "@/components/ui/form";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, 
  DialogTitle, DialogTrigger, DialogClose 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Inbox, PackageOpen, Tag, DollarSign, Calendar, MapPin, Trash2, 
  PenSquare, Plus, Filter, ClipboardList, PackageCheck, BellRing,
  ShoppingBag, TrendingUp, BarChart4
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Inventory item form schema
const inventoryItemSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  purchasePrice: z.coerce.number().min(0.01, "Purchase price is required"),
  purchaseDate: z.string().min(1, "Purchase date is required"),
  estimatedValue: z.coerce.number().optional(),
  condition: z.string().optional(),
  status: z.string().min(1, "Status is required"),
  location: z.string().optional(),
  tags: z.string().optional().transform(val => 
    val ? val.split(',').map(tag => tag.trim()) : []
  ),
  notes: z.string().optional(),
});

// Sale record form schema
const saleRecordSchema = z.object({
  inventoryItemId: z.coerce.number(),
  salePrice: z.coerce.number().min(0.01, "Sale price is required"),
  saleDate: z.string().min(1, "Sale date is required"),
  platformSold: z.string().optional(),
  fees: z.coerce.number().optional(),
  shippingCost: z.coerce.number().optional(),
  buyerInfo: z.string().optional(),
  notes: z.string().optional(),
});

// Interface for inventory item
interface InventoryItem {
  id: number;
  userId: number;
  dealId?: number;
  title: string;
  description?: string;
  category: string;
  purchasePrice: number;
  purchaseDate: string;
  estimatedValue?: number;
  condition?: string;
  status: string;
  location?: string;
  imageUrl?: string;
  tags: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Interface for sales record
interface SalesRecord {
  id: number;
  userId: number;
  inventoryItemId: number;
  salePrice: number;
  saleDate: string;
  platformSold?: string;
  fees?: number;
  shippingCost?: number;
  profit: number;
  buyerInfo?: any;
  notes?: string;
  createdAt: string;
}

// Interface for category summary
interface CategorySummary {
  category: string;
  count: number;
  totalValue: number;
  averageValue: number;
}

// Dashboard summary stats
interface InventorySummary {
  totalItems: number;
  totalValue: number;
  categoryCounts: CategorySummary[];
  statusCounts: Record<string, number>;
  recentItems: InventoryItem[];
}

export default function InventoryManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isAddingSale, setIsAddingSale] = useState(false);
  const [itemForSale, setItemForSale] = useState<InventoryItem | null>(null);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("all");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch inventory items
  const { data: inventoryItems = [], isLoading: isLoadingInventory } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory/user/1"],
    onError: (error) => {
      toast({
        title: "Error fetching inventory",
        description: "Failed to load inventory items.",
        variant: "destructive",
      });
    }
  });

  // Fetch sales records
  const { data: salesRecords = [], isLoading: isLoadingSales } = useQuery<SalesRecord[]>({
    queryKey: ["/api/sales/user/1"],
    onError: (error) => {
      toast({
        title: "Error fetching sales",
        description: "Failed to load sales records.",
        variant: "destructive",
      });
    }
  });

  // Form for adding a new inventory item
  const inventoryForm = useForm<z.infer<typeof inventoryItemSchema>>({
    resolver: zodResolver(inventoryItemSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      purchasePrice: undefined,
      purchaseDate: new Date().toISOString().split('T')[0],
      estimatedValue: undefined,
      condition: "",
      status: "in_inventory",
      location: "",
      tags: "",
      notes: "",
    },
  });

  // Form for adding a sale record
  const saleForm = useForm<z.infer<typeof saleRecordSchema>>({
    resolver: zodResolver(saleRecordSchema),
    defaultValues: {
      inventoryItemId: 0,
      salePrice: undefined,
      saleDate: new Date().toISOString().split('T')[0],
      platformSold: "",
      fees: undefined,
      shippingCost: undefined,
      buyerInfo: "",
      notes: "",
    },
  });

  // Mutation for adding a new inventory item
  const addInventoryItem = useMutation({
    mutationFn: async (data: z.infer<typeof inventoryItemSchema>) => {
      const response = await apiRequest("POST", "/api/inventory", {
        ...data,
        userId: 1, // Using the demo user id for now
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Item added to inventory",
        description: "Your inventory has been updated.",
      });
      setIsAddingItem(false);
      inventoryForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/user/1"] });
    },
    onError: (error) => {
      toast({
        title: "Error adding item",
        description: "Failed to add item to inventory.",
        variant: "destructive",
      });
    },
  });

  // Mutation for adding a sale record
  const addSaleRecord = useMutation({
    mutationFn: async (data: z.infer<typeof saleRecordSchema>) => {
      const response = await apiRequest("POST", "/api/sales", {
        ...data,
        userId: 1, // Using the demo user id for now
        profit: data.salePrice - (itemForSale?.purchasePrice || 0) - (data.fees || 0) - (data.shippingCost || 0),
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sale recorded",
        description: "Your sale has been recorded successfully.",
      });
      setIsAddingSale(false);
      saleForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/sales/user/1"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/user/1"] });
      
      // Update the inventory item status
      if (itemForSale) {
        updateInventoryItem.mutate({
          id: itemForSale.id,
          status: "sold"
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error recording sale",
        description: "Failed to record sale.",
        variant: "destructive",
      });
    },
  });

  // Mutation for updating an inventory item
  const updateInventoryItem = useMutation({
    mutationFn: async (data: { id: number, status: string }) => {
      const response = await apiRequest("PATCH", `/api/inventory/${data.id}`, {
        status: data.status,
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/user/1"] });
    },
    onError: (error) => {
      toast({
        title: "Error updating item",
        description: "Failed to update inventory item.",
        variant: "destructive",
      });
    },
  });

  // Helper function to prepare sales form with selected inventory item
  const prepareItemForSale = (item: InventoryItem) => {
    setItemForSale(item);
    saleForm.setValue("inventoryItemId", item.id);
    saleForm.setValue("salePrice", item.estimatedValue || item.purchasePrice);
    setIsAddingSale(true);
  };

  // Filter inventory items based on selected filters and search query
  const filteredInventoryItems = inventoryItems.filter(item => {
    const matchesStatus = selectedStatusFilter === "all" || item.status === selectedStatusFilter;
    const matchesCategory = selectedCategoryFilter === "all" || item.category === selectedCategoryFilter;
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    
    return matchesStatus && matchesCategory && matchesSearch;
  });

  // Calculate inventory summary statistics
  const inventorySummary: InventorySummary = {
    totalItems: inventoryItems.filter(item => item.status === 'in_inventory').length,
    totalValue: inventoryItems
      .filter(item => item.status === 'in_inventory')
      .reduce((sum, item) => sum + (item.estimatedValue || item.purchasePrice), 0),
    categoryCounts: Object.entries(
      inventoryItems
        .filter(item => item.status === 'in_inventory')
        .reduce((acc, item) => {
          const category = item.category;
          if (!acc[category]) {
            acc[category] = { count: 0, totalValue: 0 };
          }
          acc[category].count += 1;
          acc[category].totalValue += (item.estimatedValue || item.purchasePrice);
          return acc;
        }, {} as Record<string, { count: number, totalValue: number }>)
    ).map(([category, { count, totalValue }]) => ({
      category,
      count,
      totalValue,
      averageValue: totalValue / count
    })),
    statusCounts: inventoryItems.reduce((acc, item) => {
      if (!acc[item.status]) {
        acc[item.status] = 0;
      }
      acc[item.status] += 1;
      return acc;
    }, {} as Record<string, number>),
    recentItems: [...inventoryItems]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  };

  // Calculate sales summary statistics
  const totalSales = salesRecords.reduce((sum, record) => sum + record.salePrice, 0);
  const totalProfit = salesRecords.reduce((sum, record) => sum + record.profit, 0);
  const averageProfit = salesRecords.length > 0 ? totalProfit / salesRecords.length : 0;
  const profitMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;

  // Get unique categories and statuses for filtering
  const categories = ["all", ...new Set(inventoryItems.map(item => item.category))];
  const statuses = ["all", ...new Set(inventoryItems.map(item => item.status))];

  // Handle inventory item form submission
  const onInventorySubmit = (values: z.infer<typeof inventoryItemSchema>) => {
    addInventoryItem.mutate(values);
  };

  // Handle sale record form submission
  const onSaleSubmit = (values: z.infer<typeof saleRecordSchema>) => {
    addSaleRecord.mutate(values);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Inventory Management</h2>
          <p className="text-muted-foreground">
            Track your inventory items, record sales, and monitor performance
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            className="gap-2" 
            onClick={() => setActiveTab("overview")}
          >
            <BarChart4 className="h-4 w-4" />
            Overview
          </Button>
          <Button 
            variant="outline" 
            className="gap-2" 
            onClick={() => setActiveTab("inventory")}
          >
            <Inbox className="h-4 w-4" />
            Inventory
          </Button>
          <Button 
            variant="outline" 
            className="gap-2" 
            onClick={() => setActiveTab("sales")}
          >
            <ShoppingBag className="h-4 w-4" />
            Sales
          </Button>
          <Button 
            variant="default" 
            className="gap-2" 
            onClick={() => {
              setIsAddingItem(true);
              inventoryForm.reset();
            }}
          >
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Mobile tabs */}
      <div className="block sm:hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Overview tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                    <h3 className="text-2xl font-bold mt-1">{inventorySummary.totalItems}</h3>
                  </div>
                  <div className="bg-primary/10 p-2 rounded-full">
                    <PackageOpen className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Active inventory items
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Inventory Value</p>
                    <h3 className="text-2xl font-bold mt-1">${inventorySummary.totalValue.toFixed(2)}</h3>
                  </div>
                  <div className="bg-primary/10 p-2 rounded-full">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Total estimated value
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
                    <h3 className="text-2xl font-bold mt-1">${totalSales.toFixed(2)}</h3>
                  </div>
                  <div className="bg-primary/10 p-2 rounded-full">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {salesRecords.length} items sold
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Profit</p>
                    <h3 className="text-2xl font-bold mt-1 text-green-600">${totalProfit.toFixed(2)}</h3>
                  </div>
                  <div className="bg-green-100 p-2 rounded-full">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {profitMargin.toFixed(1)}% profit margin
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent items and category breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Inventory Items</CardTitle>
                <CardDescription>
                  Your most recently added inventory items
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventorySummary.recentItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.title}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>${(item.estimatedValue || item.purchasePrice).toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={item.status === 'in_inventory' ? 'default' : 
                                          item.status === 'sold' ? 'success' : 
                                          item.status === 'listed' ? 'secondary' : 'outline'}>
                            {item.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {inventorySummary.recentItems.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                          No items in inventory yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
                <CardDescription>
                  Inventory items by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Count</TableHead>
                      <TableHead>Avg. Value</TableHead>
                      <TableHead>Total Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventorySummary.categoryCounts.map((category) => (
                      <TableRow key={category.category}>
                        <TableCell className="font-medium">{category.category}</TableCell>
                        <TableCell>{category.count}</TableCell>
                        <TableCell>${category.averageValue.toFixed(2)}</TableCell>
                        <TableCell>${category.totalValue.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    {inventorySummary.categoryCounts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                          No categories available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Inventory tab */}
      {activeTab === "inventory" && (
        <div className="space-y-6">
          {/* Filters and search */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Search</label>
                  <Input 
                    placeholder="Search by title, description, tags..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Status</label>
                  <Select value={selectedStatusFilter} onValueChange={setSelectedStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status === 'all' ? 'All Statuses' : status.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Category</label>
                  <Select value={selectedCategoryFilter} onValueChange={setSelectedCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category === 'all' ? 'All Categories' : category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inventory items table */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory Items</CardTitle>
              <CardDescription>
                Manage your inventory - {filteredInventoryItems.length} items found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Purchase Price</TableHead>
                    <TableHead>Est. Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Purchase Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventoryItems.length > 0 ? (
                    filteredInventoryItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          <div>
                            {item.title}
                            {item.tags && item.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {item.tags.slice(0, 2).map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {item.tags.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{item.tags.length - 2} more
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>${item.purchasePrice.toFixed(2)}</TableCell>
                        <TableCell>${(item.estimatedValue || item.purchasePrice).toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={item.status === 'in_inventory' ? 'default' : 
                                          item.status === 'sold' ? 'success' : 
                                          item.status === 'listed' ? 'secondary' : 'outline'}>
                            {item.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(item.purchaseDate).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                Actions
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => {}}
                                disabled={item.status === 'sold'}
                              >
                                <PenSquare className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem 
                                onClick={() => {
                                  updateInventoryItem.mutate({
                                    id: item.id,
                                    status: 'listed'
                                  });
                                }}
                                disabled={item.status !== 'in_inventory'}
                              >
                                <Tag className="mr-2 h-4 w-4" />
                                Mark as Listed
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem 
                                onClick={() => prepareItemForSale(item)}
                                disabled={item.status === 'sold'}
                              >
                                <ShoppingBag className="mr-2 h-4 w-4" />
                                Record Sale
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem 
                                onClick={() => {}}
                                className="text-red-600 focus:text-red-600"
                                disabled={item.status === 'sold'}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                        {isLoadingInventory ? (
                          <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          </div>
                        ) : (
                          <>
                            <PackageOpen className="mx-auto h-12 w-12 text-muted-foreground/60 mb-2" />
                            <div>No inventory items found</div>
                            <Button 
                              variant="link" 
                              onClick={() => {
                                setIsAddingItem(true);
                                inventoryForm.reset();
                              }}
                            >
                              Add your first item
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sales tab */}
      {activeTab === "sales" && (
        <div className="space-y-6">
          {/* Sales summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
                    <h3 className="text-2xl font-bold mt-1">${totalSales.toFixed(2)}</h3>
                  </div>
                  <div className="bg-primary/10 p-2 rounded-full">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {salesRecords.length} items sold
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Profit</p>
                    <h3 className="text-2xl font-bold mt-1 text-green-600">${totalProfit.toFixed(2)}</h3>
                  </div>
                  <div className="bg-green-100 p-2 rounded-full">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {profitMargin.toFixed(1)}% profit margin
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Average Profit</p>
                    <h3 className="text-2xl font-bold mt-1">${averageProfit.toFixed(2)}</h3>
                  </div>
                  <div className="bg-primary/10 p-2 rounded-full">
                    <BarChart4 className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Per item sold
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sales records table */}
          <Card>
            <CardHeader>
              <CardTitle>Sales Records</CardTitle>
              <CardDescription>
                View your sales history and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Sale Price</TableHead>
                    <TableHead>Sale Date</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Fees</TableHead>
                    <TableHead>Profit</TableHead>
                    <TableHead>Margin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesRecords.length > 0 ? (
                    salesRecords.map((sale) => {
                      const item = inventoryItems.find(i => i.id === sale.inventoryItemId);
                      const margin = ((sale.profit / sale.salePrice) * 100).toFixed(1);
                      
                      return (
                        <TableRow key={sale.id}>
                          <TableCell className="font-medium">
                            {item?.title || `Item #${sale.inventoryItemId}`}
                          </TableCell>
                          <TableCell>${sale.salePrice.toFixed(2)}</TableCell>
                          <TableCell>{new Date(sale.saleDate).toLocaleDateString()}</TableCell>
                          <TableCell>{sale.platformSold || "-"}</TableCell>
                          <TableCell>${(sale.fees || 0).toFixed(2)}</TableCell>
                          <TableCell className={sale.profit >= 0 ? "text-green-600" : "text-red-600"}>
                            ${sale.profit.toFixed(2)}
                          </TableCell>
                          <TableCell className={Number(margin) >= 0 ? "text-green-600" : "text-red-600"}>
                            {margin}%
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                        {isLoadingSales ? (
                          <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          </div>
                        ) : (
                          <>
                            <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground/60 mb-2" />
                            <div>No sales records found</div>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add inventory item dialog */}
      <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Inventory Item</DialogTitle>
            <DialogDescription>
              Add a new item to your inventory for tracking
            </DialogDescription>
          </DialogHeader>
          
          <Form {...inventoryForm}>
            <form onSubmit={inventoryForm.handleSubmit(onInventorySubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={inventoryForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title*</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Nintendo Switch Console" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={inventoryForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category*</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Electronics" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={inventoryForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Details about the item, model, features, etc." 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={inventoryForm.control}
                  name="purchasePrice"
                  render={({ field: { onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>Purchase Price ($)*</FormLabel>
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
                  control={inventoryForm.control}
                  name="estimatedValue"
                  render={({ field: { onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>Estimated Value ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="59.99" 
                          onChange={(e) => onChange(e.target.valueAsNumber)} 
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Estimated current market value
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={inventoryForm.control}
                  name="purchaseDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purchase Date*</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={inventoryForm.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition</FormLabel>
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={inventoryForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status*</FormLabel>
                      <Select 
                        defaultValue="in_inventory" 
                        value={field.value} 
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="in_inventory">In Inventory</SelectItem>
                          <SelectItem value="listed">Listed</SelectItem>
                          <SelectItem value="sold">Sold</SelectItem>
                          <SelectItem value="returned">Returned</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={inventoryForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Storage Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Shelf A3, Box 2" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={inventoryForm.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. electronics, gaming, console (comma separated)" {...field} />
                    </FormControl>
                    <FormDescription>
                      Separate multiple tags with commas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={inventoryForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Additional notes about this item" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddingItem(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={addInventoryItem.isPending}
                >
                  {addInventoryItem.isPending ? "Adding..." : "Add Item"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Record sale dialog */}
      <Dialog open={isAddingSale} onOpenChange={setIsAddingSale}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Sale</DialogTitle>
            <DialogDescription>
              {itemForSale ? `Record sale details for "${itemForSale.title}"` : "Record a sale"}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...saleForm}>
            <form onSubmit={saleForm.handleSubmit(onSaleSubmit)} className="space-y-4">
              <FormField
                control={saleForm.control}
                name="salePrice"
                render={({ field: { onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Sale Price ($)*</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="99.99" 
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
                control={saleForm.control}
                name="saleDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sale Date*</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={saleForm.control}
                name="platformSold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform Sold</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ebay">eBay</SelectItem>
                        <SelectItem value="facebook">Facebook Marketplace</SelectItem>
                        <SelectItem value="craigslist">Craigslist</SelectItem>
                        <SelectItem value="offerup">OfferUp</SelectItem>
                        <SelectItem value="mercari">Mercari</SelectItem>
                        <SelectItem value="poshmark">Poshmark</SelectItem>
                        <SelectItem value="amazon">Amazon</SelectItem>
                        <SelectItem value="etsy">Etsy</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={saleForm.control}
                  name="fees"
                  render={({ field: { onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>Fees ($)</FormLabel>
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
                
                <FormField
                  control={saleForm.control}
                  name="shippingCost"
                  render={({ field: { onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>Shipping Cost ($)</FormLabel>
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
              
              <FormField
                control={saleForm.control}
                name="buyerInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Buyer Information</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Notes about the buyer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={saleForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Additional notes about this sale" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {itemForSale && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <PackageCheck className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">Profit Calculation</p>
                    </div>
                    <div className="mt-2 space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Purchase Price:</span>
                        <span className="font-medium">${itemForSale.purchasePrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Estimated Profit:</span>
                        <span className={
                          (saleForm.getValues().salePrice || 0) - 
                          itemForSale.purchasePrice - 
                          (saleForm.getValues().fees || 0) - 
                          (saleForm.getValues().shippingCost || 0) >= 0 
                            ? "font-medium text-green-600" 
                            : "font-medium text-red-600"
                        }>
                          ${((saleForm.getValues().salePrice || 0) - 
                          itemForSale.purchasePrice - 
                          (saleForm.getValues().fees || 0) - 
                          (saleForm.getValues().shippingCost || 0)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddingSale(false);
                    setItemForSale(null);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={addSaleRecord.isPending}
                >
                  {addSaleRecord.isPending ? "Recording..." : "Record Sale"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}