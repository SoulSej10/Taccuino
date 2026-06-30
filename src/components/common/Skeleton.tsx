import { cn } from "@/lib/utils";

type SkeletonProps = {
  className?: string;
  count?: number;
};

export function Skeleton({ className, count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-700",
            className,
          )}
        />
      ))}
    </>
  );
}
