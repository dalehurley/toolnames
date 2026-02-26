import { FC, useState } from "react";
import { GridTemplate, GridState } from "./types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
  Trash2,
  Download,
  Save,
  Folder,
  Search,
  Layout,
  LucideIcon,
  LayoutGrid,
  Smartphone,
  Check,
  ArrowRight,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TemplateGalleryProps {
  templates: GridTemplate[];
  onLoadTemplate: (templateId: string) => void;
  onSaveTemplate: (name: string, category: string) => void;
  onDeleteTemplate: (templateId: string) => void;
  // This prop is passed from parent but not directly used in this component
  // It's kept for future features like comparing current state with templates
  currentGridState: GridState;
}

interface CategoryInfo {
  id: string;
  name: string;
  icon: LucideIcon;
}

export const TemplateGallery: FC<TemplateGalleryProps> = ({
  templates,
  onLoadTemplate,
  onSaveTemplate,
  onDeleteTemplate,
}) => {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateCategory, setNewTemplateCategory] = useState("layout");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // Template categories
  const categories: CategoryInfo[] = [
    { id: "layout", name: "Layouts", icon: Layout },
    { id: "responsive", name: "Responsive", icon: Smartphone },
    { id: "grid", name: "Grids", icon: LayoutGrid },
    { id: "custom", name: "My Templates", icon: Folder },
  ];

  // Filter templates based on search and category
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      searchQuery === "" ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      activeCategory === null || template.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  // Handle saving a template
  const handleSaveTemplate = () => {
    if (!newTemplateName.trim()) {
      toast.error("Please enter a template name");
      return;
    }

    // Check for duplicate template names
    if (
      templates.some(
        (t) => t.name.toLowerCase() === newTemplateName.toLowerCase()
      )
    ) {
      toast.error("A template with this name already exists");
      return;
    }

    onSaveTemplate(newTemplateName, newTemplateCategory);
    setShowSaveDialog(false);
    setNewTemplateName("");

    toast.success(`Template "${newTemplateName}" saved!`);
  };

  // Handle loading a template
  const handleLoadTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    setSelectedTemplate(templateId);

    // Show loading toast
    toast.success(
      <div className="flex flex-col gap-2">
        <div className="font-medium flex items-center gap-1">
          <Check className="h-4 w-4 text-green-500" />
          Template loaded successfully!
        </div>
        <div className="text-sm text-gray-500">
          "{template.name}" has been loaded into the Grid Editor
        </div>
        <div className="text-xs text-blue-500 flex items-center mt-1">
          Switching to Grid Editor <ArrowRight className="h-3 w-3 ml-1" />
        </div>
      </div>
    );

    // Call the actual load function
    onLoadTemplate(templateId);

    // Reset selection after a delay
    setTimeout(() => {
      setSelectedTemplate(null);
    }, 1500);
  };

  // Get icon for a template based on its category
  const getTemplateIcon = (category: string) => {
    const categoryInfo = categories.find((c) => c.id === category);
    const Icon = categoryInfo?.icon || Layout;
    return <Icon className="h-5 w-5" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold">Template Gallery</h3>
          <p className="text-sm text-gray-500">
            Load predefined templates or save your own designs
          </p>
        </div>

        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              <Save className="h-4 w-4 mr-1" />
              <span>Save Template</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Template</DialogTitle>
              <DialogDescription>
                Save your current grid layout as a reusable template
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  placeholder="e.g., My Dashboard Layout"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-category">Category</Label>
                <Select
                  value={newTemplateCategory}
                  onValueChange={setNewTemplateCategory}
                >
                  <SelectTrigger id="template-category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center">
                          <category.icon className="h-4 w-4 mr-2" />
                          <span>{category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowSaveDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveTemplate}>Save Template</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 mb-4">
        <AlertDescription className="text-sm text-blue-700 dark:text-blue-300 flex items-center">
          <Info className="h-4 w-4 mr-2 flex-shrink-0" />
          Click on any template to load it into the Grid Editor. Your current
          grid layout will be replaced.
        </AlertDescription>
      </Alert>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-64 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search templates..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Categories */}
          <Card className="p-2">
            <div className="space-y-1">
              <Button
                variant={activeCategory === null ? "default" : "ghost"}
                size="sm"
                className="w-full justify-start"
                onClick={() => setActiveCategory(null)}
              >
                <Layout className="h-4 w-4 mr-2" />
                All Templates
              </Button>

              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setActiveCategory(category.id)}
                >
                  <category.icon className="h-4 w-4 mr-2" />
                  {category.name}
                </Button>
              ))}
            </div>
          </Card>

          {/* Stats */}
          <Card className="p-3">
            <p className="text-xs text-gray-500">
              {templates.length} templates available
            </p>
            <p className="text-xs text-gray-500">
              {templates.filter((t) => t.custom).length} custom templates
            </p>
          </Card>
        </div>

        <div className="flex-1">
          {filteredTemplates.length === 0 ? (
            <Card className="p-8 flex flex-col items-center justify-center h-64 text-center">
              <Search className="h-10 w-10 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium">No templates found</h3>
              <p className="text-sm text-gray-500 mt-1">
                Try adjusting your search or category filter
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <Card
                  key={template.id}
                  className={`overflow-hidden flex flex-col h-64 transition-all duration-300 cursor-pointer ${
                    selectedTemplate === template.id
                      ? "ring-2 ring-primary shadow-lg scale-[1.02]"
                      : "hover:border-primary hover:shadow-md"
                  }`}
                  onClick={() => handleLoadTemplate(template.id)}
                >
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 flex-1 flex items-center justify-center relative">
                    {selectedTemplate === template.id && (
                      <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                        <div className="bg-primary text-primary-foreground rounded-full p-2">
                          <Check className="h-6 w-6" />
                        </div>
                      </div>
                    )}
                    <div
                      className="w-full h-full max-w-[180px] max-h-[120px] bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-2 grid"
                      style={{
                        gridTemplateColumns: template.gridState.columns
                          .map((c) => c.size)
                          .join(" "),
                        gridTemplateRows: template.gridState.rows
                          .map((r) => r.size)
                          .join(" "),
                        gap: `${template.gridState.gaps.row} ${template.gridState.gaps.column}`,
                      }}
                    >
                      {/* Mini preview of the grid */}
                      {template.gridState.areas.map((area) => (
                        <div
                          key={area.id}
                          style={{
                            gridRowStart: area.startRow + 1,
                            gridRowEnd: area.endRow + 1,
                            gridColumnStart: area.startColumn + 1,
                            gridColumnEnd: area.endColumn + 1,
                            backgroundColor: "rgba(99, 102, 241, 0.1)",
                            border: "1px solid rgba(99, 102, 241, 0.3)",
                            borderRadius: "2px",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="p-4 border-t">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-sm">{template.name}</h4>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          {getTemplateIcon(template.category)}
                          <span className="ml-1 capitalize">
                            {template.category}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant={
                            selectedTemplate === template.id
                              ? "default"
                              : "ghost"
                          }
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLoadTemplate(template.id);
                          }}
                        >
                          {selectedTemplate === template.id ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                          <span className="sr-only">Load template</span>
                        </Button>

                        {template.custom && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteTemplate(template.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete template</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
