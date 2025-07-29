import { useState } from "react";
import { Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import AddNoteDialog from "@/components/AddNoteDialog";
import EditNoteDialog from "@/components/EditNoteDialog";

type Note = {
  id: string;
  title: string;
  content: string;
};

const Home = () => {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      title: "Sample Note 1",
      content: "This is the content of the first sample note.",
    },
    {
      id: "2",
      title: "Sample Note 2",
      content: "Another sample note for testing layout.",
    },
  ]);

  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleAdd = (title: string, content: string) => {
    const newNote = {
      id: crypto.randomUUID(),
      title,
      content,
    };
    setNotes((prev) => [...prev, newNote]);
  };

  const handleEdit = (id: string) => {
    const noteToEdit = notes.find((n) => n.id === id);
    if (noteToEdit) {
      setEditingNote(noteToEdit);
      setIsEditOpen(true);
    }
  };

  const handleSaveEdit = (id: string, updatedTitle: string, updatedContent: string) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, title: updatedTitle, content: updatedContent } : note
      )
    );
    setIsEditOpen(false);
    setEditingNote(null);
  };

  const handleDeleteNote = (id: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this note?");
    if (!confirmDelete) return;

    setNotes((prev) => prev.filter((note) => note.id !== id));
  };

  return (
    <main className="p-4 max-w-5xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-center">📝 Notepad App</h1>

      <div className="flex justify-end">
        <AddNoteDialog onAdd={handleAdd} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {notes.map((note) => (
          <Card key={note.id} className="w-full">
            <CardContent className="p-4">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">{note.title}</h2>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(note.id)}
                  >
                    Edit
                  </Button>

                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="text-red-500 hover:text-red-600"
                    title="Delete note"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {editingNote && (
        <EditNoteDialog
          id={editingNote.id}
          initialTitle={editingNote.title}
          initialContent={editingNote.content}
          onSave={handleSaveEdit}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
        />
      )}
    </main>
  );
};

export default Home;
 