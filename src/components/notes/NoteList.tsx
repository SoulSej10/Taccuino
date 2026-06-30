import { useState, useEffect, useCallback } from "react";
import { File, Pin, PinOff, Star, Notebook, Clock, MoreHorizontal, Trash2, Copy, Archive, StarOff, Pencil } from "lucide-react";
import { useAppState, useAppActions } from "@/stores/appStore";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/common/EmptyState";
import type { Note } from "@/types";

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

function relativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return "just now";
  if (minutes === 1) return "1 minute ago";
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours === 1) return "1 hour ago";
  if (hours < 24) return `${hours} hours ago`;
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (weeks === 1) return "1 week ago";
  if (weeks < 5) return `${weeks} weeks ago`;
  if (months === 1) return "1 month ago";
  if (months < 12) return `${months} months ago`;
  if (years === 1) return "1 year ago";
  return `${years} years ago`;
}

function truncateText(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "...";
}

export function NoteList(props: {
  notes: Note[];
  emptyMessage?: string;
  emptyAction?: { label: string; onClick: () => void };
}) {
  const { notes, emptyMessage, emptyAction } = props;
  const { state } = useAppState();
  const actions = useAppActions();
  const { notebooks } = state;

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    note: Note;
  } | null>(null);

  useEffect(() => {
    if (!contextMenu) return;
    const handler = () => setContextMenu(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [contextMenu]);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, note: Note) => {
      e.preventDefault();
      e.stopPropagation();
      setContextMenu({ x: e.clientX, y: e.clientY, note });
    },
    []
  );

  const handleAction = useCallback(
    (action: string, note: Note) => {
      setContextMenu(null);
      switch (action) {
        case "open":
          actions.openNote(note.id);
          break;
        case "delete":
          actions.updateNote(note.id, { status: "trashed", trashedAt: Date.now() });
          break;
        case "archive":
          actions.updateNote(note.id, { status: "archived", archivedAt: Date.now() });
          break;
        case "pin":
          actions.togglePin(note.id);
          break;
        case "favorite":
          actions.toggleFavorite(note.id);
          break;
        case "duplicate":
          actions.duplicateNote(note.id);
          break;
      }
    },
    [actions]
  );

  if (notes.length === 0) {
    return (
      <EmptyState
        icon={<File className="size-12" />}
        title="No notes yet"
        description={emptyMessage ?? "Create your first note to get started."}
        action={emptyAction}
      />
    );
  }

  const density = state.settings.layoutDensity;
  const compact = density === "compact";

  return (
    <div className="relative">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map((note) => {
          const notebook = notebooks.find((nb) => nb.id === note.notebookId);
          const preview = truncateText(stripHtml(note.content), 100);
          const time = relativeTime(note.updatedAt);

          return (
            <Card
              key={note.id}
              className={cn(
                "group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 border-border/50 hover:border-border",
                compact && "gap-3 py-3"
              )}
              onClick={() => handleAction("open", note)}
              onContextMenu={(e) => handleContextMenu(e, note)}
            >
              <CardContent className={cn("p-4", compact && "p-3")}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {note.pinned && <Pin className="size-3.5 shrink-0 fill-amber-500 text-amber-500" />}
                      {note.favorite && <Star className="size-3.5 shrink-0 fill-yellow-500 text-yellow-500" />}
                      <h3 className={cn("font-semibold truncate text-foreground", compact ? "text-sm" : "text-base")}>
                        {note.title || "Untitled"}
                      </h3>
                    </div>
                    {preview && (
                      <p className={cn("mt-1 text-muted-foreground line-clamp-2", compact ? "text-xs" : "text-sm")}>
                        {preview}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContextMenu(e, note);
                    }}
                    className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-md p-1 hover:bg-accent"
                  >
                    <MoreHorizontal className="size-4 text-muted-foreground" />
                  </button>
                </div>

                <div className={cn("flex flex-wrap items-center gap-2", compact ? "mt-2" : "mt-3")}>
                  {note.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                  {note.tags.length > 3 && (
                    <span className="text-[10px] text-muted-foreground">+{note.tags.length - 3}</span>
                  )}
                </div>

                <div className={cn("flex items-center gap-3 text-[11px] text-muted-foreground", compact ? "mt-2" : "mt-3")}>
                  {notebook && (
                    <span className="flex items-center gap-1 truncate">
                      <Notebook className="size-3 shrink-0" />
                      <span className="truncate">{notebook.name}</span>
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="size-3 shrink-0" />
                    <span>{time}</span>
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {contextMenu && (
        <div
          className="fixed z-50 w-48 rounded-lg border border-border bg-popover p-1 shadow-xl"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <ContextMenuItem icon={<Pencil className="size-3.5" />} label="Edit" onClick={() => handleAction("open", contextMenu.note)} />
          <ContextMenuItem icon={<Copy className="size-3.5" />} label="Duplicate" onClick={() => handleAction("duplicate", contextMenu.note)} />
          <div className="my-1 border-t border-border" />
          {contextMenu.note.pinned ? (
            <ContextMenuItem icon={<PinOff className="size-3.5" />} label="PinOff" onClick={() => handleAction("pin", contextMenu.note)} />
          ) : (
            <ContextMenuItem icon={<Pin className="size-3.5" />} label="Pin" onClick={() => handleAction("pin", contextMenu.note)} />
          )}
          {contextMenu.note.favorite ? (
            <ContextMenuItem icon={<StarOff className="size-3.5" />} label="Unfavorite" onClick={() => handleAction("favorite", contextMenu.note)} />
          ) : (
            <ContextMenuItem icon={<Star className="size-3.5" />} label="Favorite" onClick={() => handleAction("favorite", contextMenu.note)} />
          )}
          <ContextMenuItem icon={<Archive className="size-3.5" />} label="Archive" onClick={() => handleAction("archive", contextMenu.note)} />
          <div className="my-1 border-t border-border" />
          <ContextMenuItem icon={<Trash2 className="size-3.5" />} label="Move to Trash" onClick={() => handleAction("delete", contextMenu.note)} className="text-destructive" />
        </div>
      )}
    </div>
  );
}

function ContextMenuItem({
  icon,
  label,
  onClick,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
        className
      )}
    >
      {icon}
      {label}
    </button>
  );
}
