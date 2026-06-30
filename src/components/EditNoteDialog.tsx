import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type EditNoteDialogProps = {
  id: string;
  initialTitle: string;
  initialContent: string;
  initialTags: string[];
  onSave: (id: string, title: string, content: string, tags: string[]) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditNoteDialog({
  id,
  initialTitle,
  initialContent,
  initialTags,
  onSave,
  open,
  onOpenChange,
}: EditNoteDialogProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [tagsInput, setTagsInput] = useState(initialTags.join(", "));

  useEffect(() => {
    setTitle(initialTitle);
    setContent(initialContent);
    setTagsInput(initialTags.join(", "));
  }, [initialTitle, initialContent, initialTags]);

  const tags = tagsInput
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return;
    onSave(id, title, content, tags);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Note</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <div className="space-y-2">
            <Input
              placeholder="Tags (comma-separated)"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="pt-4">
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
