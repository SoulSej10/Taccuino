import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { NoteCard } from "@/components/NoteCard";
import { AddNoteDialog } from "@/components/AddNoteDialog";
import { EditNoteDialog } from "@/components/EditNoteDialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ExportImport } from "@/components/ExportImport";
import { useNotes } from "@/hooks/useNotes";
import { useTheme } from "@/hooks/useTheme";
import type { Note } from "@/types/note";

const Home = () => {
  const { notes, addNote, updateNote, deleteNote, togglePin, importNotes } = useNotes();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const filteredNotes = notes.filter((note) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(q) ||
      note.content.toLowerCase().includes(q) ||
      note.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const handleEdit = (id: string) => {
    const note = notes.find((n) => n.id === id);
    if (note) {
      setEditingNote(note);
      setIsEditOpen(true);
    }
  };

  const handleSaveEdit = (id: string, title: string, content: string, tags: string[]) => {
    updateNote(id, { title, content, tags });
    setIsEditOpen(false);
    setEditingNote(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      deleteNote(id);
    }
  };

  return (
    <main className="p-4 max-w-5xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-center">Taccuino</h1>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
          <Input
            placeholder="Search notes..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-sm text-neutral-500">
            {filteredNotes.length} {filteredNotes.length === 1 ? "note" : "notes"}
          </span>
          <ExportImport notes={notes} onImport={importNotes} />
          <AddNoteDialog onAdd={addNote} />
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </div>

      {filteredNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg font-medium text-neutral-500">No notes yet</p>
          <p className="text-sm text-neutral-400 mt-1">
            {searchQuery.trim() ? "Try a different search term" : "Create your first note to get started"}
          </p>
          {!searchQuery.trim() && (
            <AddNoteDialog onAdd={addNote} />
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              id={note.id}
              title={note.title}
              content={note.content}
              tags={note.tags}
              pinned={note.pinned}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onTogglePin={togglePin}
            />
          ))}
        </div>
      )}

      {editingNote && (
        <EditNoteDialog
          id={editingNote.id}
          initialTitle={editingNote.title}
          initialContent={editingNote.content}
          initialTags={editingNote.tags}
          onSave={handleSaveEdit}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
        />
      )}
    </main>
  );
};

export default Home;
