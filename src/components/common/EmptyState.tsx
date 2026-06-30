import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
};

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="text-muted-foreground flex size-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        {title}
      </h3>
      {description && (
        <p className="max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick} size="sm">
          {action.label}
        </Button>
      )}
    </div>
  );
}
