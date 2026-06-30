import { useAppState } from "@/stores/appStore";

export function StatusBar() {
  const { state } = useAppState();
  const { notes, activeNoteId, settings } = state;

  const activeNote = activeNoteId ? notes.find((n) => n.id === activeNoteId) : null;

  const totalActive = notes.filter((n) => n.status === "active").length;

  if (!settings.showStatusBar) {
    return null;
  }

  return (
    <footer className="flex h-6 shrink-0 items-center justify-between border-t bg-background px-4 text-[11px] text-muted-foreground/60">
      <div className="flex items-center gap-4">
        {activeNote ? (
          <>
            <span>{activeNote.wordCount} words</span>
            <span>{activeNote.charCount} characters</span>
          </>
        ) : (
          <span>No note selected</span>
        )}
      </div>
      <div className="flex items-center gap-4">
        <span>{totalActive} notes</span>
        {settings.autoSave && (
          <span className="flex items-center gap-1">
            <span className="inline-block size-1.5 rounded-full bg-green-500" />
            Auto-save on
          </span>
        )}
      </div>
    </footer>
  );
}
