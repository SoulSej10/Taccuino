import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Note } from "@/types/note";

type ExportImportProps = {
  notes: Note[];
  onImport: (notes: Note[]) => void;
};

export function ExportImport({ notes, onImport }: ExportImportProps) {
  const handleExport = () => {
    const blob = new Blob([JSON.stringify(notes, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `taccuino-notes-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const imported = JSON.parse(text) as Note[];
        if (!Array.isArray(imported)) throw new Error("Invalid format");
        if (window.confirm(`Import ${imported.length} note(s)? This will add them to your existing notes.`)) {
          onImport(imported);
        }
      } catch {
        alert("Invalid file format. Please select a valid Taccuino JSON export.");
      }
    };
    input.click();
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={handleExport} title="Export notes as JSON">
        <Download className="size-3.5 mr-1" />
        Export
      </Button>
      <Button variant="outline" size="sm" onClick={handleImport} title="Import notes from JSON">
        <Upload className="size-3.5 mr-1" />
        Import
      </Button>
    </div>
  );
}
