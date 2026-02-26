import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Trash2, RefreshCw, Search, Filter, X, Download, Upload, Edit2, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { KanbanCard } from "@/types/kanban";

export type FilterOptions = {
  searchTerm: string;
  priorities: KanbanCard["priority"][];
  tags: string[];
  assignees: string[];
};

interface BoardHeaderProps {
  onAddColumn: (title: string) => void;
  onLoadSample: () => void;
  onClearBoard: () => void;
  onFilter?: (filters: FilterOptions) => void;
  availableTags?: string[];
  availableAssignees?: string[];
  hideLoadSample?: boolean;
  boardName?: string;
  onRenameBoard?: (name: string) => void;
  onExportBoard?: () => void;
  onImportBoard?: () => void;
}

const BoardHeader = ({
  onAddColumn,
  onLoadSample,
  onClearBoard,
  onFilter,
  availableTags = [],
  availableAssignees = [],
  hideLoadSample = false,
  boardName = "Kanban Board",
  onRenameBoard,
  onExportBoard,
  onImportBoard,
}: BoardHeaderProps) => {
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  // Board name editing
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState(boardName);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPriorities, setSelectedPriorities] = useState<
    KanbanCard["priority"][]
  >(["low", "medium", "high"]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);

  const handleAddColumn = () => {
    if (newColumnTitle.trim()) {
      onAddColumn(newColumnTitle.trim());
      setNewColumnTitle("");
      setShowAddColumn(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (onFilter) {
      onFilter({
        searchTerm: value,
        priorities: selectedPriorities,
        tags: selectedTags,
        assignees: selectedAssignees,
      });
    }
  };

  const handlePriorityFilter = (priority: KanbanCard["priority"]) => {
    const newPriorities = selectedPriorities.includes(priority)
      ? selectedPriorities.filter((p) => p !== priority)
      : [...selectedPriorities, priority];

    setSelectedPriorities(newPriorities);

    if (onFilter) {
      onFilter({
        searchTerm,
        priorities: newPriorities,
        tags: selectedTags,
        assignees: selectedAssignees,
      });
    }
  };

  const handleTagFilter = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];

    setSelectedTags(newTags);

    if (onFilter) {
      onFilter({
        searchTerm,
        priorities: selectedPriorities,
        tags: newTags,
        assignees: selectedAssignees,
      });
    }
  };

  const handleAssigneeFilter = (assignee: string) => {
    const newAssignees = selectedAssignees.includes(assignee)
      ? selectedAssignees.filter((a) => a !== assignee)
      : [...selectedAssignees, assignee];

    setSelectedAssignees(newAssignees);

    if (onFilter) {
      onFilter({
        searchTerm,
        priorities: selectedPriorities,
        tags: selectedTags,
        assignees: newAssignees,
      });
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedPriorities(["low", "medium", "high"]);
    setSelectedTags([]);
    setSelectedAssignees([]);

    if (onFilter) {
      onFilter({
        searchTerm: "",
        priorities: ["low", "medium", "high"],
        tags: [],
        assignees: [],
      });
    }
  };

  const startEditingName = () => {
    setEditingName(boardName);
    setIsEditingName(true);
    setTimeout(() => nameInputRef.current?.select(), 0);
  };

  const saveEditingName = () => {
    if (editingName.trim() && onRenameBoard) {
      onRenameBoard(editingName.trim());
    }
    setIsEditingName(false);
  };

  const isFiltering =
    searchTerm ||
    selectedPriorities.length < 3 ||
    (availableTags.length > 0 && selectedTags.length > 0) ||
    selectedAssignees.length > 0;

  const priorityFilterCount = 3 - selectedPriorities.length;
  const tagFilterCount = selectedTags.length;
  const assigneeFilterCount = selectedAssignees.length;
  const hasActiveFilters = priorityFilterCount > 0 || tagFilterCount > 0 || assigneeFilterCount > 0;

  return (
    <div className="flex flex-col gap-2 pb-2 border-b border-gray-200 dark:border-gray-800">
      <div className="flex justify-between items-center">
        {/* Editable board name */}
        <div className="flex items-center gap-2">
          {isEditingName ? (
            <div className="flex items-center gap-1">
              <Input
                ref={nameInputRef}
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveEditingName();
                  if (e.key === "Escape") setIsEditingName(false);
                }}
                className="h-8 text-xl font-semibold w-56"
                autoFocus
              />
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={saveEditingName}>
                <Check className="h-4 w-4 text-green-600" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setIsEditingName(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1 group">
              <h2 className="text-xl font-semibold">{boardName}</h2>
              {onRenameBoard && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={startEditingName}
                >
                  <Edit2 className="h-3.5 w-3.5 text-gray-400" />
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => setShowAddColumn(true)}
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            Add Column
          </Button>

          {!hideLoadSample && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={onLoadSample}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Load Sample
            </Button>
          )}

          {onExportBoard && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={onExportBoard}
              title="Export board as JSON"
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          )}

          {onImportBoard && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={onImportBoard}
              title="Import board from JSON"
            >
              <Upload className="h-4 w-4 mr-1" />
              Import
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            className="text-xs text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            onClick={() => setShowConfirmClear(true)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear Board
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search cards..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {searchTerm && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600"
              onClick={() => handleSearch("")}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={isFiltering ? "default" : "outline"}
              size="sm"
              className="gap-1"
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="ml-1 bg-primary-foreground text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {priorityFilterCount + tagFilterCount + assigneeFilterCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="p-2">
              <h4 className="font-medium text-sm mb-1">Priority</h4>
              <DropdownMenuCheckboxItem
                checked={selectedPriorities.includes("high")}
                onCheckedChange={() => handlePriorityFilter("high")}
              >
                High
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedPriorities.includes("medium")}
                onCheckedChange={() => handlePriorityFilter("medium")}
              >
                Medium
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedPriorities.includes("low")}
                onCheckedChange={() => handlePriorityFilter("low")}
              >
                Low
              </DropdownMenuCheckboxItem>
            </div>

            {availableTags.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <div className="p-2">
                  <h4 className="font-medium text-sm mb-1">Tags</h4>
                  {availableTags.map((tag) => (
                    <DropdownMenuCheckboxItem
                      key={tag}
                      checked={selectedTags.includes(tag)}
                      onCheckedChange={() => handleTagFilter(tag)}
                    >
                      {tag}
                    </DropdownMenuCheckboxItem>
                  ))}
                </div>
              </>
            )}

            {availableAssignees.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <div className="p-2">
                  <DropdownMenuLabel className="p-0 mb-1 font-medium text-sm">Assignee</DropdownMenuLabel>
                  {availableAssignees.map((assignee) => (
                    <DropdownMenuCheckboxItem
                      key={assignee}
                      checked={selectedAssignees.includes(assignee)}
                      onCheckedChange={() => handleAssigneeFilter(assignee)}
                    >
                      {assignee}
                    </DropdownMenuCheckboxItem>
                  ))}
                </div>
              </>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={clearFilters}
              disabled={!isFiltering}
              className="justify-center text-center cursor-pointer"
            >
              Clear Filters
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Add Column Dialog */}
      <Dialog open={showAddColumn} onOpenChange={setShowAddColumn}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Column</DialogTitle>
            <DialogDescription>
              Enter a name for your new column
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Input
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              placeholder="Column name"
              className="mt-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddColumn();
              }}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddColumn(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddColumn}>Add Column</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Clear Dialog */}
      <Dialog open={showConfirmClear} onOpenChange={setShowConfirmClear}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Clear Board</DialogTitle>
            <DialogDescription>
              Are you sure you want to clear the board? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmClear(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onClearBoard();
                setShowConfirmClear(false);
              }}
            >
              Clear Board
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BoardHeader;
