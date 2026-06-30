import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Workspace } from "@/components/layout/Workspace";
import { StatusBar } from "@/components/layout/StatusBar";
import { useAppState } from "@/stores/appStore";
import { cn } from "@/lib/utils";

export function AppLayout({ children }: { children?: ReactNode }) {
  const { state } = useAppState();
  const { settings } = state;

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
    >
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {children ?? <Workspace />}
        </main>
        <StatusBar />
      </div>
    </div>
  );
}
