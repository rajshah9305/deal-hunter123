import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  BellRing, CheckCircle2, DollarSign, Tag, Inbox, ShoppingBag, 
  TrendingDown, AlertTriangle, Clock, Calendar, X, Filter
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { 
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage 
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Interfaces
interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  data?: any;
  createdAt: string;
}

interface DealAlert {
  id: number;
  userId: number;
  name: string;
  keywords: string[];
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  sources: string[];
  enabled: boolean;
  instantNotification: boolean;
  emailNotification: boolean;
  lastRunAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Deal alert form schema
const dealAlertSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  keywords: z.string().min(1, "At least one keyword is required").transform(val => 
    val.split(',').map(keyword => keyword.trim())
  ),
  category: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  condition: z.string().optional(),
  sources: z.array(z.string()).min(1, "At least one source must be selected"),
  enabled: z.boolean().default(true),
  instantNotification: z.boolean().default(true),
  emailNotification: z.boolean().default(false),
});

export default function NotificationCenter() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("notifications");
  const [isCreatingAlert, setIsCreatingAlert] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState("all");

  // Setup the form for creating deal alerts
  const dealAlertForm = useForm<z.infer<typeof dealAlertSchema>>({
    resolver: zodResolver(dealAlertSchema),
    defaultValues: {
      name: "",
      keywords: "",
      category: "",
      minPrice: undefined,
      maxPrice: undefined,
      condition: "",
      sources: ["facebook", "ebay", "offerup"],
      enabled: true,
      instantNotification: true,
      emailNotification: false,
    },
  });

  // Fetch all notifications
  const { data: notifications = [], isLoading: isLoadingNotifications } = useQuery<Notification[]>({
    queryKey: ["/api/notifications/user/1"],
    onError: (error) => {
      toast({
        title: "Error fetching notifications",
        description: "Failed to load notifications.",
        variant: "destructive",
      });
    }
  });

  // Fetch all deal alerts
  const { data: dealAlerts = [], isLoading: isLoadingAlerts } = useQuery<DealAlert[]>({
    queryKey: ["/api/deal-alerts/user/1"],
    onError: (error) => {
      toast({
        title: "Error fetching deal alerts",
        description: "Failed to load deal alerts.",
        variant: "destructive",
      });
    }
  });

  // Filter notifications based on type
  const filteredNotifications = notifications.filter(notification => {
    if (notificationFilter === "all") return true;
    return notification.type === notificationFilter;
  });
  
  // Count unread notifications
  const unreadCount = notifications.filter(notification => !notification.read).length;

  // Mutation for marking a notification as read
  const markAsRead = useMutation({
    mutationFn: async (notificationId: number) => {
      const response = await apiRequest("PATCH", `/api/notifications/${notificationId}`, {
        read: true,
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/user/1"] });
    },
    onError: (error) => {
      toast({
        title: "Error updating notification",
        description: "Failed to mark notification as read.",
        variant: "destructive",
      });
    },
  });

  // Mutation for marking all notifications as read
  const markAllAsRead = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/notifications/mark-all-read", {
        userId: 1, // Using the demo user id for now
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/user/1"] });
      toast({
        title: "All notifications marked as read",
        description: "Your notifications have been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating notifications",
        description: "Failed to mark all notifications as read.",
        variant: "destructive",
      });
    },
  });

  // Mutation for creating a new deal alert
  const createDealAlert = useMutation({
    mutationFn: async (data: z.infer<typeof dealAlertSchema>) => {
      const response = await apiRequest("POST", "/api/deal-alerts", {
        ...data,
        userId: 1, // Using the demo user id for now
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Deal alert created",
        description: "Your new deal alert has been set up.",
      });
      setIsCreatingAlert(false);
      dealAlertForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/deal-alerts/user/1"] });
    },
    onError: (error) => {
      toast({
        title: "Error creating deal alert",
        description: "Failed to create deal alert.",
        variant: "destructive",
      });
    },
  });

  // Mutation for updating a deal alert (toggle enabled)
  const updateDealAlert = useMutation({
    mutationFn: async ({ id, enabled }: { id: number, enabled: boolean }) => {
      const response = await apiRequest("PATCH", `/api/deal-alerts/${id}`, {
        enabled,
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deal-alerts/user/1"] });
    },
    onError: (error) => {
      toast({
        title: "Error updating deal alert",
        description: "Failed to update deal alert status.",
        variant: "destructive",
      });
    },
  });

  // Handle deal alert form submission
  const onDealAlertSubmit = (values: z.infer<typeof dealAlertSchema>) => {
    createDealAlert.mutate(values);
  };

  // Helper function to get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'deal_alert':
        return <Tag className="h-4 w-4 text-blue-500" />;
      case 'price_drop':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      case 'inventory':
        return <Inbox className="h-4 w-4 text-purple-500" />;
      case 'sales':
        return <ShoppingBag className="h-4 w-4 text-orange-500" />;
      default:
        return <BellRing className="h-4 w-4 text-gray-500" />;
    }
  };

  // Format notification date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} min${diffMins === 1 ? '' : 's'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Notification Center</h2>
          <p className="text-muted-foreground">
            Manage your notifications and set up deal alerts
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            className="gap-2" 
            onClick={() => setActiveTab("notifications")}
          >
            <BellRing className="h-4 w-4" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-1">{unreadCount}</Badge>
            )}
          </Button>
          <Button 
            variant="outline" 
            className="gap-2" 
            onClick={() => setActiveTab("dealAlerts")}
          >
            <AlertTriangle className="h-4 w-4" />
            Deal Alerts
          </Button>
          
          {activeTab === "dealAlerts" && (
            <Button 
              variant="default" 
              className="gap-2" 
              onClick={() => {
                setIsCreatingAlert(true);
                dealAlertForm.reset();
              }}
            >
              <AlertTriangle className="h-4 w-4" />
              New Alert
            </Button>
          )}
        </div>
      </div>

      {/* Mobile tabs */}
      <div className="block sm:hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="notifications" className="relative">
              Notifications
              {unreadCount > 0 && (
                <Badge variant="secondary" className="absolute -top-2 -right-2 text-xs">{unreadCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="dealAlerts">Deal Alerts</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                View and manage your recent notifications
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={notificationFilter} onValueChange={setNotificationFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="deal_alert">Deal Alerts</SelectItem>
                  <SelectItem value="price_drop">Price Drops</SelectItem>
                  <SelectItem value="inventory">Inventory</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1"
                onClick={() => markAllAsRead.mutate()}
                disabled={!notifications.some(n => !n.read) || markAllAsRead.isPending}
              >
                <CheckCircle2 className="h-4 w-4" />
                Mark All Read
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoadingNotifications ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <div key={notification.id} className={`
                    flex items-start gap-4 p-4 rounded-lg transition-colors
                    ${notification.read ? 'bg-card' : 'bg-muted/50 shadow-sm'}
                  `}>
                    <div className={`
                      p-2 rounded-full 
                      ${notification.type === 'deal_alert' ? 'bg-blue-100 text-blue-500' : 
                        notification.type === 'price_drop' ? 'bg-green-100 text-green-500' : 
                        notification.type === 'inventory' ? 'bg-purple-100 text-purple-500' : 
                        notification.type === 'sales' ? 'bg-orange-100 text-orange-500' : 
                        'bg-gray-100 text-gray-500'}
                    `}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between">
                        <h4 className={`font-medium ${!notification.read ? 'text-primary' : ''}`}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(notification.createdAt)}
                          </span>
                          {!notification.read && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6"
                              onClick={() => markAsRead.mutate(notification.id)}
                            >
                              <X className="h-4 w-4" />
                              <span className="sr-only">Mark as read</span>
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      {notification.type === 'deal_alert' && notification.data?.url && (
                        <Button variant="link" size="sm" className="p-0 h-auto text-blue-500" asChild>
                          <a href={notification.data.url} target="_blank" rel="noopener noreferrer">
                            View Deal
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <BellRing className="mx-auto h-12 w-12 text-muted-foreground/60 mb-4" />
                  <h3 className="text-lg font-medium">No notifications</h3>
                  <p className="text-muted-foreground mt-2">
                    You're all caught up! New notifications will appear here.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deal Alerts Tab */}
      {activeTab === "dealAlerts" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Deal Alerts</CardTitle>
              <CardDescription>
                Set up custom alerts for deals you're interested in
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoadingAlerts ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : dealAlerts.length > 0 ? (
                  dealAlerts.map((alert) => (
                    <div key={alert.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{alert.name}</h4>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {alert.keywords.map((keyword, i) => (
                              <Badge key={i} variant="outline">{keyword}</Badge>
                            ))}
                          </div>
                        </div>
                        <Switch 
                          checked={alert.enabled} 
                          onCheckedChange={(enabled) => updateDealAlert.mutate({ id: alert.id, enabled })}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {alert.category && (
                          <div className="flex items-center gap-2 text-sm">
                            <Tag className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Category:</span>
                            <span>{alert.category}</span>
                          </div>
                        )}
                        
                        {(alert.minPrice !== undefined || alert.maxPrice !== undefined) && (
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Price:</span>
                            <span>
                              {alert.minPrice !== undefined && alert.maxPrice !== undefined ? 
                                `$${alert.minPrice} - $${alert.maxPrice}` : 
                                alert.minPrice !== undefined ? 
                                `Min $${alert.minPrice}` : 
                                `Max $${alert.maxPrice}`}
                            </span>
                          </div>
                        )}
                        
                        {alert.condition && (
                          <div className="flex items-center gap-2 text-sm">
                            <Inbox className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Condition:</span>
                            <span>{alert.condition}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-sm">
                          <Filter className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Sources:</span>
                          <span>{alert.sources.join(', ')}</span>
                        </div>
                        
                        {alert.lastRunAt && (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Last checked:</span>
                            <span>{formatDate(alert.lastRunAt)}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm pt-2">
                        <div className="flex items-center gap-1">
                          <BellRing className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {alert.instantNotification ? 'Push notifications enabled' : 'Push notifications disabled'}
                          </span>
                        </div>
                        
                        <Separator orientation="vertical" className="h-4" />
                        
                        <div className="flex items-center gap-1">
                          <span>
                            {alert.emailNotification ? 'Email alerts enabled' : 'Email alerts disabled'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground/60 mb-4" />
                    <h3 className="text-lg font-medium">No deal alerts set up</h3>
                    <p className="text-muted-foreground mt-2 mb-4">
                      Create alerts to get notified when deals matching your criteria are found
                    </p>
                    <Button 
                      onClick={() => {
                        setIsCreatingAlert(true);
                        dealAlertForm.reset();
                      }}
                    >
                      Create Your First Alert
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Deal Alert Dialog */}
      <Dialog open={isCreatingAlert} onOpenChange={setIsCreatingAlert}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Deal Alert</DialogTitle>
            <DialogDescription>
              Set up alert criteria to be notified of deals that match your interests
            </DialogDescription>
          </DialogHeader>
          
          <Form {...dealAlertForm}>
            <form onSubmit={dealAlertForm.handleSubmit(onDealAlertSubmit)} className="space-y-4">
              <FormField
                control={dealAlertForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alert Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Gaming Consoles, Designer Shoes" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={dealAlertForm.control}
                name="keywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Keywords*</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. playstation, xbox, nintendo (comma separated)" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter keywords separated by commas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={dealAlertForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Electronics" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={dealAlertForm.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Any condition" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Any condition</SelectItem>
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
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={dealAlertForm.control}
                  name="minPrice"
                  render={({ field: { onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>Min Price ($)</FormLabel>
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
                  control={dealAlertForm.control}
                  name="maxPrice"
                  render={({ field: { onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>Max Price ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="1000.00" 
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
                control={dealAlertForm.control}
                name="sources"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sources*</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'facebook', label: 'Facebook Marketplace' },
                        { id: 'ebay', label: 'eBay' },
                        { id: 'offerup', label: 'OfferUp' },
                        { id: 'craigslist', label: 'Craigslist' },
                        { id: 'mercari', label: 'Mercari' }
                      ].map(source => (
                        <Button
                          key={source.id}
                          type="button"
                          variant={field.value.includes(source.id) ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            const updatedSources = field.value.includes(source.id)
                              ? field.value.filter(s => s !== source.id)
                              : [...field.value, source.id];
                            field.onChange(updatedSources);
                          }}
                          className="rounded-full"
                        >
                          {source.label}
                        </Button>
                      ))}
                    </div>
                    <FormDescription>
                      Select marketplaces to monitor
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={dealAlertForm.control}
                    name="instantNotification"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Push Notifications</FormLabel>
                          <FormDescription>
                            Get alerts in the app
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={dealAlertForm.control}
                    name="emailNotification"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Email Alerts</FormLabel>
                          <FormDescription>
                            Get alerts via email
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={dealAlertForm.control}
                  name="enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Enable Alert</FormLabel>
                        <FormDescription>
                          Start monitoring for deals immediately
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreatingAlert(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createDealAlert.isPending}
                >
                  {createDealAlert.isPending ? "Creating..." : "Create Alert"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}