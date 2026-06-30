import { Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppState, useAppActions } from "@/stores/appStore";

const VIEW_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  notes: "Notes",
  "notebook-notes": "Notes",
  "tag-notes": "Notes",
  favorites: "Favorites",
  recent: "Recent",
  archive: "Archive",
  trash: "Trash",
  settings: "Settings",
  search: "Search",
};

export function Header() {
  const { state } = useAppState();
  const { toggleSidebar, toggleCommandPalette } = useAppActions();
  const { activeView, notebooks, tags, activeNotebookId, activeTagId } = state;

  const getBreadcrumb = () => {
    const base = VIEW_LABELS[activeView] ?? "Dashboard";
    if (activeView === "notebook-notes" && activeNotebookId) {
      const nb = notebooks.find((n) => n.id === activeNotebookId);
      return `Notes > ${nb?.name ?? "Unknown"}`;
    }
    if (activeView === "tag-notes" && activeTagId) {
      const tag = tags.find((t) => t.id === activeTagId);
      return `Notes > ${tag?.name ?? "Unknown"}`;
    }
    return base;
  };

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-background px-4">
      <Button variant="ghost" size="icon" onClick={toggleSidebar} className="shrink-0">
        <Menu className="size-5" />
      </Button>

      <div className="flex-1">
        <span className="text-sm font-medium text-foreground">{getBreadcrumb()}</span>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={toggleCommandPalette}>
          <Search className="size-4" />
        </Button>
        <div className="flex items-center justify-center size-9 rounded-md text-muted-foreground/40">
          <span className="sr-only">Notifications</span>
        </div>
      </div>
    </header>
  );
}
