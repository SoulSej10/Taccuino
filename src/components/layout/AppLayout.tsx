import { useEffect, type ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Workspace } from "@/components/layout/Workspace";
import { StatusBar } from "@/components/layout/StatusBar";
import { CommandPalette } from "@/components/search/CommandPalette";
import { useAppState, useAppActions } from "@/stores/appStore";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { cn } from "@/lib/utils";

export function AppLayout({ children }: { children?: ReactNode }) {
  const { state } = useAppState();
  const { loadInitialData, toggleCommandPalette } = useAppActions();
  const { settings } = state;

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        toggleCommandPalette();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [toggleCommandPalette]);

  if (!state.loaded) {
    return <LoadingScreen />;
  }

  return (
    <div
      className={cn(
        "flex h-screen w-screen overflow-hidden bg-background text-foreground",
        `font-${settings.fontFamily}`,
        `density-${settings.layoutDensity}`,
        settings.theme === "dark" && "dark",
        settings.theme === "amoled" && "amoled",
        `accent-${settings.accentColor}`
      )}
      style={{ fontSize: `${settings.fontSize}px` }}
    >
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {children ?? <Workspace />}
        </main>
        <StatusBar />
      </div>
      <CommandPalette />
    </div>
  );
}
