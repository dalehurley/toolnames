import { useState, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { KanbanCard, KanbanColumn, CardTemplate } from "@/types/kanban";
import { Badge } from "@/components/ui/badge";
import {
  CalendarClock,
  Trash,
  Edit,
  AlertCircle,
  User,
  Tag,
  Copy,
  Palette,
  MoreVertical,
  X,
  Check,
  ArrowRightCircle,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  Clock,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card as UICard, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { format, formatDistanceToNow, isPast, isWithinInterval, addDays } from "date-fns";
import CardEditModal from "./CardEditModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";

// Priority colors
const priorityColors = {
  high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  medium:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
};

// Available card colors
const cardColors = [
  { name: "Default", value: "bg-white dark:bg-gray-800" },
  { name: "Blue", value: "bg-blue-50 dark:bg-blue-900/30" },
  { name: "Green", value: "bg-green-50 dark:bg-green-900/30" },
  { name: "Yellow", value: "bg-yellow-50 dark:bg-yellow-900/30" },
  { name: "Red", value: "bg-red-50 dark:bg-red-900/30" },
  { name: "Purple", value: "bg-purple-50 dark:bg-purple-900/30" },
  { name: "Pink", value: "bg-pink-50 dark:bg-pink-900/30" },
  { name: "Gray", value: "bg-gray-100 dark:bg-gray-900" },
];

interface CardProps {
  card: KanbanCard;
  isDragging?: boolean;
  onDelete: (id: string) => void;
  onEdit: (id: string, data: Partial<KanbanCard>) => void;
  onDuplicate?: (id: string) => void;
  onSaveTemplate?: (template: CardTemplate) => void;
  onMoveCard?: (cardId: string, targetColumnId: string) => void;
  onMoveToTop?: (cardId: string) => void;
  onMoveToBottom?: (cardId: string) => void;
  allColumns?: KanbanColumn[];
  isEditing?: boolean;
  onCloseEdit?: () => void;
}

const Card = ({
  card,
  isDragging = false,
  onDelete,
  onEdit,
  onDuplicate,
  onSaveTemplate,
  onMoveCard,
  onMoveToTop,
  onMoveToBottom,
  allColumns = [],
  isEditing = false,
  onCloseEdit,
}: CardProps) => {
  const [showEdit, setShowEdit] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Calculate checklist progress
  const checklistProgress = card.checklist
    ? Math.round(
        (card.checklist.filter((item) => item.checked).length /
          card.checklist.length) *
          100
      )
    : 0;

  // Due date status
  const now = new Date();
  const dueDate = card.dueDate ? new Date(card.dueDate) : null;
  const isOverdue = dueDate ? isPast(dueDate) : false;
  const isDueSoon = dueDate
    ? isWithinInterval(dueDate, { start: now, end: addDays(now, 3) }) && !isOverdue
    : false;

  // Format due date
  const formattedDueDate = dueDate ? format(dueDate, "MMM d, yyyy") : null;

  // Card age
  const cardAge = formatDistanceToNow(new Date(card.createdAt), { addSuffix: false });

  // Toggle a checklist item
  const toggleChecklistItem = (itemId: string) => {
    if (!card.checklist) return;

    const updatedChecklist = card.checklist.map((item) =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );

    onEdit(card.id, { checklist: updatedChecklist });
  };

  // Handle card color change
  const handleColorChange = (colorValue: string) => {
    onEdit(card.id, { color: colorValue });
    setShowColorPicker(false);
  };

  // Get card background color
  const getCardBackground = () => {
    return card.color || "bg-white dark:bg-gray-800";
  };

  // Border highlight based on due status
  const getDueBorderClass = () => {
    if (isOverdue) return "border-l-4 border-l-red-500";
    if (isDueSoon) return "border-l-4 border-l-amber-400";
    return "";
  };

  // Effect to handle external control of edit modal
  useEffect(() => {
    if (isEditing) {
      setShowEdit(true);
    }
  }, [isEditing]);

  // Handle closing the edit modal
  const handleCloseEdit = () => {
    setShowEdit(false);
    if (onCloseEdit) {
      onCloseEdit();
    }
  };

  // Description truncation: show only 2 lines unless expanded
  const descriptionLines = card.description.split("\n");
  const isLongDescription =
    card.description.length > 100 || descriptionLines.length > 2;
  const truncatedDescription = isLongDescription && !isDescriptionExpanded
    ? card.description.slice(0, 100).trimEnd() + "…"
    : card.description;

  // Columns the card can be moved to (excluding the current one)
  const currentColumnId = allColumns.find((col) =>
    col.cardIds.includes(card.id)
  )?.id;
  const moveTargetColumns = allColumns.filter(
    (col) => col.id !== currentColumnId
  );

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`mb-2 cursor-grab ${isDragging ? "z-10" : ""}`}
        {...attributes}
        {...listeners}
      >
        <UICard
          className={`shadow-sm hover:shadow transition-shadow duration-200 ${getCardBackground()} ${getDueBorderClass()}`}
        >
          <CardContent className="p-3">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-sm">{card.title}</h3>
              <div className="flex items-center space-x-1">
                <Badge
                  variant="outline"
                  className={priorityColors[card.priority]}
                >
                  {card.priority}
                </Badge>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 ml-1"
                    >
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setShowEdit(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Card
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => setShowColorPicker(true)}>
                      <Palette className="h-4 w-4 mr-2" />
                      Change Color
                    </DropdownMenuItem>

                    {onDuplicate && (
                      <DropdownMenuItem onClick={() => onDuplicate(card.id)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                    )}

                    {onMoveToTop && (
                      <DropdownMenuItem onClick={() => onMoveToTop(card.id)}>
                        <ArrowUp className="h-4 w-4 mr-2" />
                        Move to Top
                      </DropdownMenuItem>
                    )}

                    {onMoveToBottom && (
                      <DropdownMenuItem onClick={() => onMoveToBottom(card.id)}>
                        <ArrowDown className="h-4 w-4 mr-2" />
                        Move to Bottom
                      </DropdownMenuItem>
                    )}

                    {onMoveCard && moveTargetColumns.length > 0 && (
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <ArrowRightCircle className="h-4 w-4 mr-2" />
                          Move to Column
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          {moveTargetColumns.map((col) => (
                            <DropdownMenuItem
                              key={col.id}
                              onClick={() => onMoveCard(card.id, col.id)}
                            >
                              {col.title}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    )}

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      className="text-red-500 focus:text-red-500"
                      onClick={() => setConfirmDelete(true)}
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Overdue / due-soon badge */}
            {isOverdue && (
              <div className="flex items-center gap-1 text-red-600 dark:text-red-400 text-xs mb-2">
                <AlertCircle className="h-3 w-3" />
                <span>Overdue</span>
              </div>
            )}
            {isDueSoon && !isOverdue && (
              <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-xs mb-2">
                <Clock className="h-3 w-3" />
                <span>Due soon</span>
              </div>
            )}

            {/* Description with truncation */}
            {card.description && (
              <div className="mb-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {truncatedDescription}
                </p>
                {isLongDescription && (
                  <button
                    className="text-xs text-primary mt-0.5 flex items-center gap-0.5"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDescriptionExpanded((v) => !v);
                    }}
                  >
                    {isDescriptionExpanded ? (
                      <>
                        <ChevronUp className="h-3 w-3" /> Show less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3 w-3" /> Read more
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Story points badge */}
            {card.storyPoints !== undefined && card.storyPoints !== null && (
              <div className="flex items-center gap-1 mb-2">
                <Badge variant="secondary" className="text-xs gap-1">
                  <Zap className="h-3 w-3" />
                  {card.storyPoints} {card.storyPoints === 1 ? "pt" : "pts"}
                </Badge>
              </div>
            )}

            {card.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {card.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {card.checklist && card.checklist.length > 0 && (
              <div className="mb-3">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-gray-600 dark:text-gray-400">
                    Checklist (
                    {card.checklist.filter((item) => item.checked).length}/
                    {card.checklist.length})
                  </span>
                  <span>{checklistProgress}%</span>
                </div>
                <Progress value={checklistProgress} className="h-1 mb-2" />
                <div className="space-y-1">
                  {card.checklist.map((item) => (
                    <div key={item.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`check-${item.id}`}
                        checked={item.checked}
                        onCheckedChange={() => toggleChecklistItem(item.id)}
                      />
                      <label
                        htmlFor={`check-${item.id}`}
                        className={`text-xs ${
                          item.checked ? "line-through text-gray-400" : ""
                        }`}
                      >
                        {item.text}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-y-2 justify-between text-xs text-gray-500 dark:text-gray-400">
              {formattedDueDate && (
                <div
                  className={`flex items-center ${
                    isOverdue
                      ? "text-red-600 dark:text-red-400 font-medium"
                      : isDueSoon
                      ? "text-amber-600 dark:text-amber-400 font-medium"
                      : ""
                  }`}
                >
                  <CalendarClock className="mr-1 h-3 w-3" />
                  {formattedDueDate}
                </div>
              )}

              {card.assignee && (
                <div className="flex items-center">
                  <User className="mr-1 h-3 w-3" />
                  {card.assignee}
                </div>
              )}

              {/* Card age */}
              <div className="flex items-center w-full text-gray-400 dark:text-gray-600 mt-1">
                <Clock className="mr-1 h-3 w-3" />
                <span>{cardAge} ago</span>
              </div>
            </div>
          </CardContent>
        </UICard>
      </div>

      {showEdit && (
        <CardEditModal
          card={card}
          onSave={(data: Partial<KanbanCard>) => {
            onEdit(card.id, data);
            handleCloseEdit();
          }}
          onCancel={handleCloseEdit}
          onSaveTemplate={onSaveTemplate}
        />
      )}

      {/* Color picker dialog */}
      {showColorPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Choose Card Color</h3>
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
              {cardColors.map((color) => (
                <button
                  key={color.name}
                  className={`${color.value} rounded p-2 border border-gray-200 dark:border-gray-700 flex items-center justify-between hover:border-primary transition-colors`}
                  onClick={() => handleColorChange(color.value)}
                >
                  <span>{color.name}</span>
                  {card.color === color.value && <Check className="h-4 w-4" />}
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

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-sm">
            <div className="flex items-center mb-4 text-red-500">
              <AlertCircle className="w-6 h-6 mr-2" />
              <h3 className="text-lg font-semibold">Delete Card</h3>
            </div>
            <p className="mb-4">
              Are you sure you want to delete "{card.title}"? This action cannot
              be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  onDelete(card.id);
                  setConfirmDelete(false);
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Card;
