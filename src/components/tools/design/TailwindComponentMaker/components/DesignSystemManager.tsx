import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  PlusCircle,
  Trash2,
  Download,
  Upload,
  Edit2,
  FileCode,
  Palette,
  Type,
  Square,
  Box,
  Moon,
  Sun,
} from "lucide-react";

import { useDesignSystem } from "../hooks/useDesignSystem";
import { TokenCategory } from "../hooks/designSystem.types";
import { ColorPaletteGenerator } from "./ColorPaletteGenerator";
import { TokenComponentLinker } from "./TokenComponentLinker";

// Import type definitions to resolve type issues
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

type ComponentType =
  | "button"
  | "card"
  | "input"
  | "badge"
  | "alert"
  | "avatar"
  | "dialog";

// Token type icons
const TokenCategoryIcons: Record<TokenCategory, React.ReactNode> = {
  color: <Palette size={16} />,
  typography: <Type size={16} />,
  spacing: <Square size={16} />,
  border: <Box size={16} />,
  shadow: <Box size={16} />,
  breakpoint: <FileCode size={16} />,
};

export const DesignSystemManager: React.FC = () => {
  const {
    designSystems,
    activeDesignSystemId,
    activeThemeId,
    setActiveDesignSystemId,
    setActiveThemeId,
    getActiveDesignSystem,
    getActiveTheme,
    createDesignSystem,
    createTheme,
    addToken,
    deleteToken,
    exportDesignSystem,
    importDesignSystem,
    generateTailwindConfig,
    tokenMappings,
    applyTokenToComponent,
    removeTokenMapping,
  } = useDesignSystem();

  // Local state
  const [newSystemName, setNewSystemName] = useState("");
  const [newSystemDescription, setNewSystemDescription] = useState("");
  const [newThemeName, setNewThemeName] = useState("");
  const [baseThemeId, setBaseThemeId] = useState<string>("");

  // Token creation state
  const [newTokenName, setNewTokenName] = useState("");
  const [newTokenValue, setNewTokenValue] = useState("");
  const [newTokenCategory, setNewTokenCategory] =
    useState<TokenCategory>("color");
  const [newTokenDescription, setNewTokenDescription] = useState("");

  // Dialog states
  const [isNewSystemDialogOpen, setIsNewSystemDialogOpen] = useState(false);
  const [isNewThemeDialogOpen, setIsNewThemeDialogOpen] = useState(false);
  const [isNewTokenDialogOpen, setIsNewTokenDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  // Get active data
  const activeSystem = getActiveDesignSystem();
  const activeTheme = getActiveTheme();

  // Mock components (in a real implementation, would come from another hook)
  const mockComponents = [
    { id: "btn-1", name: "Primary Button", type: "button" as ComponentType },
    { id: "card-1", name: "Content Card", type: "card" as ComponentType },
    { id: "input-1", name: "Text Input", type: "input" as ComponentType },
    { id: "badge-1", name: "Status Badge", type: "badge" as ComponentType },
  ];

  // Handle creating a new design system
  const handleCreateSystem = () => {
    if (!newSystemName.trim()) {
      toast.error("System name is required");
      return;
    }

    try {
      const id = createDesignSystem(newSystemName, newSystemDescription);
      setNewSystemName("");
      setNewSystemDescription("");
      setIsNewSystemDialogOpen(false);

      toast.success("Design System Created", {
        description: `${newSystemName} has been created successfully.`,
      });

      return id;
    } catch {
      toast.error("Error Creating Design System", {
        description: "There was an error creating your design system.",
      });
    }
  };

  // Handle creating a new theme
  const handleCreateTheme = () => {
    if (!newThemeName.trim()) {
      toast.error("Theme name is required");
      return;
    }

    try {
      const id = createTheme(newThemeName, baseThemeId || undefined);
      setNewThemeName("");
      setBaseThemeId("");
      setIsNewThemeDialogOpen(false);

      toast.success("Theme Created", {
        description: `${newThemeName} has been created successfully.`,
      });

      return id;
    } catch {
      toast.error("Error Creating Theme", {
        description: "There was an error creating your theme.",
      });
    }
  };

  // Handle adding a new token
  const handleAddToken = () => {
    if (!newTokenName.trim()) {
      toast.error("Token name is required");
      return;
    }

    if (!newTokenValue.trim()) {
      toast.error("Token value is required");
      return;
    }

    if (!activeThemeId) {
      toast.error("No active theme selected");
      return;
    }

    try {
      const id = addToken(
        activeThemeId,
        newTokenName,
        newTokenValue,
        newTokenCategory,
        newTokenDescription || undefined
      );

      setNewTokenName("");
      setNewTokenValue("");
      setNewTokenDescription("");
      setIsNewTokenDialogOpen(false);

      toast.success("Token Added", {
        description: `${newTokenName} has been added to the theme.`,
      });

      return id;
    } catch {
      toast.error("Error Adding Token", {
        description: "There was an error adding your token.",
      });
    }
  };

  // Handle deleting a token
  const handleDeleteToken = (tokenId: string, tokenName: string) => {
    if (!activeThemeId) {
      toast.error("No active theme selected");
      return;
    }

    try {
      const success = deleteToken(activeThemeId, tokenId);

      if (success) {
        toast.success("Token Deleted", {
          description: `${tokenName} has been removed from the theme.`,
        });
      } else {
        toast.error("Error Deleting Token", {
          description: "The token could not be deleted.",
        });
      }
    } catch {
      toast.error("Error Deleting Token", {
        description: "There was an error deleting your token.",
      });
    }
  };

  // Handle exporting as Tailwind config
  const handleExportTailwindConfig = () => {
    if (!activeDesignSystemId) {
      toast.error("No design system selected");
      return;
    }

    try {
      const config = generateTailwindConfig();

      // Create a blob and download
      const blob = new Blob([config], { type: "text/javascript" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tailwind.config.js`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Configuration Exported", {
        description: "Tailwind configuration has been downloaded.",
      });
    } catch {
      toast.error("Export Failed", {
        description: "There was an error exporting the Tailwind configuration.",
      });
    }
  };

  // Handle file import
  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const success = await importDesignSystem(file);

      if (success) {
        setIsImportDialogOpen(false);
        toast.success("Design System Imported", {
          description: "The design system has been imported successfully.",
        });
      } else {
        toast.error("Import Failed", {
          description: "The file could not be imported. Check the file format.",
        });
      }
    } catch {
      toast.error("Import Error", {
        description: "There was an error importing the design system.",
      });
    }

    // Reset the file input
    e.target.value = "";
  };

  // Handle adding a token from the color palette generator
  const handleAddTokenFromPalette = (
    name: string,
    value: string,
    category: TokenCategory,
    description?: string
  ) => {
    if (!activeThemeId) {
      return null;
    }

    return addToken(activeThemeId, name, value, category, description);
  };

  // Handle applying token to component
  const handleApplyToken = (
    componentId: string,
    property: ComponentProperty,
    tokenId: string
  ) => {
    if (!activeThemeId) return false;

    // Find the component
    const component = mockComponents.find((c) => c.id === componentId);
    if (!component) return false;

    // Use the hook's function to apply the token
    return applyTokenToComponent(
      componentId,
      component.type,
      property,
      tokenId
    );
  };

  // Handle removing token mapping
  const handleRemoveTokenMapping = (mappingId: string) => {
    return removeTokenMapping(mappingId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Design System Manager</h2>
          <p className="text-gray-500">
            Create and manage design tokens and themes
          </p>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsImportDialogOpen(true)}
            className="flex items-center gap-1"
          >
            <Upload size={16} />
            <span>Import</span>
          </Button>

          {activeSystem && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportDesignSystem(activeDesignSystemId || "")}
              className="flex items-center gap-1"
            >
              <Download size={16} />
              <span>Export</span>
            </Button>
          )}

          <Button
            size="sm"
            onClick={() => setIsNewSystemDialogOpen(true)}
            className="flex items-center gap-1"
          >
            <PlusCircle size={16} />
            <span>New System</span>
          </Button>
        </div>
      </div>

      {designSystems.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[200px] text-center">
            <p className="text-gray-500 mb-6">No design systems found</p>
            <Button
              onClick={() => setIsNewSystemDialogOpen(true)}
              className="flex items-center gap-1"
            >
              <PlusCircle size={16} />
              <span>Create Your First Design System</span>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* System selector */}
          <div className="pb-4 border-b">
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="system-select">Select Design System</Label>
              {activeSystem && (
                <div className="text-sm text-gray-500">
                  Created:{" "}
                  {new Date(activeSystem.createdAt).toLocaleDateString()}
                </div>
              )}
            </div>

            <Select
              value={activeDesignSystemId || ""}
              onValueChange={setActiveDesignSystemId}
            >
              <SelectTrigger id="system-select" className="w-full">
                <SelectValue placeholder="Select a design system" />
              </SelectTrigger>
              <SelectContent>
                {designSystems.map((system) => (
                  <SelectItem key={system.id} value={system.id}>
                    {system.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {activeSystem?.description && (
              <p className="mt-2 text-sm text-gray-500">
                {activeSystem.description}
              </p>
            )}
          </div>

          {activeSystem && (
            <Tabs defaultValue="tokens" className="w-full">
              <TabsList className="grid grid-cols-5 mb-4">
                <TabsTrigger value="tokens">Tokens</TabsTrigger>
                <TabsTrigger value="themes">Themes</TabsTrigger>
                <TabsTrigger value="colors">Color Palette</TabsTrigger>
                <TabsTrigger value="component-tokens">
                  Component Tokens
                </TabsTrigger>
                <TabsTrigger value="export">Export</TabsTrigger>
              </TabsList>

              <TabsContent value="tokens" className="space-y-4">
                {/* Theme selector */}
                <div className="flex items-center justify-between pb-4">
                  <div className="space-y-1 flex-1">
                    <Label htmlFor="theme-select">Current Theme</Label>
                    <Select
                      value={activeThemeId || ""}
                      onValueChange={setActiveThemeId}
                    >
                      <SelectTrigger
                        id="theme-select"
                        className="w-full md:w-[300px]"
                      >
                        <SelectValue placeholder="Select a theme" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeSystem.themes.map((theme) => (
                          <SelectItem key={theme.id} value={theme.id}>
                            <div className="flex items-center gap-2">
                              {theme.name}
                              {theme.isDefault && (
                                <span className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">
                                  Default
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsNewThemeDialogOpen(true)}
                      className="flex items-center gap-1"
                    >
                      <PlusCircle size={16} />
                      <span>New Theme</span>
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => setIsNewTokenDialogOpen(true)}
                      className="flex items-center gap-1"
                    >
                      <PlusCircle size={16} />
                      <span>Add Token</span>
                    </Button>
                  </div>
                </div>

                {/* Tokens table */}
                {activeTheme &&
                  (activeTheme.tokens.length > 0 ? (
                    <Card className="overflow-hidden">
                      <ScrollArea className="h-[400px]">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[180px]">Name</TableHead>
                              <TableHead className="w-[120px]">
                                Category
                              </TableHead>
                              <TableHead>Value</TableHead>
                              <TableHead className="w-[200px]">
                                Description
                              </TableHead>
                              <TableHead className="w-[100px] text-right">
                                Actions
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {activeTheme.tokens.map((token) => (
                              <TableRow key={token.id}>
                                <TableCell className="font-medium">
                                  {token.name}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1.5">
                                    {TokenCategoryIcons[token.category]}
                                    <span>{token.category}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {token.category === "color" ? (
                                    <div className="flex items-center gap-2">
                                      <div
                                        className="w-6 h-6 rounded border"
                                        style={{
                                          background: token.value.startsWith(
                                            "#"
                                          )
                                            ? token.value
                                            : `var(--${token.value})`,
                                        }}
                                      />
                                      {token.value}
                                    </div>
                                  ) : (
                                    token.value
                                  )}
                                </TableCell>
                                <TableCell className="text-sm text-gray-500">
                                  {token.description || "-"}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() =>
                                      handleDeleteToken(token.id, token.name)
                                    }
                                  >
                                    <Trash2 size={16} />
                                    <span className="sr-only">Delete</span>
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                    </Card>
                  ) : (
                    <Card className="border-dashed border-2">
                      <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[200px] text-center">
                        <p className="text-gray-500 mb-6">
                          No tokens in this theme
                        </p>
                        <Button
                          onClick={() => setIsNewTokenDialogOpen(true)}
                          className="flex items-center gap-1"
                        >
                          <PlusCircle size={16} />
                          <span>Add Your First Token</span>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
              </TabsContent>

              <TabsContent value="themes" className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Available Themes</h3>
                  <Button
                    size="sm"
                    onClick={() => setIsNewThemeDialogOpen(true)}
                    className="flex items-center gap-1"
                  >
                    <PlusCircle size={16} />
                    <span>New Theme</span>
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeSystem.themes.map((theme) => (
                    <Card
                      key={theme.id}
                      className={`overflow-hidden ${
                        theme.id === activeThemeId ? "ring-2 ring-blue-500" : ""
                      }`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              {theme.name === "Dark" ? (
                                <Moon size={18} />
                              ) : (
                                <Sun size={18} />
                              )}
                              {theme.name}
                            </CardTitle>
                            {theme.isDefault && (
                              <CardDescription>
                                <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">
                                  Default Theme
                                </span>
                              </CardDescription>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setActiveThemeId(theme.id)}
                          >
                            <Edit2 size={16} />
                            <span className="sr-only">Edit</span>
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Total Tokens:</span>
                            <span className="font-medium">
                              {theme.tokens.length}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {[
                              "color",
                              "typography",
                              "spacing",
                              "border",
                              "shadow",
                              "breakpoint",
                            ].map((category) => {
                              const count = theme.tokens.filter(
                                (t) => t.category === category
                              ).length;
                              if (count === 0) return null;
                              return (
                                <span
                                  key={category}
                                  className="text-xs rounded-full px-2 py-0.5 bg-gray-100 text-gray-800 flex items-center gap-1"
                                >
                                  {
                                    TokenCategoryIcons[
                                      category as TokenCategory
                                    ]
                                  }
                                  <span>{count}</span>
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => setActiveThemeId(theme.id)}
                        >
                          {theme.id === activeThemeId
                            ? "Currently Editing"
                            : "Edit Tokens"}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="colors" className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">
                    Color Palette Generator
                  </h3>
                  <div className="text-sm text-gray-500">
                    Create harmonious color scales and themes
                  </div>
                </div>

                {activeThemeId ? (
                  <ColorPaletteGenerator
                    onAddToken={handleAddTokenFromPalette}
                    activeThemeId={activeThemeId}
                  />
                ) : (
                  <Card className="border-dashed border-2">
                    <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[200px] text-center">
                      <p className="text-gray-500 mb-6">
                        Please select a theme first
                      </p>
                      <Select
                        value={activeThemeId || ""}
                        onValueChange={setActiveThemeId}
                      >
                        <SelectTrigger className="w-64">
                          <SelectValue placeholder="Select a theme" />
                        </SelectTrigger>
                        <SelectContent>
                          {activeSystem.themes.map((theme) => (
                            <SelectItem key={theme.id} value={theme.id}>
                              {theme.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>
                )}

                <div className="mt-6 p-3 bg-blue-50 border border-blue-100 rounded-md">
                  <h4 className="text-sm font-medium text-blue-800 mb-1">
                    About the Color Palette Generator
                  </h4>
                  <p className="text-xs text-blue-700">
                    Create harmonious color schemes with built-in accessibility
                    checking. Generate complete color scales for your design
                    system based on a single base color. The generator supports
                    various color harmonies and automatically handles contrast
                    ratios for accessible designs.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="component-tokens" className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Design Token Linking</h3>
                  <div className="text-sm text-gray-500">
                    Apply tokens to components for consistent styling
                  </div>
                </div>

                {activeTheme ? (
                  <TokenComponentLinker
                    activeThemeId={activeThemeId}
                    tokens={activeTheme.tokens.map((token) => ({
                      id: token.id,
                      name: token.name,
                      value: token.value,
                      category: token.category,
                      description: token.description,
                    }))}
                    components={mockComponents}
                    onApplyToken={handleApplyToken}
                    onRemoveToken={handleRemoveTokenMapping}
                    existingMappings={tokenMappings}
                  />
                ) : (
                  <Card className="border-dashed border-2">
                    <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[200px] text-center">
                      <p className="text-gray-500 mb-6">
                        Please select a theme first
                      </p>
                      <Select
                        value={activeThemeId || ""}
                        onValueChange={setActiveThemeId}
                      >
                        <SelectTrigger className="w-64">
                          <SelectValue placeholder="Select a theme" />
                        </SelectTrigger>
                        <SelectContent>
                          {activeSystem.themes.map((theme) => (
                            <SelectItem key={theme.id} value={theme.id}>
                              {theme.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="export" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Export Options</CardTitle>
                    <CardDescription>
                      Generate code and assets from your design system
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Tailwind Configuration</h4>
                      <p className="text-sm text-gray-500">
                        Generate a tailwind.config.js file with your design
                        tokens
                      </p>
                      <Button
                        variant="outline"
                        onClick={handleExportTailwindConfig}
                        className="flex items-center gap-1.5"
                      >
                        <FileCode size={16} />
                        <span>Generate Tailwind Config</span>
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Design System Export</h4>
                      <p className="text-sm text-gray-500">
                        Export your complete design system as a JSON file
                      </p>
                      <Button
                        variant="outline"
                        onClick={() =>
                          exportDesignSystem(activeDesignSystemId || "")
                        }
                        className="flex items-center gap-1.5"
                      >
                        <Download size={16} />
                        <span>Export Full Design System</span>
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">CSS Variables</h4>
                      <p className="text-sm text-gray-500">
                        Generate CSS custom properties from your design tokens
                      </p>
                      <Button
                        variant="outline"
                        disabled
                        className="flex items-center gap-1.5"
                      >
                        <FileCode size={16} />
                        <span>Generate CSS Variables (Coming Soon)</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </>
      )}

      {/* Create New System Dialog */}
      <Dialog
        open={isNewSystemDialogOpen}
        onOpenChange={setIsNewSystemDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Design System</DialogTitle>
            <DialogDescription>
              Create a new design system to manage your design tokens and
              themes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="system-name">System Name</Label>
              <Input
                id="system-name"
                placeholder="My Design System"
                value={newSystemName}
                onChange={(e) => setNewSystemName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="system-description">Description (Optional)</Label>
              <Input
                id="system-description"
                placeholder="Design system for my project"
                value={newSystemDescription}
                onChange={(e) => setNewSystemDescription(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsNewSystemDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateSystem}>Create System</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create New Theme Dialog */}
      <Dialog
        open={isNewThemeDialogOpen}
        onOpenChange={setIsNewThemeDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Theme</DialogTitle>
            <DialogDescription>
              Add a new theme to your design system.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="theme-name">Theme Name</Label>
              <Input
                id="theme-name"
                placeholder="Dark Mode"
                value={newThemeName}
                onChange={(e) => setNewThemeName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="base-theme">Based On (Optional)</Label>
              <Select value={baseThemeId} onValueChange={setBaseThemeId}>
                <SelectTrigger id="base-theme">
                  <SelectValue placeholder="Start from scratch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Start from scratch</SelectItem>
                  {activeSystem?.themes.map((theme) => (
                    <SelectItem key={theme.id} value={theme.id}>
                      {theme.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Copy tokens from an existing theme as a starting point
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsNewThemeDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateTheme}>Create Theme</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add New Token Dialog */}
      <Dialog
        open={isNewTokenDialogOpen}
        onOpenChange={setIsNewTokenDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Design Token</DialogTitle>
            <DialogDescription>
              Add a new design token to your theme.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="token-category">Token Category</Label>
              <Select
                value={newTokenCategory}
                onValueChange={(value: TokenCategory) =>
                  setNewTokenCategory(value)
                }
              >
                <SelectTrigger id="token-category" className="w-full">
                  <SelectValue placeholder="Select token type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="color">
                    <div className="flex items-center gap-2">
                      <Palette size={16} />
                      <span>Color</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="typography">
                    <div className="flex items-center gap-2">
                      <Type size={16} />
                      <span>Typography</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="spacing">
                    <div className="flex items-center gap-2">
                      <Square size={16} />
                      <span>Spacing</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="border">
                    <div className="flex items-center gap-2">
                      <Box size={16} />
                      <span>Border</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="shadow">
                    <div className="flex items-center gap-2">
                      <Box size={16} />
                      <span>Shadow</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="breakpoint">
                    <div className="flex items-center gap-2">
                      <FileCode size={16} />
                      <span>Breakpoint</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="token-name">Token Name</Label>
              <Input
                id="token-name"
                placeholder={
                  newTokenCategory === "color"
                    ? "primary"
                    : newTokenCategory === "spacing"
                    ? "spacing-lg"
                    : newTokenCategory === "typography"
                    ? "heading-1"
                    : newTokenCategory === "border"
                    ? "radius-md"
                    : newTokenCategory === "shadow"
                    ? "shadow-lg"
                    : "tablet"
                }
                value={newTokenName}
                onChange={(e) => setNewTokenName(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                A unique, descriptive name for this token
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="token-value">Token Value</Label>
              {newTokenCategory === "color" ? (
                <div className="flex gap-2">
                  <div className="flex-shrink-0">
                    <input
                      type="color"
                      id="color-picker"
                      value={
                        newTokenValue.startsWith("#")
                          ? newTokenValue
                          : "#000000"
                      }
                      onChange={(e) => setNewTokenValue(e.target.value)}
                      className="h-10 w-10 border rounded"
                    />
                  </div>
                  <Input
                    id="token-value"
                    placeholder="#3B82F6"
                    value={newTokenValue}
                    onChange={(e) => setNewTokenValue(e.target.value)}
                    className="flex-1"
                  />
                </div>
              ) : (
                <Input
                  id="token-value"
                  placeholder={
                    newTokenCategory === "spacing"
                      ? "1.5rem"
                      : newTokenCategory === "typography"
                      ? '"Inter, sans-serif"'
                      : newTokenCategory === "border"
                      ? "0.375rem"
                      : newTokenCategory === "shadow"
                      ? "0 4px 6px rgba(0, 0, 0, 0.1)"
                      : "768px"
                  }
                  value={newTokenValue}
                  onChange={(e) => setNewTokenValue(e.target.value)}
                />
              )}
              <p className="text-xs text-gray-500 mt-1">
                {newTokenCategory === "color"
                  ? "Color value in hex, rgb, hsl, or other CSS color format"
                  : newTokenCategory === "spacing"
                  ? "Spacing value (rem, px, etc.)"
                  : newTokenCategory === "typography"
                  ? "Font stack or typography property"
                  : newTokenCategory === "border"
                  ? "Border value (width, style, radius)"
                  : newTokenCategory === "shadow"
                  ? "Box shadow value"
                  : "Screen size (px, em, rem)"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="token-description">Description (Optional)</Label>
              <Input
                id="token-description"
                placeholder="Describe how this token should be used"
                value={newTokenDescription}
                onChange={(e) => setNewTokenDescription(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsNewTokenDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddToken}>Add Token</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Design System</DialogTitle>
            <DialogDescription>
              Import a design system from a JSON file.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="import-file">Select File</Label>
              <Input
                id="import-file"
                type="file"
                accept=".json"
                onChange={handleFileImport}
              />
              <p className="text-xs text-gray-500 mt-1">
                Select a design system JSON file to import
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsImportDialogOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
