import { type Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Highlighter,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  Code2,
  Minus,
  Link,
  Image,
  TableIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  RemoveFormatting,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type EditorToolbarProps = {
  editor: Editor | null;
  onOpenLinkDialog?: () => void;
  onOpenImageDialog?: () => void;
};

export function EditorToolbar({ editor, onOpenLinkDialog, onOpenImageDialog }: EditorToolbarProps) {
  if (!editor) return null;

  const handleLink = () => {
    if (onOpenLinkDialog) {
      onOpenLinkDialog();
    } else {
      const url = window.prompt("Enter URL:");
      if (url) {
        if (editor.getAttributes("link").href) {
          editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
        } else {
          editor.chain().focus().setLink({ href: url }).run();
        }
      }
    }
  };

  const handleImage = () => {
    if (onOpenImageDialog) {
      onOpenImageDialog();
    } else {
      const url = window.prompt("Enter image URL:");
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    }
  };

  const handleTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  return (
    <div className="sticky top-0 z-10 flex items-center gap-0.5 overflow-x-auto border-b bg-background px-2 py-1.5">
      <ToolButton
        icon={Bold}
        title="Bold"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      />
      <ToolButton
        icon={Italic}
        title="Italic"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      />
      <ToolButton
        icon={Underline}
        title="Underline"
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      />
      <ToolButton
        icon={Strikethrough}
        title="Strikethrough"
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      />
      <ToolButton
        icon={Highlighter}
        title="Highlight"
        active={editor.isActive("highlight")}
        onClick={() => editor.chain().focus().toggleHighlight().run()}
      />
      <ToolButton
        icon={Code}
        title="Inline code"
        active={editor.isActive("code")}
        onClick={() => editor.chain().focus().toggleCode().run()}
      />

      <Separator />

      <ToolButton
        icon={Heading1}
        title="Heading 1"
        active={editor.isActive("heading", { level: 1 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      />
      <ToolButton
        icon={Heading2}
        title="Heading 2"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      />
      <ToolButton
        icon={Heading3}
        title="Heading 3"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      />

      <Separator />

      <ToolButton
        icon={List}
        title="Bullet list"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      />
      <ToolButton
        icon={ListOrdered}
        title="Ordered list"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      />
      <ToolButton
        icon={ListChecks}
        title="Task list"
        active={editor.isActive("taskList")}
        onClick={() => editor.chain().focus().toggleTaskList().run()}
      />

      <Separator />

      <ToolButton
        icon={Quote}
        title="Blockquote"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      />
      <ToolButton
        icon={Code2}
        title="Code block"
        active={editor.isActive("codeBlock")}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      />
      <ToolButton
        icon={Minus}
        title="Horizontal rule"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      />

      <Separator />

      <ToolButton
        icon={Link}
        title="Link"
        active={editor.isActive("link")}
        onClick={handleLink}
      />
      <ToolButton
        icon={Image}
        title="Image"
        onClick={handleImage}
      />
      <ToolButton
        icon={TableIcon}
        title="Table"
        onClick={handleTable}
      />

      <Separator />

      <ToolButton
        icon={AlignLeft}
        title="Align left"
        active={editor.isActive({ textAlign: "left" })}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
      />
      <ToolButton
        icon={AlignCenter}
        title="Align center"
        active={editor.isActive({ textAlign: "center" })}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
      />
      <ToolButton
        icon={AlignRight}
        title="Align right"
        active={editor.isActive({ textAlign: "right" })}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
      />

      <Separator />

      <ToolButton
        icon={Undo}
        title="Undo"
        onClick={() => editor.chain().focus().undo().run()}
      />
      <ToolButton
        icon={Redo}
        title="Redo"
        onClick={() => editor.chain().focus().redo().run()}
      />

      <Separator />

      <ToolButton
        icon={RemoveFormatting}
        title="Clear formatting"
        onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
      />
    </div>
  );
}

function ToolButton({
  icon: Icon,
  title,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      title={title}
      data-active={active || undefined}
      className={active ? "bg-accent text-accent-foreground" : ""}
      onClick={onClick}
    >
      <Icon className="size-4" />
    </Button>
  );
}

function Separator() {
  return <div className="mx-0.5 h-5 w-px shrink-0 bg-border" />;
}
