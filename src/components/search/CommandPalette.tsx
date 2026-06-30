import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Search, File, Plus, LayoutDashboard, Settings, Moon, Sun, Notebook, Command, ArrowRight } from "lucide-react";
import { useAppState, useAppActions } from "@/stores/appStore";
import { cn } from "@/lib/utils";
import type { Note } from "@/types";

type CommandItem = {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
};

type ResultGroup = {
  label: string;
  items: (Note | CommandItem)[];
  type: "note" | "command";
};

function generateId(): string {
  return crypto.randomUUID();
}

export function CommandPalette() {
  const { state } = useAppState();
  const actions = useAppActions();
  const { commandPaletteOpen, notes, settings } = state;

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const isCommandMode = query.startsWith("/");

  const close = useCallback(() => {
    actions.toggleCommandPalette();
    setQuery("");
    setSelectedIndex(0);
  }, [actions]);

  useEffect(() => {
    if (!commandPaletteOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [commandPaletteOpen, close]);

  useEffect(() => {
    if (commandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  const filteredNotes = useMemo(() => {
    if (isCommandMode || !query.trim()) return [];
    const q = query.toLowerCase();
    return notes.filter((note) => {
      const titleMatch = note.title.toLowerCase().includes(q);
      const contentMatch = note.content.toLowerCase().includes(q);
      const tagMatch = note.tags.some((t) => t.toLowerCase().includes(q));
      return titleMatch || contentMatch || tagMatch;
    });
  }, [notes, query, isCommandMode]);

  const commands = useMemo((): CommandItem[] => {
    const showCommands = isCommandMode || ["new", "go ", "toggle", "export"].some((k) => query.toLowerCase().startsWith(k));

    if (!showCommands && !query.trim()) return [];

    return [
      {
        id: "new-note",
        label: "New Note",
        description: "Create a blank note",
        icon: <Plus className="size-4" />,
        shortcut: "N",
        action: () => {
          const id = generateId();
          const now = Date.now();
          actions.addNote({
            id,
            title: "Untitled",
            content: "",
            tags: [],
            notebookId: null,
            pinned: false,
            favorite: false,
            status: "active",
            category: null,
            color: null,
            createdAt: now,
            updatedAt: now,
            trashedAt: null,
            archivedAt: null,
            wordCount: 0,
            charCount: 0,
            readingTime: 0,
            version: 1,
          });
          actions.openNote(id);
          close();
        },
      },
      {
        id: "new-notebook",
        label: "New Notebook",
        description: "Create a new notebook",
        icon: <Notebook className="size-4" />,
        shortcut: "B",
        action: () => {
          const id = generateId();
          actions.addNotebook({
            id,
            name: "New Notebook",
            description: "",
            parentId: null,
            icon: "📓",
            color: "#3b82f6",
            createdAt: Date.now(),
            updatedAt: Date.now(),
            noteCount: 0,
          });
          close();
        },
      },
      {
        id: "go-dashboard",
        label: "Go to Dashboard",
        description: "Navigate to the dashboard view",
        icon: <LayoutDashboard className="size-4" />,
        shortcut: "G D",
        action: () => {
          actions.navigate("dashboard");
          close();
        },
      },
      {
        id: "go-settings",
        label: "Go to Settings",
        description: "Open settings page",
        icon: <Settings className="size-4" />,
        shortcut: "G S",
        action: () => {
          actions.navigate("settings");
          close();
        },
      },
      {
        id: "toggle-dark-mode",
        label: settings.theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode",
        description: "Toggle between light and dark theme",
        icon: settings.theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />,
        shortcut: "T",
        action: () => {
          actions.setSettings({ theme: settings.theme === "dark" ? "light" : "dark" });
          close();
        },
      },
      {
        id: "export-all",
        label: "Export All Notes",
        description: "Download all notes as JSON",
        icon: <ArrowRight className="size-4" />,
        shortcut: "",
        action: () => {
          const blob = new Blob([JSON.stringify(notes, null, 2)], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "taccuino-notes.json";
          a.click();
          URL.revokeObjectURL(url);
          close();
        },
      },
      {
        id: "toggle-sidebar",
        label: "Toggle Sidebar",
        description: "Show or hide the sidebar",
        icon: <Command className="size-4" />,
        shortcut: "Ctrl+B",
        action: () => {
          actions.toggleSidebar();
          close();
        },
      },
    ];
  }, [query, isCommandMode, actions, close, settings.theme, notes]);

  const groups = useMemo((): ResultGroup[] => {
    const result: ResultGroup[] = [];
    if (filteredNotes.length > 0) {
      result.push({ label: "Notes", items: filteredNotes, type: "note" });
    }
    if (commands.length > 0) {
      result.push({ label: "Commands", items: commands, type: "command" });
    }
    return result;
  }, [filteredNotes, commands]);

  const flatItems = useMemo(() => {
    return groups.flatMap((g) => g.items);
  }, [groups]);

  const totalItems = flatItems.length;

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, totalItems);
  }, [totalItems]);

  useEffect(() => {
    if (itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % totalItems);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + totalItems) % totalItems);
    } else if (e.key === "Enter" && totalItems > 0) {
      e.preventDefault();
      const item = flatItems[selectedIndex];
      if ("action" in item) {
        (item as CommandItem).action();
      } else {
        actions.openNote((item as Note).id);
        close();
      }
    }
  };

  if (!commandPaletteOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

      <div
        className="relative z-10 w-full max-w-xl mx-4 bg-background border border-border rounded-xl shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="size-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search notes... (type / for commands)"
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-sm"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            <Command className="size-3" />
            K
          </kbd>
        </div>

        <div ref={listRef} className="max-h-80 overflow-y-auto p-2" role="listbox">
          {groups.length === 0 && query.trim() && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No results found for "<span className="font-medium">{query}</span>"
            </div>
          )}

          {groups.length === 0 && !query.trim() && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Start typing to search notes or use "/" for commands
            </div>
          )}

          {groups.map((group) => (
            <div key={group.label}>
              <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group.label}
              </div>
              {group.items.map((item) => {
                const globalIdx = flatItems.indexOf(item);
                const isSelected = globalIdx === selectedIndex;

                if (group.type === "command") {
                  const cmd = item as CommandItem;
                  return (
                    <button
                      key={cmd.id}
                      ref={(el) => { itemRefs.current[globalIdx] = el; }}
                      role="option"
                      aria-selected={isSelected}
                      onClick={cmd.action}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                        isSelected ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-accent/50"
                      )}
                    >
                      <span className="flex size-7 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground">
                        {cmd.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{cmd.label}</div>
                        {cmd.description && (
                          <div className="text-xs text-muted-foreground truncate">{cmd.description}</div>
                        )}
                      </div>
                      {cmd.shortcut && (
                        <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground shrink-0">
                          {cmd.shortcut.split(" ").map((part, i) => (
                            <span key={i}>
                              {i > 0 && <span className="mx-0.5">+</span>}
                              {part}
                            </span>
                          ))}
                        </kbd>
                      )}
                    </button>
                  );
                }

                const note = item as Note;
                return (
                  <button
                    key={note.id}
                    ref={(el) => { itemRefs.current[globalIdx] = el; }}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      actions.openNote(note.id);
                      close();
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                      isSelected ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-accent/50"
                    )}
                  >
                    <span className="flex size-7 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground">
                      <File className="size-4" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{note.title || "Untitled"}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {note.tags.length > 0 && (
                          <span className="truncate">{note.tags.slice(0, 2).join(", ")}</span>
                        )}
                        {note.tags.length > 2 && <span>+{note.tags.length - 2}</span>}
                      </div>
                    </div>
                    <span className="shrink-0 text-[10px] text-muted-foreground">
                      {note.notebookId && <Notebook className="size-3 inline mr-1" />}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 px-4 py-2 border-t border-border bg-muted/50">
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <span className="rounded border border-border bg-background px-1 py-0.5 text-[9px] font-medium">↑↓</span>
            Navigate
          </span>
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <span className="rounded border border-border bg-background px-1 py-0.5 text-[9px] font-medium">↵</span>
            Select
          </span>
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <span className="rounded border border-border bg-background px-1 py-0.5 text-[9px] font-medium">Esc</span>
            Close
          </span>
        </div>
      </div>
    </div>
  );
}
