import { Pin, PinOff, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { renderMarkdown } from "@/lib/markdown";

type NoteCardProps = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  pinned: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
};

export function NoteCard({ id, title, content, tags, pinned, onEdit, onDelete, onTogglePin }: NoteCardProps) {
  return (
    <Card className="w-full shadow-md">
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div className="space-y-1">
          <CardTitle className="text-lg">{title}</CardTitle>
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
        <Button
          variant="ghost"
          size="icon"
          className="size-6 shrink-0"
          onClick={() => onTogglePin(id)}
          title={pinned ? "Unpin" : "Pin"}
        >
          {pinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="markdown text-sm text-neutral-600" dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(id)}>
            <Pencil className="size-3.5 mr-1" />
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(id)}>
            <Trash2 className="size-3.5 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
