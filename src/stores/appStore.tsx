import { createContext, useContext, useReducer, useCallback, type ReactNode, type Dispatch } from "react";
import type { Note, Notebook, Tag, AppSettings } from "@/types";
import * as api from "@/lib/api";

const DEFAULT_SETTINGS: AppSettings = {
  theme: "dark",
  accentColor: "blue",
  fontFamily: "poppins",
  fontSize: 18,
  editorWidth: "medium",
  sidebarWidth: 260,
  layoutDensity: "compact",
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
  loading: boolean;
  loaded: boolean;
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
  | { type: "REMOVE_TOAST"; id: string }
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "SET_LOADED"; loaded: boolean };

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
    case "SET_LOADING":
      return { ...state, loading: action.loading };
    case "SET_LOADED":
      return { ...state, loaded: action.loaded };
    default:
      return state;
  }
}

function getInitialState(): AppState {
  return {
    notes: [],
    notebooks: [],
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
    loading: false,
    loaded: false,
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

  const addToast = useCallback((message: string, type: "success" | "error" | "info" = "info") => {
    const id = crypto.randomUUID();
    dispatch({ type: "ADD_TOAST", toast: { id, message, type } });
    setTimeout(() => dispatch({ type: "REMOVE_TOAST", id }), 3000);
  }, [dispatch]);

  const loadInitialData = useCallback(async () => {
    dispatch({ type: "SET_LOADING", loading: true });
    try {
      const [notesRes, notebooks, tags, settings] = await Promise.all([
        api.getNotes({ status: "active" }),
        api.getNotebooks(),
        api.getTags(),
        api.getSettings(),
      ]);
      dispatch({ type: "SET_NOTES", notes: notesRes.data });
      dispatch({ type: "SET_NOTEBOOKS", notebooks });
      dispatch({ type: "SET_TAGS", tags });
      dispatch({ type: "SET_SETTINGS", settings });
    } catch {
      addToast("Failed to load your data", "error");
    } finally {
      dispatch({ type: "SET_LOADING", loading: false });
      dispatch({ type: "SET_LOADED", loaded: true });
    }
  }, [dispatch, addToast]);

  const addNote = useCallback(
    async (data: { title: string; content: string; notebookId?: string; tags?: string[]; color?: string }) => {
      try {
        const note = await api.createNote(data);
        dispatch({ type: "ADD_NOTE", note });
        addToast("Note created", "success");
        return note;
      } catch {
        addToast("Failed to create note", "error");
        return undefined;
      }
    },
    [dispatch, addToast],
  );

  const updateNote = useCallback(
    async (id: string, updates: Partial<Note>) => {
      try {
        const note = await api.updateNote(id, updates);
        dispatch({ type: "UPDATE_NOTE", id, updates: note });
      } catch {
        addToast("Failed to update note", "error");
      }
    },
    [dispatch, addToast],
  );

  const deleteNote = useCallback(
    async (id: string) => {
      try {
        await api.deleteNote(id);
        dispatch({ type: "DELETE_NOTE", id });
        addToast("Note deleted", "success");
      } catch {
        addToast("Failed to delete note", "error");
      }
    },
    [dispatch, addToast],
  );

  const setNotes = useCallback((notes: Note[]) => dispatch({ type: "SET_NOTES", notes }), [dispatch]);

  const restoreNote = useCallback(
    async (id: string) => {
      try {
        const note = await api.restoreNote(id);
        dispatch({ type: "ADD_NOTE", note });
        addToast("Note restored", "success");
      } catch {
        addToast("Failed to restore note", "error");
      }
    },
    [dispatch, addToast],
  );

  const duplicateNote = useCallback(
    async (id: string) => {
      try {
        const note = await api.duplicateNote(id);
        dispatch({ type: "ADD_NOTE", note });
        addToast("Note duplicated", "success");
      } catch {
        addToast("Failed to duplicate note", "error");
      }
    },
    [dispatch, addToast],
  );

  const togglePin = useCallback(
    async (id: string) => {
      try {
        const note = await api.togglePinNote(id);
        dispatch({ type: "UPDATE_NOTE", id, updates: note });
      } catch {
        addToast("Failed to toggle pin", "error");
      }
    },
    [dispatch, addToast],
  );

  const toggleFavorite = useCallback(
    async (id: string) => {
      try {
        const note = await api.toggleFavoriteNote(id);
        dispatch({ type: "UPDATE_NOTE", id, updates: note });
      } catch {
        addToast("Failed to toggle favorite", "error");
      }
    },
    [dispatch, addToast],
  );

  const archiveNoteAction = useCallback(
    async (id: string) => {
      try {
        const note = await api.archiveNote(id);
        dispatch({ type: "UPDATE_NOTE", id, updates: note });
        addToast("Note archived", "success");
      } catch {
        addToast("Failed to archive note", "error");
      }
    },
    [dispatch, addToast],
  );

  const moveNote = useCallback(
    async (id: string, notebookId: string) => {
      try {
        const note = await api.moveNote(id, notebookId);
        dispatch({ type: "UPDATE_NOTE", id, updates: note });
        addToast("Note moved", "success");
      } catch {
        addToast("Failed to move note", "error");
      }
    },
    [dispatch, addToast],
  );

  const bulkNoteAction = useCallback(
    async (ids: string[], action: string) => {
      try {
        await api.bulkNoteAction(ids, action);
        addToast(`Notes ${action} successfully`, "success");
      } catch {
        addToast(`Failed to ${action} notes`, "error");
      }
    },
    [addToast],
  );

  const addNotebook = useCallback(
    async (data: { name: string; description?: string; icon?: string; color?: string; parentId?: string }) => {
      try {
        const notebook = await api.createNotebook(data);
        dispatch({ type: "ADD_NOTEBOOK", notebook });
        addToast("Notebook created", "success");
      } catch {
        addToast("Failed to create notebook", "error");
      }
    },
    [dispatch, addToast],
  );

  const updateNotebook = useCallback(
    async (id: string, data: Partial<Notebook>) => {
      try {
        const notebook = await api.updateNotebook(id, data);
        dispatch({ type: "UPDATE_NOTEBOOK", id, updates: notebook });
        addToast("Notebook updated", "success");
      } catch {
        addToast("Failed to update notebook", "error");
      }
    },
    [dispatch, addToast],
  );

  const deleteNotebook = useCallback(
    async (id: string) => {
      try {
        await api.deleteNotebook(id);
        dispatch({ type: "DELETE_NOTEBOOK", id });
        addToast("Notebook deleted", "success");
      } catch {
        addToast("Failed to delete notebook", "error");
      }
    },
    [dispatch, addToast],
  );

  const addTag = useCallback(
    async (data: { name: string; color?: string; parentId?: string }) => {
      try {
        const tag = await api.createTag(data);
        dispatch({ type: "ADD_TAG", tag });
        addToast("Tag created", "success");
      } catch {
        addToast("Failed to create tag", "error");
      }
    },
    [dispatch, addToast],
  );

  const updateTag = useCallback(
    async (id: string, data: Partial<Tag>) => {
      try {
        const tag = await api.updateTag(id, data);
        dispatch({ type: "UPDATE_TAG", id, updates: tag });
        addToast("Tag updated", "success");
      } catch {
        addToast("Failed to update tag", "error");
      }
    },
    [dispatch, addToast],
  );

  const deleteTag = useCallback(
    async (id: string) => {
      try {
        await api.deleteTag(id);
        dispatch({ type: "DELETE_TAG", id });
        addToast("Tag deleted", "success");
      } catch {
        addToast("Failed to delete tag", "error");
      }
    },
    [dispatch, addToast],
  );

  const setSettings = useCallback(
    async (data: Partial<AppSettings>) => {
      try {
        const settings = await api.updateSettings(data);
        dispatch({ type: "SET_SETTINGS", settings });
        addToast("Settings saved", "success");
      } catch {
        addToast("Failed to save settings", "error");
      }
    },
    [dispatch, addToast],
  );

  const search = useCallback(
    async (q: string) => {
      try {
        return await api.search(q);
      } catch {
        addToast("Search failed", "error");
        return { notes: [], notebooks: [], tags: [] };
      }
    },
    [addToast],
  );

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

  return {
    loadInitialData,
    addNote,
    updateNote,
    deleteNote,
    setNotes,
    restoreNote,
    duplicateNote,
    togglePin,
    toggleFavorite,
    archiveNote: archiveNoteAction,
    moveNote,
    bulkNoteAction,
    addNotebook,
    updateNotebook,
    deleteNotebook,
    addTag,
    updateTag,
    deleteTag,
    setSettings,
    search,
    navigate,
    openNote,
    toggleSidebar,
    toggleCommandPalette,
    addToast,
  };
}
