import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SunIcon, MoonIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Initialize theme based on system preference or stored preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("notes-theme") as
      | "light"
      | "dark"
      | null;

    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setTheme(prefersDark ? "dark" : "light");
    }
  }, []);

  // Apply theme changes to document
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("notes-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9"
          >
            {theme === "light" ? (
              <SunIcon className="h-5 w-5 text-amber-500" />
            ) : (
              <MoonIcon className="h-5 w-5 text-blue-400" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Switch to {theme === "light" ? "dark" : "light"} mode
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
