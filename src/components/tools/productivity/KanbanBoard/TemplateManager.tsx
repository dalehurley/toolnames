import { useState, useEffect } from "react";
import { nanoid } from "nanoid";
import { CardTemplate, TEMPLATE_CATEGORIES, KanbanCard } from "@/types/kanban";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Edit, FileText, Plus, Tag, Trash, X, PlusCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

// Priority colors for display
const priorityColors = {
  high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  medium:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
};

// Base template structure with default values
const baseTemplate: Omit<KanbanCard, "id" | "createdAt"> = {
  title: "",
  description: "",
  priority: "medium",
  tags: [],
};

interface TemplateManagerProps {
  templates: CardTemplate[];
  onSaveTemplate: (template: CardTemplate) => void;
  onDeleteTemplate: (templateId: string) => void;
  onUseTemplate: (template: CardTemplate) => void;
  onClose: () => void;
}

export const TemplateManager = ({
  templates,
  onSaveTemplate,
  onDeleteTemplate,
  onUseTemplate,
  onClose,
}: TemplateManagerProps) => {
  const [activeTab, setActiveTab] = useState("manage");
  const [editingTemplate, setEditingTemplate] = useState<CardTemplate | null>(
    null
  );
  const [newTemplate, setNewTemplate] = useState<CardTemplate>({
    id: "",
    name: "",
    description: "",
    category: "Task",
    cardData: { ...baseTemplate },
  });
  const [tagInput, setTagInput] = useState("");
  const [filter, setFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Set a new template ID when creating a new template
  useEffect(() => {
    if (!editingTemplate) {
      setNewTemplate((prev) => ({
        ...prev,
        id: `template-${nanoid(6)}`,
      }));
    }
  }, [editingTemplate]);

  // Handle field changes for the template form
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name.startsWith("cardData.")) {
      const cardField = name.replace("cardData.", "");
      setNewTemplate((prev) => ({
        ...prev,
        cardData: {
          ...prev.cardData,
          [cardField]: value,
        },
      }));
    } else {
      setNewTemplate((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle priority selection
  const handlePriorityChange = (value: string) => {
    setNewTemplate((prev) => ({
      ...prev,
      cardData: {
        ...prev.cardData,
        priority: value as "low" | "medium" | "high",
      },
    }));
  };

  // Handle category selection
  const handleCategoryChange = (value: string) => {
    setNewTemplate((prev) => ({
      ...prev,
      category: value,
    }));
  };

  // Handle adding tags
  const handleAddTag = () => {
    if (
      tagInput.trim() &&
      !newTemplate.cardData.tags.includes(tagInput.trim())
    ) {
      setNewTemplate((prev) => ({
        ...prev,
        cardData: {
          ...prev.cardData,
          tags: [...prev.cardData.tags, tagInput.trim()],
        },
      }));
      setTagInput("");
    }
  };

  // Handle removing tags
  const handleRemoveTag = (tag: string) => {
    setNewTemplate((prev) => ({
      ...prev,
      cardData: {
        ...prev.cardData,
        tags: prev.cardData.tags.filter((t) => t !== tag),
      },
    }));
  };

  // Handle saving a template
  const handleSaveTemplate = () => {
    // Validate required fields
    if (!newTemplate.name.trim() || !newTemplate.cardData.title.trim()) {
      // TODO: Show validation error
      return;
    }

    onSaveTemplate(newTemplate);
    resetForm();
    setActiveTab("manage");
  };

  // Handle editing a template
  const handleEditTemplate = (template: CardTemplate) => {
    setEditingTemplate(template);
    setNewTemplate({
      ...template,
    });
    setActiveTab("create");
  };

  // Reset the form
  const resetForm = () => {
    setEditingTemplate(null);
    setNewTemplate({
      id: `template-${nanoid(6)}`,
      name: "",
      description: "",
      category: "Task",
      cardData: { ...baseTemplate },
    });
    setTagInput("");
  };

  // Cancel editing/creating
  const handleCancel = () => {
    resetForm();
    if (templates.length === 0) {
      // If no templates exist, close the dialog when canceling
      onClose();
    } else {
      // Otherwise, go back to management tab
      setActiveTab("manage");
    }
  };

  // Filter templates by search term and category
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      filter === "" ||
      template.name.toLowerCase().includes(filter.toLowerCase()) ||
      template.description.toLowerCase().includes(filter.toLowerCase()) ||
      template.cardData.title.toLowerCase().includes(filter.toLowerCase()) ||
      template.cardData.description
        .toLowerCase()
        .includes(filter.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || template.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Group templates by category for better organization
  const templatesByCategory = filteredTemplates.reduce((acc, template) => {
    const category = template.category || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(template);
    return acc;
  }, {} as Record<string, CardTemplate[]>);

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Template Manager</DialogTitle>
          <DialogDescription>
            Create and manage card templates to quickly add common tasks to your
            board.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manage">Manage Templates</TabsTrigger>
            <TabsTrigger value="create">
              {editingTemplate ? "Edit Template" : "Create Template"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manage" className="flex-1 flex flex-col">
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search templates..."
                  className="pl-8"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
                {filter && (
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600"
                    onClick={() => setFilter("")}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {TEMPLATE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                setActiveTab("create");
              }}
              className="mb-4"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Create New Template
            </Button>

            {templates.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mb-2" />
                <h3 className="text-lg font-medium mb-1">No Templates Yet</h3>
                <p className="text-gray-500 mb-4">
                  Create your first template to quickly add cards to your board.
                </p>
                <Button onClick={() => setActiveTab("create")}>
                  Create Template
                </Button>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Search className="h-12 w-12 text-gray-400 mb-2" />
                <h3 className="text-lg font-medium mb-1">
                  No Matching Templates
                </h3>
                <p className="text-gray-500">
                  Try adjusting your search or category filter.
                </p>
              </div>
            ) : (
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-6">
                  {Object.entries(templatesByCategory).map(
                    ([category, templates]) => (
                      <div key={category}>
                        <h3 className="text-sm font-medium mb-2">{category}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {templates.map((template) => (
                            <Card key={template.id} className="overflow-hidden">
                              <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <CardTitle className="text-base">
                                      {template.name}
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                      {template.description}
                                    </CardDescription>
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className={
                                      priorityColors[template.cardData.priority]
                                    }
                                  >
                                    {template.cardData.priority}
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="pb-2">
                                <div className="text-sm font-medium mb-1">
                                  {template.cardData.title}
                                </div>
                                <p className="text-xs text-gray-500 line-clamp-2">
                                  {template.cardData.description}
                                </p>

                                {template.cardData.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {template.cardData.tags.map((tag) => (
                                      <Badge
                                        key={tag}
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        <Tag className="h-3 w-3 mr-1" />
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </CardContent>
                              <CardFooter className="flex justify-end space-x-2 pt-0">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditTemplate(template)}
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onDeleteTemplate(template.id)}
                                >
                                  <Trash className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => onUseTemplate(template)}
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Use
                                </Button>
                              </CardFooter>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="create" className="flex-1">
            <ScrollArea className="h-[350px] pr-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="template-name">Template Name *</Label>
                    <Input
                      id="template-name"
                      name="name"
                      value={newTemplate.name}
                      onChange={handleChange}
                      placeholder="E.g., Bug Report Template"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="template-category">Category</Label>
                    <Select
                      value={newTemplate.category}
                      onValueChange={handleCategoryChange}
                    >
                      <SelectTrigger id="template-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {TEMPLATE_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template-description">
                    Template Description
                  </Label>
                  <Textarea
                    id="template-description"
                    name="description"
                    value={newTemplate.description}
                    onChange={handleChange}
                    placeholder="Describe what this template is for"
                    rows={2}
                  />
                </div>

                <div className="border-t pt-4 mt-4">
                  <h3 className="font-medium mb-4">Card Details</h3>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="card-title">Card Title *</Label>
                      <Input
                        id="card-title"
                        name="cardData.title"
                        value={newTemplate.cardData.title}
                        onChange={handleChange}
                        placeholder="E.g., Fix Login Button"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="card-description">Card Description</Label>
                      <Textarea
                        id="card-description"
                        name="cardData.description"
                        value={newTemplate.cardData.description}
                        onChange={handleChange}
                        placeholder="Describe the task"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="card-priority">Priority</Label>
                        <Select
                          value={newTemplate.cardData.priority}
                          onValueChange={handlePriorityChange}
                        >
                          <SelectTrigger id="card-priority">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="card-assignee">
                          Default Assignee (optional)
                        </Label>
                        <Input
                          id="card-assignee"
                          name="cardData.assignee"
                          value={newTemplate.cardData.assignee || ""}
                          onChange={handleChange}
                          placeholder="Leave blank for none"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="card-tags">Tags</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="card-tags"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          placeholder="Add tags"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddTag();
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={handleAddTag}
                        >
                          Add
                        </Button>
                      </div>

                      {newTemplate.cardData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {newTemplate.cardData.tags.map((tag) => (
                            <div
                              key={tag}
                              className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs rounded px-2 py-1 flex items-center"
                            >
                              {tag}
                              <button
                                type="button"
                                className="ml-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                onClick={() => handleRemoveTag(tag)}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          {activeTab === "create" ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSaveTemplate}>
                {editingTemplate ? "Update Template" : "Save Template"}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Search icon component for search input
function Search(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
