import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { ArrowLeft, Pin, Star, Trash2, MoreHorizontal, Copy, Archive, Timer, Type, Hash } from "lucide-react";
import { useAppState, useAppActions } from "@/stores/appStore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";


function wordCount(text: string): number {
  const clean = text.replace(/<[^>]*>/g, " ");
  return clean.split(/\s+/).filter(Boolean).length;
}

function readingTime(text: string): number {
  const wc = wordCount(text);
  return Math.max(1, Math.ceil(wc / 200));
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function NoteDetail() {
  const { state } = useAppState();
  const actions = useAppActions();
  const { activeNoteId, notes, notebooks } = state;

  const note = useMemo(() => notes.find((n) => n.id === activeNoteId), [notes, activeNoteId]);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving">("saved");
  const [menuOpen, setMenuOpen] = useState(false);
  const [useRichEditor, setUseRichEditor] = useState(false);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const notebook = note ? notebooks.find((nb) => nb.id === note.notebookId) : null;

  useEffect(() => {
    import("@/components/editor/RichEditor").then(() => setUseRichEditor(true)).catch(() => {});
  }, []);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setSaveStatus("saved");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note?.id]);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const markSaved = useCallback(() => {
    clearTimeout(saveTimeoutRef.current ?? undefined);
    saveTimeoutRef.current = setTimeout(() => setSaveStatus("saved"), 400);
  }, []);

  const handleTitleChange = useCallback(
    (value: string) => {
      setTitle(value);
      if (!note) return;
      setSaveStatus("saving");
      clearTimeout(contentTimeoutRef.current ?? undefined);
      contentTimeoutRef.current = setTimeout(() => {
        actions.updateNote(note.id, { title: value, updatedAt: Date.now() });
        markSaved();
      }, 300);
    },
    [note, actions, markSaved]
  );

  const handleTitleBlur = useCallback(() => {
    if (!note || title === note.title) return;
    actions.updateNote(note.id, { title, updatedAt: Date.now() });
    markSaved();
  }, [note, title, actions, markSaved]);

  const handleContentChange = useCallback(
    (value: string) => {
      setContent(value);
      if (!note) return;
      setSaveStatus("saving");
      clearTimeout(contentTimeoutRef.current ?? undefined);
      contentTimeoutRef.current = setTimeout(() => {
        actions.updateNote(note.id, {
          content: value,
          wordCount: wordCount(value),
          charCount: value.length,
          readingTime: readingTime(value),
          updatedAt: Date.now(),
        });
        markSaved();
      }, 500);
    },
    [note, actions, markSaved]
  );

  const addTag = useCallback(
    (tag: string) => {
      if (!note || !tag.trim()) return;
      const trimmed = tag.trim().toLowerCase();
      if (note.tags.includes(trimmed)) return;
      const updatedTags = [...note.tags, trimmed];
      actions.updateNote(note.id, { tags: updatedTags, updatedAt: Date.now() });
      setTagInput("");
    },
    [note, actions]
  );

  const removeTag = useCallback(
    (tag: string) => {
      if (!note) return;
      const updatedTags = note.tags.filter((t) => t !== tag);
      actions.updateNote(note.id, { tags: updatedTags, updatedAt: Date.now() });
    },
    [note, actions]
  );

  const handleTagKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        addTag(tagInput);
      } else if (e.key === "Backspace" && !tagInput && note && note.tags.length > 0) {
        removeTag(note.tags[note.tags.length - 1]);
      }
    },
    [tagInput, addTag, note, removeTag]
  );

  const handleTogglePin = useCallback(() => {
    if (!note) return;
    actions.updateNote(note.id, { pinned: !note.pinned, updatedAt: Date.now() });
  }, [note, actions]);

  const handleToggleFavorite = useCallback(() => {
    if (!note) return;
    actions.updateNote(note.id, { favorite: !note.favorite, updatedAt: Date.now() });
  }, [note, actions]);

  const handleDelete = useCallback(() => {
    if (!note) return;
    actions.updateNote(note.id, { status: "trashed", trashedAt: Date.now() });
    actions.navigate("notes");
  }, [note, actions]);

  const handleDuplicate = useCallback(() => {
    if (!note) return;
    const now = Date.now();
    actions.addNote({
      ...note,
      id: crypto.randomUUID(),
      title: `${note.title} (Copy)`,
      createdAt: now,
      updatedAt: now,
      pinned: false,
      favorite: false,
    });
    setMenuOpen(false);
  }, [note, actions]);

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Type className="size-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">Select a note</h3>
          <p className="mt-1 text-sm text-muted-foreground">Choose a note from the list to view or edit it.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <header className="flex items-center gap-2 px-4 py-2 border-b border-border shrink-0">
        <Button variant="ghost" size="icon" onClick={() => actions.navigate("notes")} title="Back to notes">
          <ArrowLeft className="size-4" />
        </Button>

        <div className="flex-1" />

        <div className="flex items-center gap-1">
          <button
            onClick={handleTogglePin}
            className={cn(
              "rounded-md p-2 transition-colors hover:bg-accent",
              note.pinned && "text-amber-500"
            )}
            title={note.pinned ? "Unpin" : "Pin"}
          >
            <Pin className={cn("size-4", note.pinned && "fill-amber-500")} />
          </button>

          <button
            onClick={handleToggleFavorite}
            className={cn(
              "rounded-md p-2 transition-colors hover:bg-accent",
              note.favorite && "text-yellow-500"
            )}
            title={note.favorite ? "Unfavorite" : "Favorite"}
          >
            <Star className={cn("size-4", note.favorite && "fill-yellow-500")} />
          </button>

          <Button variant="ghost" size="icon" onClick={handleDelete} title="Move to trash">
            <Trash2 className="size-4" />
          </Button>

          <div className="relative">
            <Button variant="ghost" size="icon" onClick={() => setMenuOpen(!menuOpen)} title="More options">
              <MoreHorizontal className="size-4" />
            </Button>
            {menuOpen && (
              <div
                ref={menuRef}
                className="absolute right-0 top-full mt-1 z-50 w-48 rounded-lg border border-border bg-popover p-1 shadow-xl"
                onClick={() => setMenuOpen(false)}
              >
                <MenuButton icon={<Copy className="size-3.5" />} label="Duplicate" onClick={handleDuplicate} />
                <MenuButton
                  icon={<Archive className="size-3.5" />}
                  label="Archive"
                  onClick={() => {
                    actions.updateNote(note.id, { status: "archived", archivedAt: Date.now() });
                    actions.navigate("notes");
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div className="flex items-center gap-3">
            <Input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              onBlur={handleTitleBlur}
              placeholder="Untitled"
              className="text-2xl font-bold border-0 px-0 shadow-none focus-visible:ring-0 h-auto py-0"
            />
            <span
              className={cn(
                "shrink-0 text-[10px] font-medium flex items-center gap-1",
                saveStatus === "saving" ? "text-muted-foreground" : "text-green-500"
              )}
            >
              <span className={cn("size-1.5 rounded-full", saveStatus === "saving" ? "bg-muted-foreground" : "bg-green-500")} />
              {saveStatus === "saving" ? "Saving..." : "Saved"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground"
              >
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="hover:text-destructive transition-colors"
                  title="Remove tag"
                >
                  ×
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onBlur={() => {
                if (tagInput.trim()) addTag(tagInput);
              }}
              placeholder="Add tag..."
              className="inline-flex h-6 min-w-[80px] bg-transparent text-xs outline-none placeholder:text-muted-foreground border-0 p-0"
            />
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="font-medium">Created:</span> {formatDate(note.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <span className="font-medium">Updated:</span> {formatDate(note.updatedAt)}
            </span>
            <span className="flex items-center gap-1">
              <Hash className="size-3" />
              {note.wordCount} words
            </span>
            <span className="flex items-center gap-1">
              <Timer className="size-3" />
              {note.readingTime} min read
            </span>
            {notebook && (
              <span className="flex items-center gap-1">
                <span className="font-medium">Notebook:</span> {notebook.name}
              </span>
            )}
          </div>

          <div className="border-t border-border pt-4">
            {useRichEditor ? (
              <RichEditorContent content={content} onChange={handleContentChange} />
            ) : (
              <Textarea
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Start writing..."
                className="min-h-[400px] resize-none border-0 p-0 shadow-none text-base leading-relaxed focus-visible:ring-0"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MenuButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      {icon}
      {label}
    </button>
  );
}

function RichEditorContent({
  content,
  onChange,
}: {
  content: string;
  onChange: (value: string) => void;
}) {
  return (
    <Textarea
      value={content}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Start writing..."
      className="min-h-[400px] resize-none border-0 p-0 shadow-none text-base leading-relaxed focus-visible:ring-0"
    />
  );
}
