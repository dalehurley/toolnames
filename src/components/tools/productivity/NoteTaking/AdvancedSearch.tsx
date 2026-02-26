import React, { useState } from "react";
import { useNotes } from "@/contexts/NotesContext";
import {
  SearchIcon,
  Tag as TagIcon,
  X as XIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const AdvancedSearch: React.FC = () => {
  const {
    state: { notes, searchQuery, selectedTags },
    searchNotes,
    toggleTag,
  } = useNotes();

  // Get all unique tags across all notes
  const allTags = Array.from(
    new Set(notes.flatMap((note) => note.tags))
  ).sort();

  // Advanced search state
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [sortBy, setSortBy] = useState<string>("updated");
  const [onlyPinned, setOnlyPinned] = useState<boolean>(false);

  // Clear all filters
  const clearFilters = () => {
    searchNotes("");
    selectedTags.forEach((tag) => toggleTag(tag));
    setOnlyPinned(false);
    setSortBy("updated");
  };

  return (
    <div className="space-y-2">
      {/* Basic search input */}
      <div className="relative">
        <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search notes..."
          className="pl-8 pr-8"
          value={searchQuery}
          onChange={(e) => searchNotes(e.target.value)}
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1 h-6 w-6"
            onClick={() => searchNotes("")}
          >
            <XIcon className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Advanced search toggle */}
      <Collapsible
        open={isAdvancedOpen}
        onOpenChange={setIsAdvancedOpen}
        className="border rounded-md"
      >
        <div className="flex justify-between items-center px-3 py-2">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="p-1 -ml-1.5 h-auto">
              {isAdvancedOpen ? (
                <ChevronUpIcon className="h-4 w-4 mr-1" />
              ) : (
                <ChevronDownIcon className="h-4 w-4 mr-1" />
              )}
              <span className="text-sm font-medium">Advanced Search</span>
            </Button>
          </CollapsibleTrigger>

          {(searchQuery || selectedTags.length > 0 || onlyPinned) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-7 px-2 text-xs"
            >
              Clear filters
            </Button>
          )}
        </div>

        <CollapsibleContent className="px-3 pb-3 space-y-3">
          {/* Tags filter */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Tags</Label>
            <div className="flex flex-wrap gap-1">
              {allTags.length > 0 ? (
                allTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer text-xs"
                    onClick={() => toggleTag(tag)}
                  >
                    <TagIcon className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">
                  No tags found
                </span>
              )}
            </div>
          </div>

          {/* Sort and filter options */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="sort-by" className="text-xs font-medium">
                Sort by
              </Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger id="sort-by" className="h-8 text-xs">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="updated">Last updated</SelectItem>
                  <SelectItem value="created">Date created</SelectItem>
                  <SelectItem value="title">Title (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Show only</Label>
              <div className="flex items-center space-x-2 h-8 p-1">
                <Checkbox
                  id="pinned-only"
                  checked={onlyPinned}
                  onCheckedChange={(checked) => setOnlyPinned(checked === true)}
                />
                <Label
                  htmlFor="pinned-only"
                  className="text-xs font-normal cursor-pointer"
                >
                  Pinned notes
                </Label>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Active filters display */}
      {(searchQuery || selectedTags.length > 0 || onlyPinned) && (
        <div className="flex flex-wrap gap-1 pt-1">
          {searchQuery && (
            <Badge variant="secondary" className="text-xs">
              Search: {searchQuery}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1"
                onClick={() => searchNotes("")}
              >
                <XIcon className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {selectedTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              #{tag}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1"
                onClick={() => toggleTag(tag)}
              >
                <XIcon className="h-3 w-3" />
              </Button>
            </Badge>
          ))}

          {onlyPinned && (
            <Badge variant="secondary" className="text-xs">
              Pinned only
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1"
                onClick={() => setOnlyPinned(false)}
              >
                <XIcon className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
