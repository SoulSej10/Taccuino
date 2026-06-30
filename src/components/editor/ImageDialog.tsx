import { useState, useEffect, useCallback } from "react";
import { type Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type ImageDialogProps = {
  editor: Editor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ImageDialog({ editor, open, onOpenChange }: ImageDialogProps) {
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");

  useEffect(() => {
    if (open) {
      setUrl("");
      setAlt("");
    }
  }, [open]);

  const handleInsert = useCallback(() => {
    if (!editor || !url.trim()) return;
    editor
      .chain()
      .focus()
      .setImage({ src: url.trim(), alt: alt.trim() || undefined })
      .run();
    onOpenChange(false);
  }, [editor, url, alt, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Insert Image</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="image-url">
              Image URL
            </label>
            <Input
              id="image-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/image.png"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="image-alt">
              Alt text
            </label>
            <Input
              id="image-alt"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="Describe the image"
            />
          </div>
          {url && (
            <div className="overflow-hidden rounded border">
              <img
                src={url}
                alt={alt || "Preview"}
                className="max-h-48 w-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleInsert} disabled={!url.trim()}>
            Insert
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
