import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import ImageExt from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TextAlign from "@tiptap/extension-text-align";
import CharacterCount from "@tiptap/extension-character-count";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  Code2,
  TableIcon,
  Minus,
  Image,
} from "lucide-react";

import { EditorToolbar } from "./EditorToolbar";
import { EditorInfo } from "./EditorInfo";
import { LinkDialog } from "./LinkDialog";
import { ImageDialog } from "./ImageDialog";

const lowlight = createLowlight(common);

type RichEditorProps = {
  initialContent: string;
  onUpdate: (html: string) => void;
  readOnly?: boolean;
};

type SlashItem = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: (editor: Editor) => void;
};

const slashItems: SlashItem[] = [
  {
    label: "Heading 1",
    icon: Heading1,
    action: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    label: "Heading 2",
    icon: Heading2,
    action: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    label: "Heading 3",
    icon: Heading3,
    action: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    label: "Bullet List",
    icon: List,
    action: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    label: "Ordered List",
    icon: ListOrdered,
    action: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    label: "Task List",
    icon: ListChecks,
    action: (editor) => editor.chain().focus().toggleTaskList().run(),
  },
  {
    label: "Blockquote",
    icon: Quote,
    action: (editor) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    label: "Code Block",
    icon: Code2,
    action: (editor) => editor.chain().focus().toggleCodeBlock().run(),
  },
  {
    label: "Table",
    icon: TableIcon,
    action: (editor) =>
      editor
        .chain()
        .focus()
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run(),
  },
  {
    label: "Divider",
    icon: Minus,
    action: (editor) => editor.chain().focus().setHorizontalRule().run(),
  },
  {
    label: "Image",
    icon: Image,
    action: (editor) => {
      const url = window.prompt("Enter image URL:");
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    },
  },
];

export function RichEditor({ initialContent, onUpdate, readOnly = false }: RichEditorProps) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [slashMenu, setSlashMenu] = useState<{ x: number; y: number } | null>(null);
  const slashPosRef = useRef<number | null>(null);
  const slashMenuRef = useRef<HTMLDivElement>(null);
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({ autolink: true, openOnClick: false }),
      ImageExt.configure({ inline: true }),
      Placeholder.configure({ placeholder: "Start writing..." }),
      Highlight,
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      CharacterCount,
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: initialContent,
    editable: !readOnly,
    onUpdate: ({ editor: ed }) => {
      onUpdateRef.current(ed.getHTML());
    },
  });

  useEffect(() => {
    if (editor && initialContent !== editor.getHTML()) {
      editor.commands.setContent(initialContent);
    }
  }, [editor, initialContent]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(!readOnly);
    }
  }, [editor, readOnly]);

  useEffect(() => {
    if (!editor || readOnly) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && slashMenu) {
        setSlashMenu(null);
        slashPosRef.current = null;
        return;
      }

      if (event.key === "/") {
        const { selection } = editor.state;
        const node = selection.$head.parent;
        if (node.type.name !== "paragraph") return;

        const { view } = editor;
        const coords = view.coordsAtPos(selection.from);
        slashPosRef.current = selection.from;
        setSlashMenu({ x: coords.left, y: coords.bottom + 4 });
      }
    };

    const dom = editor.view.dom;
    dom.addEventListener("keydown", handleKeyDown);

    return () => {
      dom.removeEventListener("keydown", handleKeyDown);
    };
  }, [editor, readOnly, slashMenu]);

  useEffect(() => {
    if (!slashMenu) return;

    const handleClickAway = (event: MouseEvent) => {
      if (slashMenuRef.current && !slashMenuRef.current.contains(event.target as Node)) {
        setSlashMenu(null);
        slashPosRef.current = null;
      }
    };

    document.addEventListener("mousedown", handleClickAway);
    return () => document.removeEventListener("mousedown", handleClickAway);
  }, [slashMenu]);

  const handleSlashAction = useCallback(
    (item: SlashItem) => {
      if (!editor || slashPosRef.current === null) return;

      const { from } = editor.state.selection;
      editor
        .chain()
        .focus()
        .deleteRange({ from: from - 1, to: from })
        .run();

      item.action(editor);

      setSlashMenu(null);
      slashPosRef.current = null;
    },
    [editor],
  );

  return (
    <div className="flex flex-col">
      <EditorToolbar
        editor={editor}
        onOpenLinkDialog={() => setLinkDialogOpen(true)}
        onOpenImageDialog={() => setImageDialogOpen(true)}
      />
      <div className="relative">
        <EditorContent editor={editor} />
        {slashMenu && (
          <div
            ref={slashMenuRef}
            className="fixed z-50 w-56 rounded-md border bg-popover p-1 shadow-md"
            style={{ top: slashMenu.y, left: slashMenu.x }}
          >
            {slashItems.map((item) => (
              <button
                key={item.label}
                type="button"
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                onClick={() => handleSlashAction(item)}
              >
                <item.icon className="size-4" />
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <EditorInfo editor={editor} />
      <LinkDialog
        editor={editor}
        open={linkDialogOpen}
        onOpenChange={setLinkDialogOpen}
      />
      <ImageDialog
        editor={editor}
        open={imageDialogOpen}
        onOpenChange={setImageDialogOpen}
      />
    </div>
  );
}
