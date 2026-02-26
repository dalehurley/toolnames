import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LinkIcon,
  Palette,
  Type,
  Square,
  Box,
  FileCode,
  Check,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { TokenCategory } from "../hooks/designSystem.types";

// Define the component properties that can have tokens applied
type ComponentProperty =
  | "text-color"
  | "background-color"
  | "border-color"
  | "border-radius"
  | "padding"
  | "margin"
  | "font-size"
  | "font-family"
  | "shadow"
  | "width"
  | "height";

// Define component types that can have tokens applied
type ComponentType =
  | "button"
  | "card"
  | "input"
  | "badge"
  | "alert"
  | "avatar"
  | "dialog";

// Token mapping for a component
interface TokenMapping {
  id: string;
  componentType: ComponentType;
  componentId: string;
  property: ComponentProperty;
  tokenId: string;
  themeId: string;
  appliedAt: number;
}

// Token with additional information for display
interface TokenWithDetails {
  id: string;
  name: string;
  value: string;
  category: TokenCategory;
  description?: string;
}

// Component with additional information for display
interface ComponentWithDetails {
  id: string;
  name: string;
  type: ComponentType;
  previewCode?: string;
}

interface TokenComponentLinkerProps {
  activeThemeId: string | null;
  tokens: TokenWithDetails[];
  components: ComponentWithDetails[];
  onApplyToken: (
    componentId: string,
    property: ComponentProperty,
    tokenId: string
  ) => boolean;
  onRemoveToken: (mappingId: string) => boolean;
  existingMappings: TokenMapping[];
}

// Helper to determine which token categories apply to which component properties
const getValidCategoriesForProperty = (
  property: ComponentProperty
): TokenCategory[] => {
  switch (property) {
    case "text-color":
    case "background-color":
    case "border-color":
      return ["color"];
    case "border-radius":
      return ["border"];
    case "padding":
    case "margin":
    case "width":
    case "height":
      return ["spacing"];
    case "font-size":
    case "font-family":
      return ["typography"];
    case "shadow":
      return ["shadow"];
    default:
      return [];
  }
};

// Property display names
const propertyDisplayNames: Record<ComponentProperty, string> = {
  "text-color": "Text Color",
  "background-color": "Background Color",
  "border-color": "Border Color",
  "border-radius": "Border Radius",
  padding: "Padding",
  margin: "Margin",
  "font-size": "Font Size",
  "font-family": "Font Family",
  shadow: "Shadow",
  width: "Width",
  height: "Height",
};

// Token category icons
const TokenCategoryIcons: Record<TokenCategory, React.ReactNode> = {
  color: <Palette size={16} />,
  typography: <Type size={16} />,
  spacing: <Square size={16} />,
  border: <Box size={16} />,
  shadow: <Box size={16} />,
  breakpoint: <FileCode size={16} />,
};

export const TokenComponentLinker: React.FC<TokenComponentLinkerProps> = ({
  activeThemeId,
  tokens,
  components,
  onApplyToken,
  onRemoveToken,
  existingMappings,
}) => {
  // Local state
  const [selectedComponent, setSelectedComponent] = useState<string>("");
  const [selectedProperty, setSelectedProperty] =
    useState<ComponentProperty>("background-color");
  const [selectedToken, setSelectedToken] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<TokenCategory | "all">(
    "all"
  );
  const [activeTab, setActiveTab] = useState<"apply" | "mappings">("apply");

  // Reset selections when active theme changes
  useEffect(() => {
    setSelectedToken("");
  }, [activeThemeId]);

  // Get valid tokens for the selected property
  const getValidTokensForProperty = (): TokenWithDetails[] => {
    if (!selectedProperty) return [];

    const validCategories = getValidCategoriesForProperty(selectedProperty);
    return tokens.filter((token) => validCategories.includes(token.category));
  };

  // Get properties available for the selected component
  const getAvailablePropertiesForComponent = (): ComponentProperty[] => {
    if (!selectedComponent) return [];

    const component = components.find((c) => c.id === selectedComponent);
    if (!component) return [];

    // Different component types have different applicable properties
    switch (component.type) {
      case "button":
        return [
          "text-color",
          "background-color",
          "border-color",
          "border-radius",
          "padding",
          "font-size",
        ];
      case "card":
        return [
          "background-color",
          "border-color",
          "border-radius",
          "padding",
          "shadow",
        ];
      case "input":
        return [
          "text-color",
          "background-color",
          "border-color",
          "border-radius",
          "padding",
          "font-size",
        ];
      case "badge":
        return [
          "text-color",
          "background-color",
          "border-radius",
          "padding",
          "font-size",
        ];
      case "alert":
        return [
          "text-color",
          "background-color",
          "border-color",
          "border-radius",
          "padding",
        ];
      case "avatar":
        return [
          "background-color",
          "border-color",
          "border-radius",
          "width",
          "height",
        ];
      case "dialog":
        return [
          "background-color",
          "border-color",
          "border-radius",
          "padding",
          "shadow",
          "width",
        ];
      default:
        return [];
    }
  };

  // Apply token to component
  const handleApplyToken = () => {
    if (!selectedComponent || !selectedProperty || !selectedToken) {
      toast.error("Please select a component, property, and token");
      return;
    }

    const success = onApplyToken(
      selectedComponent,
      selectedProperty,
      selectedToken
    );

    if (success) {
      const component = components.find((c) => c.id === selectedComponent);
      const token = tokens.find((t) => t.id === selectedToken);

      toast.success("Token Applied", {
        description: `Applied ${token?.name} to ${component?.name}'s ${propertyDisplayNames[selectedProperty]}`,
      });

      // Switch to mappings tab to show the new mapping
      setActiveTab("mappings");
    } else {
      toast.error("Failed to Apply Token", {
        description: "There was an error applying the token to the component.",
      });
    }
  };

  // Remove token mapping
  const handleRemoveMapping = (
    mappingId: string,
    componentName: string,
    propertyName: string,
    tokenName: string
  ) => {
    const success = onRemoveToken(mappingId);

    if (success) {
      toast.success("Mapping Removed", {
        description: `Removed ${tokenName} from ${componentName}'s ${propertyName}`,
      });
    } else {
      toast.error("Failed to Remove Mapping", {
        description: "There was an error removing the token mapping.",
      });
    }
  };

  // Get filtered tokens based on category
  const getFilteredTokens = () => {
    const validTokens = getValidTokensForProperty();

    if (filterCategory === "all") {
      return validTokens;
    }

    return validTokens.filter((token) => token.category === filterCategory);
  };

  // Find component by ID
  const getComponentById = (id: string) => {
    return components.find((c) => c.id === id);
  };

  // Find token by ID
  const getTokenById = (id: string) => {
    return tokens.find((t) => t.id === id);
  };

  // Check if token is already applied to a component property
  const isTokenAppliedToProperty = (componentId: string, property: string) => {
    return existingMappings.some(
      (mapping) =>
        mapping.componentId === componentId && mapping.property === property
    );
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <LinkIcon size={18} />
          <span>Design Token Linker</span>
        </CardTitle>
        <CardDescription>
          Apply design tokens to components for consistent styling
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue="apply"
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "apply" | "mappings")}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="apply">Apply Tokens</TabsTrigger>
            <TabsTrigger value="mappings">View Mappings</TabsTrigger>
          </TabsList>

          {/* Apply Tokens Tab */}
          <TabsContent value="apply" className="space-y-6">
            {tokens.length === 0 ? (
              <div className="text-center p-6 border border-dashed rounded-md">
                <p className="text-gray-500">
                  No tokens available in this theme. Create tokens first.
                </p>
              </div>
            ) : components.length === 0 ? (
              <div className="text-center p-6 border border-dashed rounded-md">
                <p className="text-gray-500">
                  No components available. Create components first.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Component & Property Selection */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="component-select">Select Component</Label>
                    <Select
                      value={selectedComponent}
                      onValueChange={setSelectedComponent}
                    >
                      <SelectTrigger id="component-select">
                        <SelectValue placeholder="Choose a component" />
                      </SelectTrigger>
                      <SelectContent>
                        {components.map((component) => (
                          <SelectItem key={component.id} value={component.id}>
                            {component.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedComponent && (
                    <div className="space-y-2">
                      <Label htmlFor="property-select">Select Property</Label>
                      <Select
                        value={selectedProperty}
                        onValueChange={(value) =>
                          setSelectedProperty(value as ComponentProperty)
                        }
                      >
                        <SelectTrigger id="property-select">
                          <SelectValue placeholder="Choose a property" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailablePropertiesForComponent().map(
                            (property) => (
                              <SelectItem
                                key={property}
                                value={property}
                                disabled={isTokenAppliedToProperty(
                                  selectedComponent,
                                  property
                                )}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span>{propertyDisplayNames[property]}</span>
                                  {isTokenAppliedToProperty(
                                    selectedComponent,
                                    property
                                  ) && (
                                    <span className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">
                                      Applied
                                    </span>
                                  )}
                                </div>
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Component Preview (placeholder) */}
                  {selectedComponent && (
                    <div className="border rounded-md p-4 flex justify-center items-center h-32">
                      <div className="text-center">
                        <div className="font-medium">
                          {getComponentById(selectedComponent)?.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          Component Preview
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Token Selection */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label>Available Tokens</Label>
                    <Select
                      value={filterCategory}
                      onValueChange={(value) =>
                        setFilterCategory(value as TokenCategory | "all")
                      }
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {[
                          "color",
                          "typography",
                          "spacing",
                          "border",
                          "shadow",
                        ].map((category) => (
                          <SelectItem key={category} value={category}>
                            <div className="flex items-center gap-2">
                              {TokenCategoryIcons[category as TokenCategory]}
                              <span>{category}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="border rounded-md overflow-hidden">
                    <ScrollArea className="h-[240px]">
                      <div className="p-1">
                        {getFilteredTokens().length > 0 ? (
                          <div className="grid grid-cols-1 gap-1">
                            {getFilteredTokens().map((token) => (
                              <div
                                key={token.id}
                                className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${
                                  selectedToken === token.id
                                    ? "bg-blue-100 border-blue-300 border"
                                    : "hover:bg-gray-100 border border-transparent"
                                }`}
                                onClick={() => setSelectedToken(token.id)}
                              >
                                <div className="flex-1 flex items-center gap-2">
                                  {token.category === "color" ? (
                                    <div
                                      className="w-4 h-4 rounded-full"
                                      style={{ backgroundColor: token.value }}
                                    />
                                  ) : (
                                    TokenCategoryIcons[token.category]
                                  )}
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium">
                                      {token.name}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {token.value}
                                    </span>
                                  </div>
                                </div>
                                {selectedToken === token.id && (
                                  <Check size={16} className="text-blue-600" />
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 text-center text-gray-500">
                            <p>No matching tokens for this property.</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>

                  <Button
                    onClick={handleApplyToken}
                    disabled={
                      !selectedComponent ||
                      !selectedToken ||
                      isTokenAppliedToProperty(
                        selectedComponent,
                        selectedProperty
                      )
                    }
                    className="w-full mt-4"
                  >
                    Apply Token to Component
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* View Mappings Tab */}
          <TabsContent value="mappings" className="space-y-4">
            {existingMappings.length === 0 ? (
              <div className="text-center p-6 border border-dashed rounded-md">
                <p className="text-gray-500">
                  No token mappings yet. Apply tokens to components from the
                  "Apply Tokens" tab.
                </p>
              </div>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Component</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Token</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {existingMappings.map((mapping) => {
                      const component = getComponentById(mapping.componentId);
                      const token = getTokenById(mapping.tokenId);

                      if (!component || !token) return null;

                      return (
                        <TableRow key={mapping.id}>
                          <TableCell className="font-medium">
                            {component.name}
                          </TableCell>
                          <TableCell>
                            {propertyDisplayNames[mapping.property]}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              {token.category === "color" ? (
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: token.value }}
                                />
                              ) : (
                                TokenCategoryIcons[token.category]
                              )}
                              {token.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-gray-600">
                              {token.value}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() =>
                                handleRemoveMapping(
                                  mapping.id,
                                  component.name,
                                  propertyDisplayNames[mapping.property],
                                  token.name
                                )
                              }
                            >
                              <XCircle size={16} />
                              <span className="sr-only">Remove</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-3 bg-blue-50 border border-blue-100 rounded-md">
          <h4 className="text-sm font-medium text-blue-800 mb-1">
            About Design Token Linking
          </h4>
          <p className="text-xs text-blue-700">
            Applying design tokens to components ensures consistent styling
            across your application. When you update a token value, all linked
            components will automatically reflect the change. This creates a
            single source of truth for your design system.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
