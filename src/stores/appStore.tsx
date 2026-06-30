import { createContext, useContext, useReducer, useCallback, type ReactNode, type Dispatch } from "react";
import type { Note, Notebook, Tag, AppSettings } from "@/types";

const DEFAULT_SETTINGS: AppSettings = {
  theme: "light",
  accentColor: "blue",
  fontFamily: "system",
  fontSize: 16,
  editorWidth: "medium",
  sidebarWidth: 260,
  layoutDensity: "comfortable",
  autoSave: true,
  autoSaveInterval: 3000,
  spellCheck: true,
  focusMode: false,
  showStatusBar: true,
  showLineNumbers: false,
  defaultNotebookId: null,
};

export type ViewType = "dashboard" | "notes" | "notebook" | "notebook-notes" | "tags" | "tag-notes" | "favorites" | "recent" | "archive" | "trash" | "settings" | "search";

type AppState = {
  notes: Note[];
  notebooks: Notebook[];
  tags: Tag[];
  settings: AppSettings;
  activeView: ViewType;
  activeNoteId: string | null;
  activeNotebookId: string | null;
  activeTagId: string | null;
  sidebarOpen: boolean;
  sidebarExpanded: boolean;
  commandPaletteOpen: boolean;
  searchQuery: string;
  toasts: { id: string; message: string; type: "success" | "error" | "info" }[];
};

type Action =
  | { type: "SET_NOTES"; notes: Note[] }
  | { type: "ADD_NOTE"; note: Note }
  | { type: "UPDATE_NOTE"; id: string; updates: Partial<Note> }
  | { type: "DELETE_NOTE"; id: string }
  | { type: "SET_NOTEBOOKS"; notebooks: Notebook[] }
  | { type: "ADD_NOTEBOOK"; notebook: Notebook }
  | { type: "UPDATE_NOTEBOOK"; id: string; updates: Partial<Notebook> }
  | { type: "DELETE_NOTEBOOK"; id: string }
  | { type: "SET_TAGS"; tags: Tag[] }
  | { type: "ADD_TAG"; tag: Tag }
  | { type: "UPDATE_TAG"; id: string; updates: Partial<Tag> }
  | { type: "DELETE_TAG"; id: string }
  | { type: "SET_SETTINGS"; settings: Partial<AppSettings> }
  | { type: "SET_ACTIVE_VIEW"; view: ViewType }
  | { type: "SET_ACTIVE_NOTE"; id: string | null }
  | { type: "SET_ACTIVE_NOTEBOOK"; id: string | null }
  | { type: "SET_ACTIVE_TAG"; id: string | null }
  | { type: "TOGGLE_SIDEBAR" }
  | { type: "SET_SIDEBAR_OPEN"; open: boolean }
  | { type: "TOGGLE_COMMAND_PALETTE" }
  | { type: "SET_COMMAND_PALETTE_OPEN"; open: boolean }
  | { type: "SET_SEARCH_QUERY"; query: string }
  | { type: "ADD_TOAST"; toast: { id: string; message: string; type: "success" | "error" | "info" } }
  | { type: "REMOVE_TOAST"; id: string };

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_NOTES":
      return { ...state, notes: action.notes };
    case "ADD_NOTE":
      return { ...state, notes: [action.note, ...state.notes] };
    case "UPDATE_NOTE":
      return { ...state, notes: state.notes.map((n) => (n.id === action.id ? { ...n, ...action.updates } : n)) };
    case "DELETE_NOTE":
      return { ...state, notes: state.notes.filter((n) => n.id !== action.id) };
    case "SET_NOTEBOOKS":
      return { ...state, notebooks: action.notebooks };
    case "ADD_NOTEBOOK":
      return { ...state, notebooks: [...state.notebooks, action.notebook] };
    case "UPDATE_NOTEBOOK":
      return { ...state, notebooks: state.notebooks.map((n) => (n.id === action.id ? { ...n, ...action.updates } : n)) };
    case "DELETE_NOTEBOOK":
      return { ...state, notebooks: state.notebooks.filter((n) => n.id !== action.id) };
    case "SET_TAGS":
      return { ...state, tags: action.tags };
    case "ADD_TAG":
      return { ...state, tags: [...state.tags, action.tag] };
    case "UPDATE_TAG":
      return { ...state, tags: state.tags.map((t) => (t.id === action.id ? { ...t, ...action.updates } : t)) };
    case "DELETE_TAG":
      return { ...state, tags: state.tags.filter((t) => t.id !== action.id) };
    case "SET_SETTINGS":
      return { ...state, settings: { ...state.settings, ...action.settings } };
    case "SET_ACTIVE_VIEW":
      return { ...state, activeView: action.view };
    case "SET_ACTIVE_NOTE":
      return { ...state, activeNoteId: action.id };
    case "SET_ACTIVE_NOTEBOOK":
      return { ...state, activeNotebookId: action.id };
    case "SET_ACTIVE_TAG":
      return { ...state, activeTagId: action.id };
    case "TOGGLE_SIDEBAR":
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case "SET_SIDEBAR_OPEN":
      return { ...state, sidebarOpen: action.open };
    case "TOGGLE_COMMAND_PALETTE":
      return { ...state, commandPaletteOpen: !state.commandPaletteOpen };
    case "SET_COMMAND_PALETTE_OPEN":
      return { ...state, commandPaletteOpen: action.open };
    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.query };
    case "ADD_TOAST":
      return { ...state, toasts: [...state.toasts, action.toast] };
    case "REMOVE_TOAST":
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };
    default:
      return state;
  }
}

function getInitialState(): AppState {
  try {
    const raw = localStorage.getItem("taccuino-state");
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...parsed,
        commandPaletteOpen: false,
        sidebarOpen: parsed.sidebarOpen ?? true,
        toasts: [],
        searchQuery: "",
      };
    }
  } catch {
    /* ignore */
  }
  return {
    notes: [],
    notebooks: [
      { id: "default", name: "Personal", description: "Your personal notes", parentId: null, icon: "📓", color: "#3b82f6", createdAt: Date.now(), updatedAt: Date.now(), noteCount: 0 },
    ],
    tags: [],
    settings: DEFAULT_SETTINGS,
    activeView: "dashboard",
    activeNoteId: null,
    activeNotebookId: null,
    activeTagId: null,
    sidebarOpen: true,
    sidebarExpanded: true,
    commandPaletteOpen: false,
    searchQuery: "",
    toasts: [],
  };
}

const AppContext = createContext<{ state: AppState; dispatch: Dispatch<Action> } | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, undefined, getInitialState);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppState must be used within AppProvider");
  return ctx;
}

export function useAppActions() {
  const { dispatch } = useAppState();

  const addNote = useCallback((note: Note) => dispatch({ type: "ADD_NOTE", note }), [dispatch]);
  const updateNote = useCallback((id: string, updates: Partial<Note>) => dispatch({ type: "UPDATE_NOTE", id, updates }), [dispatch]);
  const deleteNote = useCallback((id: string) => dispatch({ type: "DELETE_NOTE", id }), [dispatch]);
  const setNotes = useCallback((notes: Note[]) => dispatch({ type: "SET_NOTES", notes }), [dispatch]);

  const addNotebook = useCallback((notebook: Notebook) => dispatch({ type: "ADD_NOTEBOOK", notebook }), [dispatch]);
  const updateNotebook = useCallback((id: string, updates: Partial<Notebook>) => dispatch({ type: "UPDATE_NOTEBOOK", id, updates }), [dispatch]);
  const deleteNotebook = useCallback((id: string) => dispatch({ type: "DELETE_NOTEBOOK", id }), [dispatch]);

  const addTag = useCallback((tag: Tag) => dispatch({ type: "ADD_TAG", tag }), [dispatch]);
  const updateTag = useCallback((id: string, updates: Partial<Tag>) => dispatch({ type: "UPDATE_TAG", id, updates }), [dispatch]);
  const deleteTag = useCallback((id: string) => dispatch({ type: "DELETE_TAG", id }), [dispatch]);

  const setSettings = useCallback((settings: Partial<AppSettings>) => dispatch({ type: "SET_SETTINGS", settings }), [dispatch]);

  const navigate = useCallback((view: ViewType) => {
    dispatch({ type: "SET_ACTIVE_VIEW", view });
    dispatch({ type: "SET_ACTIVE_NOTE", id: null });
  }, [dispatch]);

  const openNote = useCallback((id: string) => {
    dispatch({ type: "SET_ACTIVE_NOTE", id });
    dispatch({ type: "SET_ACTIVE_VIEW", view: "notes" });
  }, [dispatch]);

  const toggleSidebar = useCallback(() => dispatch({ type: "TOGGLE_SIDEBAR" }), [dispatch]);
  const toggleCommandPalette = useCallback(() => dispatch({ type: "TOGGLE_COMMAND_PALETTE" }), [dispatch]);

  const addToast = useCallback((message: string, type: "success" | "error" | "info" = "info") => {
    const id = crypto.randomUUID();
    dispatch({ type: "ADD_TOAST", toast: { id, message, type } });
    setTimeout(() => dispatch({ type: "REMOVE_TOAST", id }), 3000);
  }, [dispatch]);

  return {
    addNote, updateNote, deleteNote, setNotes,
    addNotebook, updateNotebook, deleteNotebook,
    addTag, updateTag, deleteTag,
    setSettings,
    navigate, openNote, toggleSidebar, toggleCommandPalette,
    addToast,
  };
}
