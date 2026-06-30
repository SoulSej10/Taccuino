import { X } from "lucide-react";
import { useAppState } from "@/stores/appStore";
import { cn } from "@/lib/utils";

const VARIANT_STYLES = {
  success:
    "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200",
  error:
    "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200",
  info: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200",
} as const;

export function ToastContainer() {
  const { state, dispatch } = useAppState();

  if (state.toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {state.toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg transition-all duration-300",
            VARIANT_STYLES[toast.type],
          )}
        >
          <span className="text-sm font-medium">{toast.message}</span>
          <button
            onClick={() => dispatch({ type: "REMOVE_TOAST", id: toast.id })}
            className="ml-auto shrink-0 rounded-md p-1 opacity-60 transition-opacity hover:opacity-100"
          >
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
