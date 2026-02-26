import React from "react";
import { cn } from "@/lib/utils";

interface KeyboardShortcutProps {
  children: React.ReactNode;
  className?: string;
}

export const KeyboardShortcut = ({
  children,
  className,
}: KeyboardShortcutProps) => {
  return (
    <kbd
      className={cn(
        "inline-flex items-center justify-center rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
        className
      )}
    >
      {children}
    </kbd>
  );
};
