export type SortBy = "updated" | "created" | "title";

export interface Note {
  id: string;           // Unique identifier
  title: string;        // Note title
  content: string;      // Markdown content
  createdAt: number;    // Timestamp
  updatedAt: number;    // Timestamp
  tags: string[];       // Tags for organization
  isPinned: boolean;    // Whether note is pinned to top
}

export interface NotesState {
  notes: Note[];
  currentNoteId: string | null;
  searchQuery: string;
  selectedTags: string[];
  sortBy: SortBy;
  onlyPinned: boolean;
}

export interface NotesContextType {
  state: NotesState;
  addNote: () => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  selectNote: (id: string | null) => void;
  searchNotes: (query: string) => void;
  toggleTag: (tag: string) => void;
  togglePinned: (id: string) => void;
  duplicateNote: (id: string) => void;
  setSortBy: (sortBy: SortBy) => void;
  setOnlyPinned: (onlyPinned: boolean) => void;
  exportNotes: () => void;
  importNotes: (notes: Note[]) => void;
}
