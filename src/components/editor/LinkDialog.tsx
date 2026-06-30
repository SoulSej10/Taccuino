import { useState, useEffect } from "react";
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

type LinkDialogProps = {
  editor: Editor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function LinkDialog({ editor, open, onOpenChange }: LinkDialogProps) {
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");

  useEffect(() => {
    if (open && editor) {
      const attrs = editor.getAttributes("link");
      setUrl(attrs.href || "");
      const { from, to } = editor.state.selection;
      const selectedText = from !== to ? editor.state.doc.textBetween(from, to) : "";
      setText(selectedText);
    }
  }, [open, editor]);

  const handleSave = () => {
    if (!editor) return;
    const trimmed = url.trim();
    if (trimmed) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .insertContent(text || trimmed)
        .setLink({ href: trimmed })
        .run();
    } else {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    }
    onOpenChange(false);
  };

  const handleRemove = () => {
    if (!editor) return;
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Link</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="link-url">
              URL
            </label>
            <Input
              id="link-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="link-text">
              Text
            </label>
            <Input
              id="link-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Link text"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleRemove}>
            Remove
          </Button>
          <Button onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
