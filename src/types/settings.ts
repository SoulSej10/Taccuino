export type ThemeMode = "light" | "dark" | "amoled";
export type AccentColor = "blue" | "purple" | "green" | "orange" | "rose" | "teal" | "indigo" | "pink";
export type FontFamily = "system" | "serif" | "mono" | "inter" | "jetbrains" | "poppins";
export type LayoutDensity = "compact" | "comfortable" | "spacious";
export type EditorWidth = "narrow" | "medium" | "wide" | "full";

export type AppSettings = {
  theme: ThemeMode;
  accentColor: AccentColor;
  fontFamily: FontFamily;
  fontSize: number;
  editorWidth: EditorWidth;
  sidebarWidth: number;
  layoutDensity: LayoutDensity;
  autoSave: boolean;
  autoSaveInterval: number;
  spellCheck: boolean;
  showStatusBar: boolean;
  defaultNotebookId: string | null;
};
