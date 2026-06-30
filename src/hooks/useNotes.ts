import { useState, useEffect, useCallback } from "react";
import type { Note } from "@/types/note";

const STORAGE_KEY = "taccuino-notes";

function loadNotes(): Note[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Note[];
  } catch {
    return [];
  }
}

function saveNotes(notes: Note[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>(loadNotes);

  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  const addNote = useCallback((title: string, content: string, tags: string[] = []) => {
    const now = Date.now();
    const note: Note = {
      id: crypto.randomUUID(),
      title,
      content,
      tags,
      pinned: false,
      createdAt: now,
      updatedAt: now,
    };
    setNotes((prev) => [note, ...prev]);
  }, []);

  const updateNote = useCallback((id: string, updates: Partial<Omit<Note, "id" | "createdAt">>) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id
          ? { ...note, ...updates, updatedAt: Date.now() }
          : note
      )
    );
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
  }, []);

  const togglePin = useCallback((id: string) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, pinned: !note.pinned, updatedAt: Date.now() } : note
      )
    );
  }, []);

  const importNotes = useCallback((imported: Note[]) => {
    setNotes((prev) => {
      const existingIds = new Set(prev.map((n) => n.id));
      const newNotes = imported.filter((n) => !existingIds.has(n.id));
      return [...prev, ...newNotes];
    });
  }, []);

  const sortedNotes = [...notes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.updatedAt - a.updatedAt;
  });

  return { notes: sortedNotes, addNote, updateNote, deleteNote, togglePin, importNotes };
}
