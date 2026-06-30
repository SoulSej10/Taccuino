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
    { title: "Welcome to Taccuino", content: "<h1>Welcome to Taccuino!</h1><p>This is your first note. Taccuino is a modern note-taking application that supports <strong>rich text</strong>, <em>markdown</em>, and much more.</p><h2>Features</h2><ul><li>Rich text editor with TipTap</li><li>Notebooks and tags for organization</li><li>Full-text search</li><li>Dark mode</li><li>Version history</li></ul>", notebookId: notebook.id, tags: [tagImportant.id, tagIdeas.id], favorite: true, pinned: true },
    { title: "Meeting Notes — Q2 Planning", content: "<h2>Q2 Planning Meeting</h2><p><strong>Date:</strong> March 15</p><h3>Agenda</h3><ul><li>Review Q1 metrics</li><li>Set Q2 OKRs</li><li>Resource allocation</li></ul><h3>Action Items</h3><ul data-type=\"taskList\"><li data-type=\"taskItem\" data-checked=\"true\">Finalize budget</li><li data-type=\"taskItem\" data-checked=\"false\">Schedule follow-up</li><li data-type=\"taskItem\" data-checked=\"false\">Update roadmap</li></ul>", notebookId: work.id, tags: [tagImportant.id, tagTodo.id] },
    { title: "Product Ideas 2025", content: "<h2>Product Ideas</h2><p>A running list of product ideas:</p><ol><li><strong>AI-powered search</strong> — Semantic search across all notes</li><li><strong>Collaborative editing</strong> — Real-time co-authoring</li><li><strong>Mobile app</strong> — Native iOS and Android clients</li><li><strong>API access</strong> — Public API for integrations</li></ol><blockquote><p>The best ideas come from scratching your own itch.</p></blockquote>", notebookId: personal.id, tags: [tagIdeas.id] },
    { title: "Shopping List", content: "<h2>Shopping List</h2><ul data-type=\"taskList\"><li data-type=\"taskItem\" data-checked=\"false\">Groceries<ul><li>Milk</li><li>Eggs</li><li>Bread</li><li>Avocados</li></ul></li><li data-type=\"taskItem\" data-checked=\"false\">Hardware store<ul><li>Light bulbs</li><li>Painter's tape</li></ul></li></ul>", notebookId: personal.id, tags: [tagTodo.id] },
    { title: "Code Snippets — TypeScript", content: "<h2>Useful TypeScript Patterns</h2><pre><code class=\"language-typescript\">// Deep Partial type\ntype DeepPartial&lt;T&gt; = {\n  [P in keyof T]?: T[P] extends object ? DeepPartial&lt;T[P]&gt; : T[P];\n};\n\n// Branded types for type safety\ntype UserId = string &amp; { readonly __brand: 'UserId' };\n\n// Discriminated unions\ntype Result&lt;T&gt; =\n  | { ok: true; value: T }\n  | { ok: false; error: Error };</code></pre>", notebookId: work.id, tags: [] },
    { title: "Travel Plans — Japan", content: "<h2>Japan Trip 2025</h2><h3>Tokyo</h3><ul><li>Shibuya crossing</li><li>Akihabara</li><li>TeamLab Borderless</li></ul><h3>Kyoto</h3><ul><li>Fushimi Inari shrine</li><li>Bamboo grove</li><li>Kinkaku-ji</li></ul><h3>Osaka</h3><ul><li>Dotonbori</li><li>Osaka Castle</li><li>Universal Studios</li></ul>", notebookId: personal.id, tags: [tagIdeas.id] },
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
