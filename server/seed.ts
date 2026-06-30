import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const userId = "default-user-id";

async function main() {
  console.log("Seeding database...");

  const existingUser = await prisma.user.findUnique({ where: { id: userId } });
  if (existingUser) {
    console.log("Database already seeded.");
    return;
  }

  await prisma.user.create({
    data: {
      id: userId,
      email: "demo@taccuino.app",
      name: "Demo User",
      profile: { create: { bio: "Taccuino user" } },
      settings: { create: {} },
    },
  });

  const notebook = await prisma.notebook.create({
    data: { name: "Getting Started", description: "Your first notebook", icon: "📓", color: "#3b82f6", userId },
  });

  const work = await prisma.notebook.create({
    data: { name: "Work", description: "Work-related notes", icon: "💼", color: "#8b5cf6", userId },
  });

  const personal = await prisma.notebook.create({
    data: { name: "Personal", icon: "🏠", color: "#10b981", userId },
  });

  const tagImportant = await prisma.tag.create({ data: { name: "important", color: "#ef4444", userId } });
  const tagIdeas = await prisma.tag.create({ data: { name: "ideas", color: "#f59e0b", userId } });
  const tagTodo = await prisma.tag.create({ data: { name: "todo", color: "#3b82f6", userId } });

  const notes = [
    { title: "Welcome to Taccuino", content: "Welcome to Taccuino!\n\nThis is your first note. Taccuino is a modern note-taking application that supports rich text, markdown, and much more.\n\nFeatures:\n- Rich text editor with TipTap\n- Notebooks and tags for organization\n- Full-text search\n- Dark mode\n- Version history", notebookId: notebook.id, tags: [tagImportant.id, tagIdeas.id], favorite: true, pinned: true },
    { title: "Meeting Notes — Q2 Planning", content: "Q2 Planning Meeting\nDate: March 15\n\nAgenda:\n- Review Q1 metrics\n- Set Q2 OKRs\n- Resource allocation\n\nAction Items:\n- Finalize budget\n- Schedule follow-up\n- Update roadmap", notebookId: work.id, tags: [tagImportant.id, tagTodo.id] },
    { title: "Product Ideas 2025", content: "Product Ideas\n\nA running list of product ideas:\n1. AI-powered search — Semantic search across all notes\n2. Collaborative editing — Real-time co-authoring\n3. Mobile app — Native iOS and Android clients\n4. API access — Public API for integrations\n\nThe best ideas come from scratching your own itch.", notebookId: personal.id, tags: [tagIdeas.id] },
    { title: "Shopping List", content: "Shopping List\n\nGroceries:\n- Milk\n- Eggs\n- Bread\n- Avocados\n\nHardware store:\n- Light bulbs\n- Painter's tape", notebookId: personal.id, tags: [tagTodo.id] },
    { title: "Code Snippets — TypeScript", content: "Useful TypeScript Patterns\n\n// Deep Partial type\ntype DeepPartial<T> = {\n  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];\n};\n\n// Branded types for type safety\ntype UserId = string & { readonly __brand: 'UserId' };\n\n// Discriminated unions\ntype Result<T> =\n  | { ok: true; value: T }\n  | { ok: false; error: Error };", notebookId: work.id, tags: [] },
    { title: "Travel Plans — Japan", content: "Japan Trip 2025\n\nTokyo:\n- Shibuya crossing\n- Akihabara\n- TeamLab Borderless\n\nKyoto:\n- Fushimi Inari shrine\n- Bamboo grove\n- Kinkaku-ji\n\nOsaka:\n- Dotonbori\n- Osaka Castle\n- Universal Studios", notebookId: personal.id, tags: [tagIdeas.id] },
  ];

  for (const note of notes) {
    const created = await prisma.note.create({
      data: {
        title: note.title,
        content: note.content,
        notebookId: note.notebookId,
        userId,
        favorite: note.favorite ?? false,
        pinned: note.pinned ?? false,
      },
    });

    if (note.tags.length > 0) {
      await Promise.all(
        note.tags.map((tagId) =>
          prisma.noteTag.create({ data: { noteId: created.id, tagId } })
        )
      );
    }
  }

  console.log(`Seeded: ${notes.length} notes, 3 notebooks, 3 tags`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
