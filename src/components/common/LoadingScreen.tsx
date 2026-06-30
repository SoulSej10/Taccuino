export function LoadingScreen() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-4xl font-bold tracking-tight animate-pulse">Taccuino</h1>
        <p className="text-muted-foreground text-sm">Loading your workspace...</p>
      </div>
    </div>
  );
}
