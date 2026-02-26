import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { KanbanCard, KanbanColumn, CardTemplate } from "@/types/kanban";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  PlusCircle,
  MoreVertical,
  Trash2,
  Edit,
  GripVertical,
  X,
  Check,
  Palette,
  Library,
  Plus,
  ChevronDown,
  ChevronRight,
  ArrowUpDown,
} from "lucide-react";
import {
  Card as UICard,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ColumnProps {
  column: KanbanColumn;
  cards: KanbanCard[];
  allColumns?: KanbanColumn[];
  onAddCard: () => void;
  onDeleteCard: (id: string) => void;
  onEditCard: (id: string, data: Partial<KanbanCard>) => void;
  onDuplicateCard?: (id: string) => void;
  isDragging?: boolean;
  onDeleteColumn?: (id: string) => void;
  onEditColumn?: (
    id: string,
    title: string,
    limit?: number,
    color?: string
  ) => void;
  onAddFromTemplate?: (columnId: string, templateId?: string) => void;
  templates?: CardTemplate[];
  onToggleCollapse?: (columnId: string) => void;
  onSetSortOrder?: (columnId: string, sortOrder: KanbanColumn["sortOrder"]) => void;
  children?: React.ReactNode;
}

// Add color options for columns
const columnColors = [
  { name: "Default", value: "bg-gray-50 dark:bg-gray-900 border-t-primary" },
  { name: "Blue", value: "bg-blue-50 dark:bg-blue-900/30 border-t-blue-500" },
  {
    name: "Green",
    value: "bg-green-50 dark:bg-green-900/30 border-t-green-500",
  },
  {
    name: "Yellow",
    value: "bg-yellow-50 dark:bg-yellow-900/30 border-t-yellow-500",
  },
  { name: "Red", value: "bg-red-50 dark:bg-red-900/30 border-t-red-500" },
  {
    name: "Purple",
    value: "bg-purple-50 dark:bg-purple-900/30 border-t-purple-500",
  },
  { name: "Pink", value: "bg-pink-50 dark:bg-pink-900/30 border-t-pink-500" },
  { name: "Gray", value: "bg-gray-100 dark:bg-gray-800 border-t-gray-500" },
];

// Priority colors for display
const priorityColors = {
  high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  medium:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
};

const SORT_LABELS: Record<NonNullable<KanbanColumn["sortOrder"]>, string> = {
  none: "None",
  "priority-desc": "Priority (High → Low)",
  "priority-asc": "Priority (Low → High)",
  "due-date-asc": "Due Date (Soonest)",
  "due-date-desc": "Due Date (Latest)",
  "created-asc": "Oldest First",
  "created-desc": "Newest First",
};

const Column = ({
  column,
  cards,
  onAddCard,
  isDragging = false,
  onDeleteColumn,
  onEditColumn,
  onAddFromTemplate,
  templates = [],
  onToggleCollapse,
  onSetSortOrder,
  children,
}: ColumnProps) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [newTitle, setNewTitle] = useState(column.title);
  const [newLimit, setNewLimit] = useState(column.limit?.toString() || "");

  // Make the column both droppable (for cards) and sortable (for itself)
  const { setNodeRef: setDroppableNodeRef } = useDroppable({
    id: column.id,
  });

  const {
    attributes,
    listeners,
    setNodeRef: setSortableNodeRef,
    transform,
    transition,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Check if this column is at its WIP limit
  const isAtLimit = column.limit !== undefined && cards.length >= column.limit;

  // Combine the sortable and droppable refs
  const setNodeRef = (node: HTMLElement | null) => {
    setDroppableNodeRef(node);
    setSortableNodeRef(node);
  };

  const handleSaveEdit = () => {
    if (onEditColumn && newTitle.trim()) {
      const limitValue = newLimit ? parseInt(newLimit) : undefined;
      onEditColumn(column.id, newTitle.trim(), limitValue, column.color);
    }
    setShowEditDialog(false);
  };

  const handleDelete = () => {
    if (onDeleteColumn) {
      onDeleteColumn(column.id);
    }
    setShowDeleteDialog(false);
  };

  // Handle column color change
  const handleColorChange = (colorValue: string) => {
    if (onEditColumn) {
      const limitValue = newLimit ? parseInt(newLimit) : undefined;
      onEditColumn(column.id, column.title, limitValue, colorValue);
    }
    setShowColorPicker(false);
  };

  // Get column background color
  const getColumnBackground = () => {
    return column.color || "bg-gray-50 dark:bg-gray-900 border-t-primary";
  };

  // Group templates by category
  const templatesByCategory = templates.reduce((acc, template) => {
    const category = template.category || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(template);
    return acc;
  }, {} as Record<string, CardTemplate[]>);

  const isCollapsed = column.isCollapsed ?? false;
  const wipPercentage = column.limit ? Math.min((cards.length / column.limit) * 100, 100) : 0;

  return (
    <UICard
      ref={setNodeRef}
      style={style}
      className={`flex flex-col ${isCollapsed ? "min-w-[56px] max-w-[56px]" : "min-w-[300px] max-w-[300px]"} h-full ${getColumnBackground()} shadow-sm ${
        isDragging ? "opacity-50" : ""
      } transition-all duration-200`}
      {...attributes}
    >
      <CardHeader className="pb-2 pt-4 px-3 flex-shrink-0">
        {isCollapsed ? (
          /* Collapsed view: vertical title + expand button */
          <div className="flex flex-col items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => onToggleCollapse?.(column.id)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <div
              className="cursor-move text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              {...listeners}
            >
              <GripVertical className="h-4 w-4" />
            </div>
            <span
              className="text-xs font-medium writing-mode-vertical truncate max-h-32"
              style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
            >
              {column.title}
            </span>
            <Badge variant="secondary" className="text-xs px-1">
              {cards.length}
            </Badge>
          </div>
        ) : (
          /* Normal view */
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div
                  className="cursor-move mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  {...listeners}
                >
                  <GripVertical className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-medium">{column.title}</h3>
                <Badge variant="secondary" className="ml-2 text-xs">
                  {cards.length}
                  {column.limit ? `/${column.limit}` : ""}
                </Badge>
              </div>

              <div className="flex items-center gap-1">
                {/* Collapse button */}
                {onToggleCollapse && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    title="Collapse column"
                    onClick={() => onToggleCollapse(column.id)}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                )}

                {/* Sort dropdown */}
                {onSetSortOrder && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-7 w-7 p-0 ${column.sortOrder && column.sortOrder !== "none" ? "text-primary" : ""}`}
                        title="Sort cards"
                      >
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Sort Cards By</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {(Object.keys(SORT_LABELS) as KanbanColumn["sortOrder"][]).map((key) => (
                        <DropdownMenuItem
                          key={key}
                          onClick={() => onSetSortOrder(column.id, key)}
                          className="flex items-center justify-between"
                        >
                          {SORT_LABELS[key!]}
                          {column.sortOrder === key && <Check className="h-4 w-4 ml-2" />}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Column
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => setShowColorPicker(true)}>
                      <Palette className="h-4 w-4 mr-2" />
                      Change Color
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-500 focus:text-red-500"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Column
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* WIP limit progress bar */}
            {column.limit && (
              <div className="mt-2">
                <Progress
                  value={wipPercentage}
                  className={`h-1 ${
                    isAtLimit
                      ? "[&>div]:bg-red-500"
                      : wipPercentage >= 75
                      ? "[&>div]:bg-amber-500"
                      : "[&>div]:bg-green-500"
                  }`}
                />
                <p className="text-xs text-gray-400 mt-0.5">
                  WIP: {cards.length}/{column.limit}
                </p>
              </div>
            )}
          </>
        )}
      </CardHeader>

      {!isCollapsed && (
        <CardContent className="p-2 flex-1 overflow-y-auto">
          <SortableContext
            items={cards.map((card) => card.id)}
            strategy={verticalListSortingStrategy}
          >
            {children}
            {cards.length === 0 && (
              <div className="text-center text-gray-400 dark:text-gray-600 py-4 text-sm italic min-h-[100px] flex items-center justify-center">
                No cards in this column
              </div>
            )}
          </SortableContext>
        </CardContent>
      )}

      {!isCollapsed && (
        <CardFooter className="p-2 flex-shrink-0 flex space-x-2">
          {onAddFromTemplate && templates.length > 0 ? (
            <>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => onAddCard()}
                disabled={isAtLimit}
              >
                <Plus className="h-4 w-4 mr-1" />
                New Card
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    disabled={isAtLimit}
                  >
                    <Library className="h-4 w-4 mr-1" />
                    Templates <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <ScrollArea className="h-[400px]">
                    {Object.entries(templatesByCategory).map(
                      ([category, categoryTemplates]) => (
                        <div key={category}>
                          <DropdownMenuLabel>{category}</DropdownMenuLabel>
                          <DropdownMenuGroup>
                            {categoryTemplates.map((template) => (
                              <DropdownMenuItem
                                key={template.id}
                                onClick={() =>
                                  onAddFromTemplate(column.id, template.id)
                                }
                              >
                                <div className="flex flex-col w-full">
                                  <div className="font-medium">
                                    {template.name}
                                  </div>
                                  <div className="text-xs text-gray-500 truncate">
                                    {template.cardData.title}
                                  </div>
                                  <div className="flex mt-1 items-center">
                                    <Badge
                                      variant="outline"
                                      className={`${
                                        priorityColors[template.cardData.priority]
                                      } mr-2 text-xs`}
                                    >
                                      {template.cardData.priority}
                                    </Badge>
                                    {template.cardData.tags.length > 0 && (
                                      <span className="text-xs text-gray-500">
                                        {template.cardData.tags.length} tags
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuGroup>
                          <DropdownMenuSeparator />
                        </div>
                      )
                    )}

                    <DropdownMenuItem
                      onClick={() => onAddFromTemplate(column.id)}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Manage Templates
                    </DropdownMenuItem>
                  </ScrollArea>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button
              variant={isAtLimit ? "secondary" : "outline"}
              size="sm"
              className="w-full text-xs"
              onClick={onAddCard}
              disabled={isAtLimit}
            >
              <PlusCircle className="h-4 w-4 mr-1" />
              {isAtLimit ? "WIP Limit Reached" : "Add Card"}
            </Button>
          )}
        </CardFooter>
      )}

      {/* Edit Column Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Column</DialogTitle>
            <DialogDescription>
              Customize the column name and work-in-progress limit
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="column-title">Column Name</Label>
              <Input
                id="column-title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Column name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="column-limit">WIP Limit (optional)</Label>
              <Input
                id="column-limit"
                value={newLimit}
                onChange={(e) =>
                  setNewLimit(e.target.value.replace(/[^0-9]/g, ""))
                }
                placeholder="Leave empty for no limit"
                type="number"
                min="0"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Set a maximum number of cards allowed in this column
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Color picker dialog */}
      {showColorPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Choose Column Color</h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setShowColorPicker(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {columnColors.map((color) => (
                <button
                  key={color.name}
                  className={`${
                    color.value.split(" ")[0]
                  } rounded p-2 border border-gray-200 dark:border-gray-700 flex items-center justify-between hover:border-primary transition-colors`}
                  onClick={() => handleColorChange(color.value)}
                >
                  <span>{color.name}</span>
                  {column.color === color.value && (
                    <Check className="h-4 w-4" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                onClick={() => setShowColorPicker(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Column Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Column</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this column? All cards in this
              column will be removed.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Column
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </UICard>
  );
};

export default Column;
