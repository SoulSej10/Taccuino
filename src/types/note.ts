export type NoteStatus = "active" | "archived" | "trashed";

export type Note = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  notebookId: string | null;
  pinned: boolean;
  favorite: boolean;
  status: NoteStatus;
  category: string | null;
  color: string | null;
  createdAt: number;
  updatedAt: number;
  trashedAt: number | null;
  archivedAt: number | null;
  wordCount: number;
  charCount: number;
  readingTime: number;
  version: number;
};

export type NoteSummary = Pick<Note, "id" | "title" | "tags" | "pinned" | "favorite" | "status" | "notebookId" | "color" | "createdAt" | "updatedAt" | "wordCount">;
