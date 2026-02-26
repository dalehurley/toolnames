import React, { createContext, useContext, useReducer, useEffect } from "react";
import { nanoid } from "nanoid";
import { Note, NotesState, NotesContextType, SortBy } from "@/types/notes";
import { useLocalStorage } from "@/hooks/useLocalStorage";

// Initial state
const initialState: NotesState = {
  notes: [],
  currentNoteId: null,
  searchQuery: "",
  selectedTags: [],
  sortBy: "updated",
  onlyPinned: false,
};

// Action types
type Action =
  | { type: "ADD_NOTE"; payload: Note }
  | { type: "UPDATE_NOTE"; payload: { id: string; updates: Partial<Note> } }
  | { type: "DELETE_NOTE"; payload: string }
  | { type: "SELECT_NOTE"; payload: string | null }
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "TOGGLE_TAG"; payload: string }
  | { type: "TOGGLE_PINNED"; payload: string }
  | { type: "DUPLICATE_NOTE"; payload: Note }
  | { type: "SET_SORT_BY"; payload: SortBy }
  | { type: "SET_ONLY_PINNED"; payload: boolean }
  | { type: "IMPORT_NOTES"; payload: Note[] }
  | { type: "SET_NOTES"; payload: Note[] };

// Reducer function
const notesReducer = (state: NotesState, action: Action): NotesState => {
  switch (action.type) {
    case "ADD_NOTE":
      return {
        ...state,
        notes: [action.payload, ...state.notes],
        currentNoteId: action.payload.id,
      };
    case "UPDATE_NOTE":
      return {
        ...state,
        notes: state.notes.map((note) =>
          note.id === action.payload.id
            ? { ...note, ...action.payload.updates, updatedAt: Date.now() }
            : note
        ),
      };
    case "DELETE_NOTE":
      return {
        ...state,
        notes: state.notes.filter((note) => note.id !== action.payload),
        currentNoteId:
          state.currentNoteId === action.payload ? null : state.currentNoteId,
      };
    case "SELECT_NOTE":
      return {
        ...state,
        currentNoteId: action.payload,
      };
    case "SET_SEARCH_QUERY":
      return {
        ...state,
        searchQuery: action.payload,
      };
    case "TOGGLE_TAG":
      return {
        ...state,
        selectedTags: state.selectedTags.includes(action.payload)
          ? state.selectedTags.filter((tag) => tag !== action.payload)
          : [...state.selectedTags, action.payload],
      };
    case "TOGGLE_PINNED":
      return {
        ...state,
        notes: state.notes.map((note) =>
          note.id === action.payload
            ? { ...note, isPinned: !note.isPinned, updatedAt: Date.now() }
            : note
        ),
      };
    case "DUPLICATE_NOTE":
      return {
        ...state,
        notes: [action.payload, ...state.notes],
        currentNoteId: action.payload.id,
      };
    case "SET_SORT_BY":
      return {
        ...state,
        sortBy: action.payload,
      };
    case "SET_ONLY_PINNED":
      return {
        ...state,
        onlyPinned: action.payload,
      };
    case "IMPORT_NOTES":
      return {
        ...state,
        notes: [...action.payload, ...state.notes],
      };
    case "SET_NOTES":
      return {
        ...state,
        notes: action.payload,
      };
    default:
      return state;
  }
};

// Create context
const NotesContext = createContext<NotesContextType | undefined>(undefined);

// Provider component
export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [storedNotes, setStoredNotes] = useLocalStorage<Note[]>(
    "markdown-notes",
    []
  );
  const [state, dispatch] = useReducer(notesReducer, {
    ...initialState,
    notes: storedNotes,
  });

  // Sync state with localStorage whenever notes change
  useEffect(() => {
    setStoredNotes(state.notes);
  }, [state.notes, setStoredNotes]);

  // Add a new note
  const addNote = () => {
    const newNote: Note = {
      id: nanoid(),
      title: "Untitled Note",
      content: "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: [],
      isPinned: false,
    };
    dispatch({ type: "ADD_NOTE", payload: newNote });
  };

  // Update an existing note
  const updateNote = (id: string, updates: Partial<Note>) => {
    dispatch({ type: "UPDATE_NOTE", payload: { id, updates } });
  };

  // Delete a note
  const deleteNote = (id: string) => {
    dispatch({ type: "DELETE_NOTE", payload: id });
  };

  // Select a note
  const selectNote = (id: string | null) => {
    dispatch({ type: "SELECT_NOTE", payload: id });
  };

  // Search notes
  const searchNotes = (query: string) => {
    dispatch({ type: "SET_SEARCH_QUERY", payload: query });
  };

  // Toggle a tag selection for filtering
  const toggleTag = (tag: string) => {
    dispatch({ type: "TOGGLE_TAG", payload: tag });
  };

  // Toggle whether a note is pinned
  const togglePinned = (id: string) => {
    dispatch({ type: "TOGGLE_PINNED", payload: id });
  };

  // Duplicate a note
  const duplicateNote = (id: string) => {
    const note = state.notes.find((n) => n.id === id);
    if (!note) return;
    const newNote: Note = {
      ...note,
      id: nanoid(),
      title: `${note.title} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isPinned: false,
    };
    dispatch({ type: "DUPLICATE_NOTE", payload: newNote });
  };

  // Set sort order
  const setSortBy = (sortBy: SortBy) => {
    dispatch({ type: "SET_SORT_BY", payload: sortBy });
  };

  // Set pinned-only filter
  const setOnlyPinned = (onlyPinned: boolean) => {
    dispatch({ type: "SET_ONLY_PINNED", payload: onlyPinned });
  };

  // Export notes to JSON
  const exportNotes = () => {
    const dataStr = JSON.stringify(state.notes, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(
      dataStr
    )}`;

    const exportFileDefaultName = `markdown-notes-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  // Import notes from JSON
  const importNotes = (notes: Note[]) => {
    dispatch({ type: "IMPORT_NOTES", payload: notes });
  };

  // Context value
  const contextValue: NotesContextType = {
    state,
    addNote,
    updateNote,
    deleteNote,
    selectNote,
    searchNotes,
    toggleTag,
    togglePinned,
    duplicateNote,
    setSortBy,
    setOnlyPinned,
    exportNotes,
    importNotes,
  };

  return (
    <NotesContext.Provider value={contextValue}>
      {children}
    </NotesContext.Provider>
  );
};

// Custom hook to use the notes context
export const useNotes = (): NotesContextType => {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error("useNotes must be used within a NotesProvider");
  }
  return context;
};
