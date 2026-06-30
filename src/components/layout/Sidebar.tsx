import { useState } from "react";
import {
  LayoutDashboard,
  Clock,
  Star,
  Folder,
  Tags,
  Archive,
  Trash2,
  Settings,
  Plus,
  ChevronDown,
  ChevronRight,
  NotebookPen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppState, useAppActions } from "@/stores/appStore";
import { cn } from "@/lib/utils";
import type { Note } from "@/types";

const NAV_ITEMS = [
  { view: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
  { view: "recent" as const, label: "Recent", icon: Clock },
  { view: "favorites" as const, label: "Favorites", icon: Star },
] as const;

const MORE_ITEMS = [
  { view: "archive" as const, label: "Archive", icon: Archive },
  { view: "trash" as const, label: "Trash", icon: Trash2 },
] as const;

function NavItem({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
        active
          ? "bg-accent text-accent-foreground font-medium"
          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
      )}
    >
      <Icon className="size-4 shrink-0" />
      <span>{label}</span>
    </button>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-3 py-1.5 block">
      {label}
    </span>
  );
}

export function Sidebar() {
  const { state, dispatch } = useAppState();
  const { navigate, toggleSidebar, addNote, openNote, addNotebook, addTag } = useAppActions();
  const [notebooksExpanded, setNotebooksExpanded] = useState(true);
  const [tagsExpanded, setTagsExpanded] = useState(true);

  const { notes, notebooks, tags, activeView, activeNotebookId, activeTagId, sidebarOpen, settings } = state;

  const handleNavigate = (view: typeof activeView) => {
    navigate(view);
    if (window.innerWidth < 1024) {
      toggleSidebar();
    }
  };

  const handleNewNote = () => {
    const id = crypto.randomUUID();
    const now = Date.now();
    const note: Note = {
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
    };
    addNote(note);
    openNote(id);
    if (window.innerWidth < 1024) {
      toggleSidebar();
    }
  };

  const handleNotebookClick = (notebookId: string) => {
    dispatch({ type: "SET_ACTIVE_NOTEBOOK", id: notebookId });
    navigate("notebook-notes");
    if (window.innerWidth < 1024) {
      toggleSidebar();
    }
  };

  const handleTagClick = (tagId: string) => {
    dispatch({ type: "SET_ACTIVE_TAG", id: tagId });
    navigate("tag-notes");
    if (window.innerWidth < 1024) {
      toggleSidebar();
    }
  };

  const handleAddNotebook = () => {
    const id = crypto.randomUUID();
    addNotebook({
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
  };

  const handleAddTag = () => {
    const id = crypto.randomUUID();
    addTag({
      id,
      name: "new-tag",
      color: "#6366f1",
      parentId: null,
      noteCount: 0,
    });
  };

  const getNoteCount = (notebookId: string) => {
    return notes.filter((n) => n.notebookId === notebookId && n.status === "active").length;
  };

  const getTagNoteCount = (tagId: string) => {
    return notes.filter((n) => n.tags.includes(tagId) && n.status === "active").length;
  };

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r bg-sidebar text-sidebar-foreground transition-transform duration-300 ease-in-out lg:static lg:z-auto lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ width: settings.sidebarWidth }}
      >
        <div className="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-4 shrink-0">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <NotebookPen className="size-4" />
          </div>
          <span className="text-base font-semibold tracking-tight">Taccuino</span>
        </div>

        <div className="px-3 pt-3 pb-2 shrink-0">
          <Button className="w-full gap-2" size="sm" onClick={handleNewNote}>
            <Plus className="size-4" />
            New Note
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
          <SectionHeader label="Workspace" />

          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.view}
              icon={item.icon}
              label={item.label}
              active={activeView === item.view}
              onClick={() => handleNavigate(item.view)}
            />
          ))}

          <div className="my-2 border-t border-sidebar-border" />

          <div className="flex items-center justify-between pr-1">
            <SectionHeader label="Notebooks" />
            <button
              onClick={() => setNotebooksExpanded(!notebooksExpanded)}
              className="rounded p-0.5 text-muted-foreground/60 hover:text-foreground"
            >
              {notebooksExpanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
            </button>
          </div>

          {notebooksExpanded && (
            <div className="space-y-0.5">
              {notebooks.map((nb) => (
                <button
                  key={nb.id}
                  onClick={() => handleNotebookClick(nb.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    activeView === "notebook-notes" && activeNotebookId === nb.id
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  <Folder className="size-4 shrink-0" />
                  <span className="flex-1 truncate text-left">{nb.name}</span>
                  <span className="text-[11px] tabular-nums text-muted-foreground/60">
                    {getNoteCount(nb.id)}
                  </span>
                </button>
              ))}
              <button
                onClick={handleAddNotebook}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground/60 transition-colors hover:text-foreground"
              >
                <Plus className="size-3.5 shrink-0" />
                <span>Add Notebook</span>
              </button>
            </div>
          )}

          <div className="my-2 border-t border-sidebar-border" />

          <div className="flex items-center justify-between pr-1">
            <SectionHeader label="Tags" />
            <button
              onClick={() => setTagsExpanded(!tagsExpanded)}
              className="rounded p-0.5 text-muted-foreground/60 hover:text-foreground"
            >
              {tagsExpanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
            </button>
          </div>

          {tagsExpanded && (
            <div className="space-y-0.5">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => handleTagClick(tag.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    activeView === "tag-notes" && activeTagId === tag.id
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  <Tags className="size-4 shrink-0" />
                  <span className="flex-1 truncate text-left">{tag.name}</span>
                  <span className="text-[11px] tabular-nums text-muted-foreground/60">
                    {getTagNoteCount(tag.id)}
                  </span>
                </button>
              ))}
              <button
                onClick={handleAddTag}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground/60 transition-colors hover:text-foreground"
              >
                <Plus className="size-3.5 shrink-0" />
                <span>Add Tag</span>
              </button>
            </div>
          )}

          <div className="my-2 border-t border-sidebar-border" />

          <SectionHeader label="More" />

          {MORE_ITEMS.map((item) => (
            <NavItem
              key={item.view}
              icon={item.icon}
              label={item.label}
              active={activeView === item.view}
              onClick={() => handleNavigate(item.view)}
            />
          ))}
        </nav>

        <div className="border-t border-sidebar-border px-3 py-3 shrink-0">
          <button
            onClick={() => handleNavigate("settings")}
            className={cn(
              "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              activeView === "settings"
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            )}
          >
            <Settings className="size-4 shrink-0" />
            <span>Settings</span>
          </button>
        </div>
      </aside>
    </>
  );
}
