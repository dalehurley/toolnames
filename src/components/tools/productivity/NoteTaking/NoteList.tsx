import React from "react";
import { useNotes } from "@/contexts/NotesContext";
import { createSnippet } from "@/utils/markdownUtils";
import { SearchIcon, PlusIcon, TagIcon, PinIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

export const NoteList: React.FC = () => {
  const {
    state: { notes, currentNoteId, searchQuery, selectedTags },
    addNote,
    selectNote,
    searchNotes,
    toggleTag,
    togglePinned,
  } = useNotes();

  // Get all unique tags across all notes
  const allTags = Array.from(
    new Set(notes.flatMap((note) => note.tags))
  ).sort();

  // Filter notes based on search query and selected tags
  const filteredNotes = notes.filter((note) => {
    // Filter by search query
    const matchesSearch =
      searchQuery === "" ||
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter by selected tags
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.every((tag) => note.tags.includes(tag));

    return matchesSearch && matchesTags;
  });

  // Sort notes: pinned first, then by updated date
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    // First by pinned status
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;

    // Then by updated date (newest first)
    return b.updatedAt - a.updatedAt;
  });

  return (
    <div className="flex flex-col h-full border-r">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold mb-4">Notes</h2>

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

        {/* Tags filter */}
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
            {searchQuery || selectedTags.length > 0
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
                        className="h-6 w-6"
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
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(note.updatedAt, { addSuffix: true })}
                    </span>
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
