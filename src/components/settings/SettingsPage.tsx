import { useState, useRef, useCallback } from "react";
import { Moon, Sun, Monitor, Type, Download, Upload, RotateCcw, Save } from "lucide-react";
import { useAppState, useAppActions } from "@/stores/appStore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import * as api from "@/lib/api";
import type { ThemeMode, AccentColor, FontFamily, LayoutDensity, EditorWidth } from "@/types";

const ACCENT_COLORS: { name: AccentColor; color: string; ring: string }[] = [
  { name: "blue", color: "#3b82f6", ring: "ring-blue-500" },
  { name: "purple", color: "#a855f7", ring: "ring-purple-500" },
  { name: "green", color: "#22c55e", ring: "ring-green-500" },
  { name: "orange", color: "#f97316", ring: "ring-orange-500" },
  { name: "rose", color: "#e11d48", ring: "ring-rose-500" },
  { name: "teal", color: "#14b8a6", ring: "ring-teal-500" },
  { name: "indigo", color: "#6366f1", ring: "ring-indigo-500" },
  { name: "pink", color: "#ec4899", ring: "ring-pink-500" },
];

const FONT_FAMILIES: { value: FontFamily; label: string; className: string }[] = [
  { value: "system", label: "System", className: "font-sans" },
  { value: "serif", label: "Serif", className: "font-serif" },
  { value: "mono", label: "Mono", className: "font-mono" },
  { value: "inter", label: "Inter", className: "" },
  { value: "jetbrains", label: "JetBrains Mono", className: "" },
  { value: "poppins", label: "Poppins", className: "" },
];

const LAYOUT_DENSITIES: { value: LayoutDensity; label: string }[] = [
  { value: "compact", label: "Compact" },
  { value: "comfortable", label: "Comfortable" },
  { value: "spacious", label: "Spacious" },
];

const EDITOR_WIDTHS: { value: EditorWidth; label: string; className: string }[] = [
  { value: "narrow", label: "Narrow", className: "max-w-2xl" },
  { value: "medium", label: "Medium", className: "max-w-3xl" },
  { value: "wide", label: "Wide", className: "max-w-4xl" },
  { value: "full", label: "Full", className: "max-w-full" },
];

export function SettingsPage() {
  const { state } = useAppState();
  const actions = useAppActions();
  const { settings, notes } = state;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const importFileRef = useRef<HTMLInputElement>(null);
  const [, setImporting] = useState(false);

  const updateSettings = useCallback(
    (updates: Partial<typeof settings>) => {
      actions.setSettings(updates);
    },
    [actions]
  );

  const handleExportJson = useCallback(() => {
    const blob = new Blob([JSON.stringify(notes, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `taccuino-notes-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [notes]);

  const handleExportMarkdown = useCallback(() => {
    const markdown = notes
      .map((note) => {
        return `# ${note.title || "Untitled"}\n\n> Created: ${new Date(note.createdAt).toLocaleDateString()}\n> Tags: ${note.tags.join(", ") || "none"}\n\n${note.content}\n\n---\n`;
      })
      .join("\n\n");
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `taccuino-notes-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [notes]);

  const handleImportJson = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setImporting(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string);
          if (!Array.isArray(imported)) {
            actions.addToast("Invalid format: expected an array of notes", "error");
            return;
          }
          let success = 0;
          for (const note of imported) {
            try {
              await api.createNote({
                title: note.title || "Untitled",
                content: note.content || "",
                tags: note.tags || [],
                notebookId: note.notebookId || undefined,
              });
              success++;
            } catch {
              /* skip individual failures */
            }
          }
          actions.addToast(`Imported ${success} of ${imported.length} notes`, "success");
          await actions.loadInitialData();
        } catch {
          actions.addToast("Failed to parse JSON file", "error");
        } finally {
          setImporting(false);
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    },
    [actions]
  );

  const handleBackup = useCallback(async () => {
    try {
      const allNotes = await api.getNotes({ status: "active" });
      const archivedNotes = await api.getNotes({ status: "archived" });
      const trashedNotes = await api.getNotes({ status: "trashed" });
      const backup = {
        notes: [...allNotes.data, ...archivedNotes.data, ...trashedNotes.data],
        exportedAt: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `taccuino-backup-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      actions.addToast("Backup downloaded", "success");
    } catch {
      actions.addToast("Failed to create backup", "error");
    }
  }, [actions]);

  const handleRestore = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          const importedNotes = data.notes || (Array.isArray(data) ? data : []);
          if (!Array.isArray(importedNotes)) {
            actions.addToast("Invalid backup format", "error");
            return;
          }
          let success = 0;
          for (const note of importedNotes) {
            try {
              await api.createNote({
                title: note.title || "Untitled",
                content: note.content || "",
                tags: note.tags || [],
                notebookId: note.notebookId || undefined,
              });
              success++;
            } catch {
              /* skip */
            }
          }
          actions.addToast(`Restored ${success} of ${importedNotes.length} notes`, "success");
          await actions.loadInitialData();
        } catch {
          actions.addToast("Failed to restore backup", "error");
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    },
    [actions]
  );

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Customize your Taccuino experience</p>
      </div>

      <section className="space-y-6">
        <SectionTitle title="Appearance" />

        <div className="space-y-2">
          <Label>Theme</Label>
          <div className="flex gap-2">
            {([
              { value: "light", label: "Light", icon: <Sun className="size-4" /> },
              { value: "dark", label: "Dark", icon: <Moon className="size-4" /> },
              { value: "amoled", label: "AMOLED", icon: <Monitor className="size-4" /> },
            ] as { value: ThemeMode; label: string; icon: React.ReactNode }[]).map((option) => (
              <button
                key={option.value}
                onClick={() => updateSettings({ theme: option.value })}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all",
                  settings.theme === option.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground"
                )}
              >
                {option.icon}
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Accent Color</Label>
          <div className="flex gap-3 flex-wrap">
            {ACCENT_COLORS.map((accent) => (
              <button
                key={accent.name}
                onClick={() => updateSettings({ accentColor: accent.name })}
                className={cn(
                  "size-9 rounded-full transition-all",
                  settings.accentColor === accent.name
                    ? "ring-2 ring-offset-2 ring-offset-background scale-110"
                    : "hover:scale-105"
                )}
                style={{ backgroundColor: accent.color }}
                title={accent.name.charAt(0).toUpperCase() + accent.name.slice(1)}
              >
                {settings.accentColor === accent.name && (
                  <svg viewBox="0 0 24 24" className="size-4 mx-auto text-white" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Font Family</Label>
          <select
            value={settings.fontFamily}
            onChange={(e) => updateSettings({ fontFamily: e.target.value as FontFamily })}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          >
            {FONT_FAMILIES.map((font) => (
              <option key={font.value} value={font.value}>
                {font.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Font Size: {settings.fontSize}px</Label>
          </div>
          <input
            type="range"
            min={12}
            max={24}
            step={1}
            value={settings.fontSize}
            onChange={(e) => updateSettings({ fontSize: Number(e.target.value) })}
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>12px</span>
            <span>24px</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Layout Density</Label>
          <div className="flex gap-2">
            {LAYOUT_DENSITIES.map((density) => (
              <button
                key={density.value}
                onClick={() => updateSettings({ layoutDensity: density.value })}
                className={cn(
                  "flex-1 rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all",
                  settings.layoutDensity === density.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground"
                )}
              >
                {density.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <SectionTitle title="Editor" />

        <div className="space-y-2">
          <Label>Editor Width</Label>
          <select
            value={settings.editorWidth}
            onChange={(e) => updateSettings({ editorWidth: e.target.value as EditorWidth })}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          >
            {EDITOR_WIDTHS.map((width) => (
              <option key={width.value} value={width.value}>
                {width.label}
              </option>
            ))}
          </select>
        </div>

        <ToggleSetting
          label="Auto Save"
          description="Automatically save changes while editing"
          checked={settings.autoSave}
          onChange={(checked) => updateSettings({ autoSave: checked })}
        />

        {settings.autoSave && (
          <div className="space-y-2 pl-6">
            <Label>Auto Save Interval (seconds)</Label>
            <input
              type="number"
              min={1}
              max={60}
              value={Math.round(settings.autoSaveInterval / 1000)}
              onChange={(e) => updateSettings({ autoSaveInterval: Number(e.target.value) * 1000 })}
              className="flex h-9 w-24 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            />
          </div>
        )}

        <ToggleSetting
          label="Show Status Bar"
          description="Display word count and reading time at the bottom of the editor"
          checked={settings.showStatusBar}
          onChange={(checked) => updateSettings({ showStatusBar: checked })}
        />

        <ToggleSetting
          label="Spell Check"
          description="Enable spell checking in the editor"
          checked={settings.spellCheck}
          onChange={(checked) => updateSettings({ spellCheck: checked })}
        />
      </section>

      <section className="space-y-6">
        <SectionTitle title="Data" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button variant="outline" className="justify-start gap-3 h-auto py-3" onClick={handleExportJson}>
            <Download className="size-4" />
            <div className="text-left">
              <div className="text-sm font-medium">Export as JSON</div>
              <div className="text-[10px] text-muted-foreground">Download all notes as a JSON file</div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="justify-start gap-3 h-auto py-3"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="size-4" />
            <div className="text-left">
              <div className="text-sm font-medium">Import from JSON</div>
              <div className="text-[10px] text-muted-foreground">Import notes from a JSON file</div>
            </div>
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportJson}
            className="hidden"
          />

          <Button variant="outline" className="justify-start gap-3 h-auto py-3" onClick={handleExportMarkdown}>
            <Type className="size-4" />
            <div className="text-left">
              <div className="text-sm font-medium">Export as Markdown</div>
              <div className="text-[10px] text-muted-foreground">Download all notes as a markdown file</div>
            </div>
          </Button>

          <Button variant="outline" className="justify-start gap-3 h-auto py-3" onClick={handleBackup}>
            <Save className="size-4" />
            <div className="text-left">
              <div className="text-sm font-medium">Backup</div>
              <div className="text-[10px] text-muted-foreground">Download full application backup</div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="justify-start gap-3 h-auto py-3"
            onClick={() => importFileRef.current?.click()}
          >
            <RotateCcw className="size-4" />
            <div className="text-left">
              <div className="text-sm font-medium">Restore</div>
              <div className="text-[10px] text-muted-foreground">Restore from a backup file</div>
            </div>
          </Button>
          <input
            ref={importFileRef}
            type="file"
            accept=".json"
            onChange={handleRestore}
            className="hidden"
          />
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle title="About" />

        <div className="rounded-lg border border-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Taccuino</span>
            <span className="text-xs text-muted-foreground">v0.1.0</span>
          </div>
          <div className="h-px bg-border" />
          <div className="space-y-1.5 text-sm text-muted-foreground">
            <p>Built with React 19, TypeScript, and Tailwind CSS v4</p>
            <p>Powered by Tiptap editor and shadcn/ui components</p>
            <p>Icons by lucide-react</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("block text-sm font-medium text-foreground", className)}>
      {children}
    </label>
  );
}

function ToggleSetting({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div className="relative mt-0.5 shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className={cn(
          "h-5 w-9 rounded-full transition-colors",
          checked ? "bg-primary" : "bg-input"
        )}>
          <div className={cn(
            "h-4 w-4 rounded-full bg-white shadow-sm transition-transform translate-y-0.5",
            checked ? "translate-x-[18px]" : "translate-x-0.5"
          )} />
        </div>
      </div>
      <div>
        <div className="text-sm font-medium text-foreground">{label}</div>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
    </label>
  );
}
