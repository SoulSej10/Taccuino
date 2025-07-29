import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type NoteCardProps = {
  id: string;
  title: string;
  content: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

const NoteCard = ({ id, title, content, onEdit, onDelete }: NoteCardProps) => {
  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-gray-600 whitespace-pre-wrap">{content}</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(id)}>
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(id)}>
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NoteCard;
