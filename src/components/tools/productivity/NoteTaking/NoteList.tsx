import React from "react";
import { useNotes } from "@/contexts/NotesContext";
import { createSnippet } from "@/utils/markdownUtils";
import { SearchIcon, PlusIcon, TagIcon, PinIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDistanceToNow, format } from "date-fns";

export const NoteList: React.FC = () => {
  const {
    state: { notes, currentNoteId, searchQuery, selectedTags, sortBy, onlyPinned },
    addNote,
    selectNote,
    searchNotes,
    toggleTag,
    togglePinned,
  } = useNotes();

  // Build tag → count map
  const tagCounts = notes.reduce<Record<string, number>>((acc, note) => {
    note.tags.forEach((tag) => {
      acc[tag] = (acc[tag] ?? 0) + 1;
    });
    return acc;
  }, {});

  // All unique tags sorted alphabetically
  const allTags = Object.keys(tagCounts).sort();

  // Filter notes based on search query, selected tags, and pinned-only
  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      searchQuery === "" ||
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.every((tag) => note.tags.includes(tag));

    const matchesPinned = !onlyPinned || note.isPinned;

    return matchesSearch && matchesTags && matchesPinned;
  });

  // Sort notes: pinned first, then by the chosen sort key
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;

    if (sortBy === "title") {
      return a.title.localeCompare(b.title);
    }
    if (sortBy === "created") {
      return b.createdAt - a.createdAt;
    }
    // default: "updated"
    return b.updatedAt - a.updatedAt;
  });

  const totalCount = notes.length;
  const filteredCount = sortedNotes.length;
  const isFiltered = searchQuery || selectedTags.length > 0 || onlyPinned;

  return (
    <div className="flex flex-col h-full border-r">
      <div className="p-4 border-b">
        {/* Header with note count */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Notes</h2>
          <span className="text-xs text-muted-foreground">
            {isFiltered
              ? `${filteredCount} of ${totalCount}`
              : `${totalCount} ${totalCount === 1 ? "note" : "notes"}`}
          </span>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search notes..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => searchNotes(e.target.value)}
          />
        </div>

        {/* Tags filter with per-tag counts */}
        {allTags.length > 0 && (
          <ScrollArea className="w-full whitespace-nowrap mb-4 pb-2 max-h-20">
            <div className="flex gap-1 flex-wrap">
              {allTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag)}
                >
                  <TagIcon className="h-3 w-3 mr-1" />
                  {tag}
                  <span className="ml-1 opacity-60">{tagCounts[tag]}</span>
                </Badge>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* New note button */}
        <Button onClick={addNote} className="w-full">
          <PlusIcon className="h-4 w-4 mr-2" />
          New Note
        </Button>
      </div>

      {/* Notes list */}
      <ScrollArea className="flex-1">
        {sortedNotes.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {isFiltered
              ? "No notes match your filters"
              : "Create your first note!"}
          </div>
        ) : (
          <div className="p-2">
            {sortedNotes.map((note) => {
              const isActive = currentNoteId === note.id;
              return (
                <Card
                  key={note.id}
                  className={`mb-2 p-3 cursor-pointer hover:bg-accent ${
                    isActive ? "bg-accent" : ""
                  }`}
                  onClick={() => selectNote(note.id)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium line-clamp-1">{note.title}</h3>
                    {note.isPinned && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePinned(note.id);
                        }}
                      >
                        <PinIcon className="h-4 w-4 text-amber-500" />
                      </Button>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {createSnippet(note.content, 120)}
                  </p>

                  <div className="flex justify-between items-center">
                    <div className="flex gap-1 flex-wrap">
                      {note.tags.slice(0, 3).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {note.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{note.tags.length - 3}
                        </Badge>
                      )}
                    </div>

                    {/* Updated date with created date in tooltip */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-xs text-muted-foreground cursor-default">
                            {formatDistanceToNow(note.updatedAt, { addSuffix: true })}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                          <div className="text-xs space-y-0.5">
                            <div>Updated: {format(note.updatedAt, "PPpp")}</div>
                            <div>Created: {format(note.createdAt, "PPpp")}</div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
