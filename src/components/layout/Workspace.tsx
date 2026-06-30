import { useAppState } from "@/stores/appStore";
import { EmptyState } from "@/components/common/EmptyState";
import { NoteList } from "@/components/notes/NoteList";
import { NoteDetail } from "@/components/notes/NoteDetail";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { SettingsPage } from "@/components/settings/SettingsPage";
import { FileText, Search } from "lucide-react";

function SearchResultsView() {
  const { state } = useAppState();
  const { notes, searchQuery } = state;

  const filtered = notes.filter((n) => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase();
    return (
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="animate-fade-in p-6">
      <h1 className="text-xl font-bold mb-4">
        {searchQuery ? `Results for "${searchQuery}"` : "Search"}
      </h1>
      {filtered.length === 0 ? (
        <EmptyState icon={<Search className="size-12" />} title="No results found" description="Try a different search term" />
      ) : (
        <NoteList notes={filtered} />
      )}
    </div>
  );
}

function NotesView() {
  const { state } = useAppState();
  const { activeNoteId, activeNotebookId, activeTagId, activeView, notes } = state;

  if (activeNoteId) {
    const note = notes.find((n) => n.id === activeNoteId);
    if (note) {
      return <NoteDetail />;
    }
  }

  let filtered = notes.filter((n) => n.status === "active");

  if (activeView === "notebook-notes" && activeNotebookId) {
    filtered = filtered.filter((n) => n.notebookId === activeNotebookId);
  }
  if (activeView === "tag-notes" && activeTagId) {
    filtered = notes.filter((n) => n.tags.includes(activeTagId));
  }
  if (activeView === "favorites") {
    filtered = notes.filter((n) => n.favorite && n.status === "active");
  }
  if (activeView === "recent") {
    filtered = [...filtered].sort((a, b) => b.updatedAt - a.updatedAt);
  }
  if (activeView === "archive") {
    filtered = notes.filter((n) => n.status === "archived");
  }
  if (activeView === "trash") {
    filtered = notes.filter((n) => n.status === "trashed");
  }

  const emptyMessages: Record<string, { title: string; desc: string }> = {
    "notebook-notes": { title: "No notes in this notebook", desc: "Add a note to this notebook to get started" },
    "tag-notes": { title: "No notes with this tag", desc: "Tag a note to see it here" },
    favorites: { title: "No favorite notes", desc: "Star a note to add it to favorites" },
    recent: { title: "No recent notes", desc: "Create a note to see it here" },
    archive: { title: "No archived notes", desc: "Archived notes will appear here" },
    trash: { title: "Trash is empty", desc: "Deleted notes will appear here" },
  };
  const msg = emptyMessages[activeView] ?? { title: "No notes", desc: "Create a new note to get started" };

  return (
    <div className="animate-fade-in p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">
          {activeView === "favorites" && "Favorites"}
          {activeView === "recent" && "Recent"}
          {activeView === "archive" && "Archive"}
          {activeView === "trash" && "Trash"}
          {(!activeView || activeView === "notes" || activeView === "notebook-notes" || activeView === "tag-notes") && "Notes"}
        </h1>
        <span className="text-sm text-muted-foreground">{filtered.length} notes</span>
      </div>
      {filtered.length === 0 ? (
        <EmptyState icon={<FileText className="size-12" />} title={msg.title} description={msg.desc} />
      ) : (
        <NoteList notes={filtered} />
      )}
    </div>
  );
}

export function Workspace() {
  const { state } = useAppState();
  const { activeView } = state;

  switch (activeView) {
    case "dashboard":
      return <Dashboard />;
    case "search":
      return <SearchResultsView />;
    case "settings":
      return <SettingsPage />;
    case "notes":
    case "notebook-notes":
    case "tag-notes":
    case "favorites":
    case "recent":
    case "archive":
    case "trash":
      return <NotesView />;
    default:
      return <Dashboard />;
  }
}
