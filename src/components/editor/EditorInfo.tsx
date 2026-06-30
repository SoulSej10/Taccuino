import { type Editor } from "@tiptap/react";

export function EditorInfo({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  const charCount = editor.storage.characterCount?.characters?.() ?? 0;
  const wordCount = editor.storage.characterCount?.words?.() ?? 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="flex items-center gap-4 px-1 py-2 text-xs text-muted-foreground">
      <span>{wordCount} words</span>
      <span>{charCount} characters</span>
      <span>{readingTime} min read</span>
    </div>
  );
}
