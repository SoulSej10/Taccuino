import { useState, useMemo, useCallback } from "react";
import {
  Sun,
  Moon,
  Sunrise,
  Sparkles,
  Plus,
  TrendingUp,
  BookOpen,
  Hash,
  Quote,
  Flame,
  Clock,
  Star,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppState, useAppActions } from "@/stores/appStore";
import { EmptyState } from "@/components/common/EmptyState";
import type { Note } from "@/types";

const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return { text: "Good morning", Icon: Sunrise };
  if (hour < 17) return { text: "Good afternoon", Icon: Sun };
  return { text: "Good evening", Icon: Moon };
}

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function computeStreak(notes: Note[]): number {
  const dateSet = new Set<string>();
  for (const note of notes) {
    const d = new Date(note.createdAt);
    dateSet.add(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
    );
  }

  const today = new Date();
  const todayStr = formatDate(today);

  if (!dateSet.has(todayStr)) {
    today.setDate(today.getDate() - 1);
  }

  let streak = 0;
  const cursor = new Date(today);
  while (true) {
    const dateStr = formatDate(cursor);
    if (dateSet.has(dateStr)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

function formatDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export function Dashboard() {
  const { state } = useAppState();
  const { addNote, addNotebook, addTag, navigate, openNote } = useAppActions();
  const [quickInput, setQuickInput] = useState("");

  const { notes, notebooks, tags } = state;
  const hasNotes = notes.length > 0;

  const { text: greeting, Icon: GreetingIcon } = getGreeting();

  const todayStr = useMemo(
    () =>
      new Date().toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    [],
  );

  const stats = useMemo(() => {
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const todayEnd = new Date().setHours(23, 59, 59, 999);

    return {
      notesCreatedToday: notes.filter((n) => n.createdAt >= todayStart && n.createdAt <= todayEnd).length,
      notesEditedToday: notes.filter((n) => n.updatedAt >= todayStart && n.updatedAt <= todayEnd).length,
      totalNotebooks: notebooks.length,
      totalTags: tags.length,
    };
  }, [notes, notebooks, tags]);

  const recentNotes = useMemo(
    () =>
      [...notes]
        .filter((n) => n.status === "active")
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, 8),
    [notes],
  );

  const favoriteNotes = useMemo(
    () => notes.filter((n) => n.favorite && n.status === "active"),
    [notes],
  );

  const streak = useMemo(() => computeStreak(notes), [notes]);

  const quote = useMemo(() => QUOTES[getDayOfYear() % QUOTES.length], []);

  const handleQuickCapture = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const content = quickInput.trim();
        if (!content) return;

        const firstLine = content.split("\n")[0];
        const title = firstLine.length > 60 ? firstLine.slice(0, 60) + "..." : firstLine;

        addNote({ title, content });
        setQuickInput("");
      }
    },
    [quickInput, addNote],
  );

  const handleNewNote = useCallback(() => {
    addNote({ title: "Untitled", content: "" });
  }, [addNote]);

  const handleNewNotebook = useCallback(() => {
    addNotebook({ name: "New Notebook", description: "", icon: "📓", color: "#3b82f6" });
  }, [addNotebook]);

  const handleNewTag = useCallback(() => {
    addTag({ name: "new-tag", color: "#6366f1" });
  }, [addTag]);

  if (!hasNotes) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-3">
            <GreetingIcon className="size-8 text-neutral-500 dark:text-neutral-400" />
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {greeting}, there
              </h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">{todayStr}</p>
            </div>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="size-4" />
              Quick Capture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              placeholder="Write down your thoughts..."
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              onKeyDown={handleQuickCapture}
              className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex min-h-[100px] w-full resize-none rounded-lg border bg-transparent px-4 py-3 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] md:text-sm"
              rows={3}
            />
            <p className="mt-2 text-xs text-neutral-400 dark:text-neutral-500">
              Press Enter to save &middot; Shift+Enter for new line
            </p>
          </CardContent>
        </Card>

        <EmptyState
          icon={<BookOpen className="size-8" />}
          title="Welcome to Taccuino"
          description="Your thoughts, organized. Start by creating your first note above."
          action={{ label: "Create Note", onClick: handleNewNote }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      {/* Greeting */}
      <div className="flex items-center gap-3">
        <GreetingIcon className="size-8 text-neutral-500 dark:text-neutral-400" />
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {greeting}, there
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{todayStr}</p>
        </div>
      </div>

      {/* Quick Capture */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="size-4" />
            Quick Capture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            placeholder="Write down your thoughts..."
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            onKeyDown={handleQuickCapture}
            className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex min-h-[80px] w-full resize-none rounded-lg border bg-transparent px-4 py-3 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] md:text-sm"
            rows={2}
          />
          <p className="mt-2 text-xs text-neutral-400 dark:text-neutral-500">
            Press Enter to save &middot; Shift+Enter for new line
          </p>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 px-5 py-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <TrendingUp className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {stats.notesCreatedToday}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Created today</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 px-5 py-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400">
              <Clock className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {stats.notesEditedToday}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Edited today</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 px-5 py-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
              <BookOpen className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {stats.totalNotebooks}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Notebooks</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 px-5 py-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <Hash className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {stats.totalTags}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Tags</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Notes */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            <Clock className="size-4" />
            Recent Notes
          </h2>
          <Button variant="ghost" size="sm" onClick={() => navigate("recent")}>
            View all
          </Button>
        </div>
        {recentNotes.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {recentNotes.map((note) => (
              <button
                key={note.id}
                onClick={() => openNote(note.id)}
                className="flex min-w-[220px] max-w-[260px] flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-4 text-left shadow-sm transition-all hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="line-clamp-1 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {note.title || "Untitled"}
                  </h3>
                  {note.favorite && (
                    <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-400" />
                  )}
                </div>
                <p className="line-clamp-2 text-xs text-neutral-500 dark:text-neutral-400">
                  {note.content || "No content"}
                </p>
                <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
                  {formatRelativeTime(note.updatedAt)}
                </p>
              </button>
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-neutral-400 dark:text-neutral-500">
            No recent notes yet
          </p>
        )}
      </section>

      {/* Favorite Notes */}
      {favoriteNotes.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <Star className="size-4 fill-amber-400 text-amber-400" />
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Favorites
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {favoriteNotes.map((note) => (
              <button
                key={note.id}
                onClick={() => openNote(note.id)}
                className="flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-4 text-left shadow-sm transition-all hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800"
              >
                <h3 className="line-clamp-1 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {note.title || "Untitled"}
                </h3>
                <p className="line-clamp-3 text-xs text-neutral-500 dark:text-neutral-400">
                  {note.content || "No content"}
                </p>
                <div className="mt-auto flex items-center justify-between">
                  <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
                    {formatRelativeTime(note.updatedAt)}
                  </p>
                  <Star className="size-3 fill-amber-400 text-amber-400" />
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Quick Actions */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          <Plus className="size-4" />
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button size="sm" onClick={handleNewNote}>
            <Plus className="size-4" />
            New Note
          </Button>
          <Button variant="outline" size="sm" onClick={handleNewNotebook}>
            <BookOpen className="size-4" />
            New Notebook
          </Button>
          <Button variant="outline" size="sm" onClick={handleNewTag}>
            <Hash className="size-4" />
            New Tag
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate("recent")}>
            <Clock className="size-4" />
            Open Recent
          </Button>
        </div>
      </section>

      {/* Bottom Row: Streak + Quote */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-4 px-5 py-5">
            <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-rose-500 text-white shadow-sm">
              <Flame className="size-6" />
            </div>
            <div>
              <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{streak}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Day streak</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="px-5 py-5">
            <div className="mb-2 flex items-center gap-2">
              <Quote className="size-4 text-neutral-400 dark:text-neutral-500" />
              <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500">
                Quote of the day
              </span>
            </div>
            <blockquote className="text-sm italic text-neutral-700 dark:text-neutral-300">
              &ldquo;{quote.text}&rdquo;
            </blockquote>
            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">&mdash; {quote.author}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
