import type { Note, Notebook, Tag, AppSettings } from "@/types";

export class ApiError extends Error {
  status: number;
  details?: string;

  constructor(status: number, message: string, details?: string) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export type NoteVersion = {
  id: string;
  noteId: string;
  title: string;
  content: string;
  wordCount: number;
  charCount: number;
  editor: string;
  createdAt: string;
};

const BASE = "/api";

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new ApiError(res.status, err.error || "Request failed", err.details);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export function getNotes(
  params?: {
    status?: string;
    notebookId?: string;
    tagId?: string;
    favorite?: boolean;
    pinned?: boolean;
    search?: string;
    sort?: string;
    order?: string;
    page?: number;
    limit?: number;
  },
): Promise<{ data: Note[]; total: number; page: number; limit: number }> {
  const qs = new URLSearchParams();
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        qs.set(key, String(value));
      }
    }
  }
  const qstr = qs.toString();
  return request("GET", `/notes${qstr ? `?${qstr}` : ""}`);
}

export function getNote(id: string): Promise<Note> {
  return request("GET", `/notes/${id}`);
}

export function createNote(data: {
  title: string;
  content: string;
  notebookId?: string;
  tags?: string[];
  color?: string;
}): Promise<Note> {
  return request("POST", "/notes", data);
}

export function updateNote(id: string, data: Partial<Note>): Promise<Note> {
  return request("PUT", `/notes/${id}`, data);
}

export function deleteNote(id: string): Promise<void> {
  return request("DELETE", `/notes/${id}`);
}

export function restoreNote(id: string): Promise<Note> {
  return request("POST", `/notes/${id}/restore`);
}

export function duplicateNote(id: string): Promise<Note> {
  return request("POST", `/notes/${id}/duplicate`);
}

export function archiveNote(id: string): Promise<Note> {
  return request("POST", `/notes/${id}/archive`);
}

export function togglePinNote(id: string): Promise<Note> {
  return request("POST", `/notes/${id}/pin`);
}

export function toggleFavoriteNote(id: string): Promise<Note> {
  return request("POST", `/notes/${id}/favorite`);
}

export function moveNote(id: string, notebookId: string): Promise<Note> {
  return request("PUT", `/notes/${id}/move`, { notebookId });
}

export function getNoteVersions(id: string): Promise<NoteVersion[]> {
  return request("GET", `/notes/${id}/versions`);
}

export function getNoteVersion(noteId: string, versionId: string): Promise<NoteVersion> {
  return request("GET", `/notes/${noteId}/versions/${versionId}`);
}

export function restoreNoteVersion(noteId: string, versionId: string): Promise<Note> {
  return request("POST", `/notes/${noteId}/versions/${versionId}/restore`);
}

export function bulkNoteAction(ids: string[], action: string): Promise<void> {
  return request("POST", "/notes/bulk", { ids, action });
}

export function getNotebooks(): Promise<Notebook[]> {
  return request("GET", "/notebooks");
}

export function createNotebook(data: {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  parentId?: string;
}): Promise<Notebook> {
  return request("POST", "/notebooks", data);
}

export function updateNotebook(id: string, data: Partial<Notebook>): Promise<Notebook> {
  return request("PUT", `/notebooks/${id}`, data);
}

export function deleteNotebook(id: string): Promise<void> {
  return request("DELETE", `/notebooks/${id}`);
}

export function getTags(): Promise<Tag[]> {
  return request("GET", "/tags");
}

export function createTag(data: {
  name: string;
  color?: string;
  parentId?: string;
}): Promise<Tag> {
  return request("POST", "/tags", data);
}

export function updateTag(id: string, data: Partial<Tag>): Promise<Tag> {
  return request("PUT", `/tags/${id}`, data);
}

export function deleteTag(id: string): Promise<void> {
  return request("DELETE", `/tags/${id}`);
}

export function getSettings(): Promise<AppSettings> {
  return request("GET", "/settings");
}

export function updateSettings(data: Partial<AppSettings>): Promise<AppSettings> {
  return request("PUT", "/settings", data);
}

export function search(q: string): Promise<{ notes: Note[]; notebooks: Notebook[]; tags: Tag[] }> {
  return request("GET", `/search?q=${encodeURIComponent(q)}`);
}
