import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Trash2, RefreshCw, Search, Filter, X } from "lucide-react";
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
} from "@/components/ui/dropdown-menu";
import { KanbanCard } from "@/types/kanban";

export type FilterOptions = {
  searchTerm: string;
  priorities: KanbanCard["priority"][];
  tags: string[];
};

interface BoardHeaderProps {
  onAddColumn: (title: string) => void;
  onLoadSample: () => void;
  onClearBoard: () => void;
  onFilter?: (filters: FilterOptions) => void;
  availableTags?: string[];
  hideLoadSample?: boolean;
}

const BoardHeader = ({
  onAddColumn,
  onLoadSample,
  onClearBoard,
  onFilter,
  availableTags = [],
  hideLoadSample = false,
}: BoardHeaderProps) => {
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPriorities, setSelectedPriorities] = useState<
    KanbanCard["priority"][]
  >(["low", "medium", "high"]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

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
      });
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedPriorities(["low", "medium", "high"]);
    setSelectedTags([]);

    if (onFilter) {
      onFilter({
        searchTerm: "",
        priorities: ["low", "medium", "high"],
        tags: [],
      });
    }
  };

  const isFiltering =
    searchTerm ||
    selectedPriorities.length < 3 ||
    (availableTags.length > 0 && selectedTags.length > 0);

  const priorityFilterCount = 3 - selectedPriorities.length;
  const tagFilterCount = selectedTags.length;
  const hasActiveFilters = priorityFilterCount > 0 || tagFilterCount > 0;

  return (
    <div className="flex flex-col gap-2 pb-2 border-b border-gray-200 dark:border-gray-800">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Kanban Board</h2>

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
                  {priorityFilterCount + tagFilterCount}
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
