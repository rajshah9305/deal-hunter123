import { useState } from "react";
import { useGenerateListing } from "@/hooks/use-ai";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { 
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Tag, Copy, Check, FileText, MessageSquare, PackageOpen,
  DollarSign, ArrowUpDown, Share, FileEdit, Plus, Camera,
  Sparkles, ClipboardCheck, ExternalLink
} from "lucide-react";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Interfaces
interface InventoryItem {
  id: number;
  title: string;
  description?: string;
  condition?: string;
  category?: string;
  purchasePrice: number;
  estimatedValue?: number;
  imageUrl?: string;
  tags?: string[];
}

interface ListingTemplate {
  id: number;
  name: string;
  category?: string;
  template: string;
  defaultPlatform?: string;
}

interface GeneratedListing {
  id: number;
  userId: number;
  inventoryItemId?: number;
  title: string;
  description: string;
  platform: string;
  suggestedPrice: number;
  images?: string[];
  tags: string[];
  published: boolean;
  publishedUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Listing generator form schema
const listingGeneratorSchema = z.object({
  inventoryItemId: z.coerce.number().optional(),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  condition: z.string().optional(),
  category: z.string().optional(),
  purchasePrice: z.coerce.number().optional(),
  estimatedValue: z.coerce.number().optional(),
  platform: z.string().min(1, "Platform is required"),
  templateId: z.coerce.number().optional(),
});

// Template form schema
const templateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  category: z.string().optional(),
  template: z.string().min(20, "Template must be at least 20 characters"),
  defaultPlatform: z.string().optional(),
});

export default function ListingGenerator() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("generate");
  const [isAddingTemplate, setIsAddingTemplate] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [generatedListing, setGeneratedListing] = useState<{
    title: string;
    description: string;
    suggestedPrice: number;
    tags: string[];
  } | null>(null);

  // AI listing generator mutation
  const generateListingMutation = useGenerateListing();

  // Form for generating a listing
  const listingForm = useForm<z.infer<typeof listingGeneratorSchema>>({
    resolver: zodResolver(listingGeneratorSchema),
    defaultValues: {
      inventoryItemId: undefined,
      title: "",
      description: "",
      condition: "",
      category: "",
      purchasePrice: undefined,
      estimatedValue: undefined,
      platform: "",
      templateId: undefined,
    },
  });

  // Form for adding a template
  const templateForm = useForm<z.infer<typeof templateSchema>>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: "",
      category: "",
      template: "",
      defaultPlatform: "",
    },
  });

  // Fetch inventory items
  const { data: inventoryItems = [] } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory/user/1"],
    onError: (error) => {
      toast({
        title: "Error fetching inventory",
        description: "Failed to load inventory items.",
        variant: "destructive",
      });
    }
  });

  // Fetch listing templates
  const { data: templates = [] } = useQuery<ListingTemplate[]>({
    queryKey: ["/api/listing-templates/user/1"],
    onError: (error) => {
      toast({
        title: "Error fetching templates",
        description: "Failed to load listing templates.",
        variant: "destructive",
      });
    }
  });

  // Fetch existing generated listings
  const { data: generatedListings = [] } = useQuery<GeneratedListing[]>({
    queryKey: ["/api/generated-listings/user/1"],
    onError: (error) => {
      toast({
        title: "Error fetching generated listings",
        description: "Failed to load generated listings.",
        variant: "destructive",
      });
    }
  });

  // Mutation for adding a template
  const addTemplate = useMutation({
    mutationFn: async (data: z.infer<typeof templateSchema>) => {
      const response = await apiRequest("POST", "/api/listing-templates", {
        ...data,
        userId: 1, // Using the demo user id for now
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Template added",
        description: "Your listing template has been saved.",
      });
      setIsAddingTemplate(false);
      templateForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/listing-templates/user/1"] });
    },
    onError: (error) => {
      toast({
        title: "Error adding template",
        description: "Failed to add listing template.",
        variant: "destructive",
      });
    },
  });

  // Mutation for saving a generated listing
  const saveGeneratedListing = useMutation({
    mutationFn: async (data: {
      inventoryItemId?: number;
      title: string;
      description: string;
      platform: string;
      suggestedPrice: number;
      tags: string[];
    }) => {
      const response = await apiRequest("POST", "/api/generated-listings", {
        ...data,
        userId: 1, // Using the demo user id for now
        published: false,
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Listing saved",
        description: "Your generated listing has been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/generated-listings/user/1"] });
    },
    onError: (error) => {
      toast({
        title: "Error saving listing",
        description: "Failed to save generated listing.",
        variant: "destructive",
      });
    },
  });

  // Mutation for marking a listing as published
  const markAsPublished = useMutation({
    mutationFn: async ({ id, url }: { id: number, url?: string }) => {
      const response = await apiRequest("PATCH", `/api/generated-listings/${id}`, {
        published: true,
        publishedUrl: url || "",
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Listing updated",
        description: "Listing marked as published.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/generated-listings/user/1"] });
    },
    onError: (error) => {
      toast({
        title: "Error updating listing",
        description: "Failed to update listing status.",
        variant: "destructive",
      });
    },
  });

  // Select an inventory item
  const handleItemSelect = (itemId: string) => {
    const id = parseInt(itemId);
    if (id === 0) {
      setSelectedItem(null);
      listingForm.setValue("inventoryItemId", undefined);
      listingForm.setValue("title", "");
      listingForm.setValue("description", "");
      listingForm.setValue("condition", "");
      listingForm.setValue("category", "");
      listingForm.setValue("purchasePrice", undefined);
      listingForm.setValue("estimatedValue", undefined);
      return;
    }
    
    const item = inventoryItems.find(i => i.id === id);
    if (item) {
      setSelectedItem(item);
      listingForm.setValue("inventoryItemId", item.id);
      listingForm.setValue("title", item.title);
      listingForm.setValue("description", item.description || "");
      listingForm.setValue("condition", item.condition || "");
      listingForm.setValue("category", item.category || "");
      listingForm.setValue("purchasePrice", item.purchasePrice);
      listingForm.setValue("estimatedValue", item.estimatedValue);
    }
  };

  // Select a template
  const handleTemplateSelect = (templateId: string) => {
    const id = parseInt(templateId);
    listingForm.setValue("templateId", id === 0 ? undefined : id);
    
    if (id !== 0) {
      const template = templates.find(t => t.id === id);
      if (template && template.defaultPlatform) {
        listingForm.setValue("platform", template.defaultPlatform);
      }
    }
  };

  // Generate a listing
  const handleGenerateListing = async (values: z.infer<typeof listingGeneratorSchema>) => {
    try {
      const selectedTemplate = values.templateId 
        ? templates.find(t => t.id === values.templateId)?.template 
        : undefined;
      
      const result = await generateListingMutation.mutateAsync({
        item: {
          title: values.title,
          description: values.description,
          condition: values.condition,
          category: values.category,
          purchasePrice: values.purchasePrice,
          estimatedValue: values.estimatedValue,
          tags: selectedItem?.tags,
        },
        platform: values.platform,
        template: selectedTemplate,
      });
      
      setGeneratedListing(result);
      toast({
        title: "Listing generated",
        description: "AI has generated a listing based on your information.",
      });
    } catch (error) {
      console.error("Error generating listing:", error);
      toast({
        title: "Generation failed",
        description: "Failed to generate listing. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Save the template
  const handleSaveTemplate = (values: z.infer<typeof templateSchema>) => {
    addTemplate.mutate(values);
  };

  // Copy text to clipboard
  const copyToClipboard = (text: string, type: 'title' | 'description' | 'tags') => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} copied`,
        description: "Copied to clipboard successfully.",
      });
    });
  };

  // Save the generated listing
  const handleSaveListing = () => {
    if (!generatedListing) return;
    
    saveGeneratedListing.mutate({
      inventoryItemId: listingForm.getValues().inventoryItemId,
      title: generatedListing.title,
      description: generatedListing.description,
      platform: listingForm.getValues().platform,
      suggestedPrice: generatedListing.suggestedPrice,
      tags: generatedListing.tags,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Listing Generator</h2>
          <p className="text-muted-foreground">
            Create optimized listings for different platforms with AI
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            className="gap-2" 
            onClick={() => setActiveTab("generate")}
          >
            <Sparkles className="h-4 w-4" />
            Generate Listing
          </Button>
          <Button 
            variant="outline" 
            className="gap-2" 
            onClick={() => setActiveTab("templates")}
          >
            <FileText className="h-4 w-4" />
            Templates
          </Button>
          <Button 
            variant="outline" 
            className="gap-2" 
            onClick={() => setActiveTab("saved")}
          >
            <ClipboardCheck className="h-4 w-4" />
            Saved Listings
          </Button>
        </div>
      </div>

      {/* Mobile tabs */}
      <div className="block sm:hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="generate">Generate</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Generate Listing Tab */}
      {activeTab === "generate" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Listing Generator Form */}
          <Card>
            <CardHeader>
              <CardTitle>Generate Listing</CardTitle>
              <CardDescription>
                Create an optimized product listing with AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...listingForm}>
                <form onSubmit={listingForm.handleSubmit(handleGenerateListing)} className="space-y-4">
                  <FormField
                    control={listingForm.control}
                    name="inventoryItemId"
                    render={({ field: { value, onChange, ...field } }) => (
                      <FormItem>
                        <FormLabel>Select Inventory Item</FormLabel>
                        <Select 
                          value={value?.toString() || "0"} 
                          onValueChange={(val) => {
                            onChange(val === "0" ? undefined : parseInt(val));
                            handleItemSelect(val);
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an item or enter details manually" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="0">Enter details manually</SelectItem>
                            {inventoryItems.map((item) => (
                              <SelectItem key={item.id} value={item.id.toString()}>
                                {item.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose an item from your inventory or enter details manually
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={listingForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Title*</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Nintendo Switch Console with Neon Joy-Cons" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={listingForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Product description with details, features, etc." 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={listingForm.control}
                      name="condition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Condition</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
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
                      control={listingForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Electronics, Clothing" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={listingForm.control}
                      name="purchasePrice"
                      render={({ field: { onChange, ...field } }) => (
                        <FormItem>
                          <FormLabel>Purchase Price ($)</FormLabel>
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
                      control={listingForm.control}
                      name="estimatedValue"
                      render={({ field: { onChange, ...field } }) => (
                        <FormItem>
                          <FormLabel>Estimated Value ($)</FormLabel>
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
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={listingForm.control}
                      name="platform"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Platform*</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select platform" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ebay">eBay</SelectItem>
                              <SelectItem value="facebook">Facebook Marketplace</SelectItem>
                              <SelectItem value="amazon">Amazon</SelectItem>
                              <SelectItem value="etsy">Etsy</SelectItem>
                              <SelectItem value="mercari">Mercari</SelectItem>
                              <SelectItem value="poshmark">Poshmark</SelectItem>
                              <SelectItem value="craigslist">Craigslist</SelectItem>
                              <SelectItem value="offerup">OfferUp</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={listingForm.control}
                      name="templateId"
                      render={({ field: { value, onChange, ...field } }) => (
                        <FormItem>
                          <FormLabel>Use Template</FormLabel>
                          <Select 
                            value={value?.toString() || "0"} 
                            onValueChange={(val) => {
                              onChange(val === "0" ? undefined : parseInt(val));
                              handleTemplateSelect(val);
                            }}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a template (optional)" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="0">No template</SelectItem>
                              {templates.map((template) => (
                                <SelectItem key={template.id} value={template.id.toString()}>
                                  {template.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Apply a saved template to this listing
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={generateListingMutation.isPending}
                  >
                    {generateListingMutation.isPending ? (
                      <>
                        <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Listing
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Generated Listing Result */}
          <Card>
            <CardHeader>
              <CardTitle>Generated Listing</CardTitle>
              <CardDescription>
                AI-optimized listing for {listingForm.getValues().platform || "selected platform"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generateListingMutation.isPending ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
                  <p className="text-muted-foreground">Generating optimized listing...</p>
                </div>
              ) : generatedListing ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">Title</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 gap-1"
                        onClick={() => copyToClipboard(generatedListing.title, 'title')}
                      >
                        <Copy className="h-3.5 w-3.5" />
                        Copy
                      </Button>
                    </div>
                    <div className="p-3 border rounded-md">
                      <p>{generatedListing.title}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">Description</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 gap-1"
                        onClick={() => copyToClipboard(generatedListing.description, 'description')}
                      >
                        <Copy className="h-3.5 w-3.5" />
                        Copy
                      </Button>
                    </div>
                    <div className="p-3 border rounded-md prose prose-sm max-w-none">
                      <div dangerouslySetInnerHTML={{ 
                        __html: generatedListing.description
                          .replace(/\n/g, '<br/>')
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      }} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">Suggested Price</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 gap-1"
                        onClick={() => copyToClipboard(`$${generatedListing.suggestedPrice.toFixed(2)}`, 'title')}
                      >
                        <Copy className="h-3.5 w-3.5" />
                        Copy
                      </Button>
                    </div>
                    <div className="p-3 border rounded-md">
                      <p className="text-xl font-bold text-green-600">${generatedListing.suggestedPrice.toFixed(2)}</p>
                      
                      {listingForm.getValues().purchasePrice && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Potential profit: ${(generatedListing.suggestedPrice - listingForm.getValues().purchasePrice).toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">Tags</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 gap-1"
                        onClick={() => copyToClipboard(generatedListing.tags.join(', '), 'tags')}
                      >
                        <Copy className="h-3.5 w-3.5" />
                        Copy
                      </Button>
                    </div>
                    <div className="p-3 border rounded-md">
                      <div className="flex flex-wrap gap-1">
                        {generatedListing.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full mt-6" 
                    onClick={handleSaveListing}
                    disabled={saveGeneratedListing.isPending}
                  >
                    {saveGeneratedListing.isPending ? "Saving..." : "Save Listing"}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16">
                  <MessageSquare className="h-16 w-16 text-muted-foreground/60 mb-4" />
                  <h3 className="text-lg font-medium">No listing generated yet</h3>
                  <p className="text-center text-muted-foreground mt-2 mb-4 max-w-md">
                    Fill out the form and generate a listing to see the AI-optimized result here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === "templates" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Listing Templates</h3>
            <Button 
              variant="default" 
              size="sm" 
              className="gap-1"
              onClick={() => {
                setIsAddingTemplate(true);
                templateForm.reset();
              }}
            >
              <Plus className="h-4 w-4" />
              Add Template
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>
                    {template.category || "All categories"}
                    {template.defaultPlatform && (
                      <Badge variant="outline" className="ml-2">
                        {template.defaultPlatform}
                      </Badge>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md p-3 bg-muted/50 h-24 overflow-y-auto text-sm">
                    {template.template}
                  </div>
                </CardContent>
                <CardFooter className="pt-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-1"
                    onClick={() => {
                      // Go to generate tab with this template selected
                      setActiveTab("generate");
                      listingForm.setValue("templateId", template.id);
                      if (template.defaultPlatform) {
                        listingForm.setValue("platform", template.defaultPlatform);
                      }
                    }}
                  >
                    <FileEdit className="h-4 w-4" />
                    Use Template
                  </Button>
                </CardFooter>
              </Card>
            ))}
            
            {templates.length === 0 && (
              <Card className="md:col-span-2 lg:col-span-3">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-16 w-16 text-muted-foreground/60 mb-4" />
                  <h3 className="text-lg font-medium">No templates yet</h3>
                  <p className="text-center text-muted-foreground mt-2 mb-4">
                    Create templates to quickly generate optimized listings for your products
                  </p>
                  <Button 
                    onClick={() => {
                      setIsAddingTemplate(true);
                      templateForm.reset();
                    }}
                  >
                    Create Your First Template
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Saved Listings Tab */}
      {activeTab === "saved" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generatedListings.map((listing) => {
              const inventoryItem = inventoryItems.find(i => i.id === listing.inventoryItemId);
              
              return (
                <Card key={listing.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{listing.title}</CardTitle>
                        <CardDescription>
                          <Badge variant="outline" className="mr-1">
                            {listing.platform}
                          </Badge>
                          {listing.published && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Published
                            </Badge>
                          )}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="text-green-600">
                        ${listing.suggestedPrice.toFixed(2)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="text-sm line-clamp-3 text-muted-foreground">
                      {listing.description.substring(0, 150)}...
                    </div>
                    
                    {inventoryItem && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                        <PackageOpen className="h-3 w-3" />
                        <span>From inventory: {inventoryItem.title}</span>
                      </div>
                    )}
                    
                    <div className="mt-2 flex flex-wrap gap-1">
                      {listing.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {listing.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{listing.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-1">
                    <div className="flex justify-between w-full">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="gap-1"
                        onClick={() => {
                          navigator.clipboard.writeText(listing.description);
                          toast({
                            title: "Description copied",
                            description: "Listing description copied to clipboard.",
                          });
                        }}
                      >
                        <Copy className="h-4 w-4" />
                        Copy
                      </Button>
                      
                      {!listing.published ? (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="gap-1"
                          onClick={() => {
                            // Prompt for URL
                            const url = window.prompt("Enter the URL where you published this listing (optional):");
                            markAsPublished.mutate({ id: listing.id, url: url || undefined });
                          }}
                        >
                          <Share className="h-4 w-4" />
                          Mark Published
                        </Button>
                      ) : (
                        listing.publishedUrl && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="gap-1"
                            asChild
                          >
                            <a href={listing.publishedUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                              View
                            </a>
                          </Button>
                        )
                      )}
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
            
            {generatedListings.length === 0 && (
              <Card className="md:col-span-2 lg:col-span-3">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <ClipboardCheck className="h-16 w-16 text-muted-foreground/60 mb-4" />
                  <h3 className="text-lg font-medium">No saved listings</h3>
                  <p className="text-center text-muted-foreground mt-2 mb-4">
                    Generate and save listings to keep track of your product copy
                  </p>
                  <Button 
                    onClick={() => setActiveTab("generate")}
                  >
                    Generate Your First Listing
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Add Template Dialog */}
      <Dialog open={isAddingTemplate} onOpenChange={setIsAddingTemplate}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Listing Template</DialogTitle>
            <DialogDescription>
              Create a template for generating listings with consistent structure
            </DialogDescription>
          </DialogHeader>
          
          <Form {...templateForm}>
            <form onSubmit={templateForm.handleSubmit(handleSaveTemplate)} className="space-y-4">
              <FormField
                control={templateForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Electronics Standard Template" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={templateForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Electronics, Clothing" {...field} />
                      </FormControl>
                      <FormDescription>
                        Specify a category this template is designed for
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={templateForm.control}
                  name="defaultPlatform"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Platform</FormLabel>
                      <Select value={field.value || ""} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select platform" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          <SelectItem value="ebay">eBay</SelectItem>
                          <SelectItem value="facebook">Facebook Marketplace</SelectItem>
                          <SelectItem value="amazon">Amazon</SelectItem>
                          <SelectItem value="etsy">Etsy</SelectItem>
                          <SelectItem value="mercari">Mercari</SelectItem>
                          <SelectItem value="poshmark">Poshmark</SelectItem>
                          <SelectItem value="craigslist">Craigslist</SelectItem>
                          <SelectItem value="offerup">OfferUp</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Platform this template is designed for
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={templateForm.control}
                name="template"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template*</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter your listing template here..." 
                        className="min-h-[200px] font-mono text-sm"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Create your template with placeholders for product details.
                      The AI will use this as a guide for generating listings.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="bg-muted/50 p-4 rounded-md space-y-2">
                <h4 className="font-medium">Template Example</h4>
                <p className="text-sm text-muted-foreground">
                  📱 Perfect [PRODUCT] for Sale! 📱<br />
                  <br />
                  🌟 [CONDITION] condition<br />
                  💰 Great value for a quality item<br />
                  ✅ Features:<br />
                  - [FEATURE 1]<br />
                  - [FEATURE 2]<br />
                  - [FEATURE 3]<br />
                  <br />
                  📦 What's included:<br />
                  - [ITEM 1]<br />
                  - [ITEM 2]<br />
                  <br />
                  💬 Message me with any questions!
                </p>
              </div>
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddingTemplate(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={addTemplate.isPending}
                >
                  {addTemplate.isPending ? "Saving..." : "Save Template"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}