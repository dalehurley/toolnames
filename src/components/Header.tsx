import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu,
  Home,
  Calculator,
  FileType,
  RotateCcw,
  Shapes,
  Settings,
  Search,
  Clock,
  Palette,
  Dices,
  Sun,
  Moon,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/hooks/useTheme";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  active?: boolean;
  onClick?: () => void;
}

const NavItem = ({ icon, label, to, active, onClick }: NavItemProps) => (
  <Button
    variant={active ? "default" : "ghost"}
    className={`w-full justify-start gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 ${
      active
        ? "bg-indigo-500 hover:bg-indigo-600 text-white"
        : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
    }`}
    onClick={onClick}
    asChild
  >
    <a href={to}>
      {icon}
      <span>{label}</span>
    </a>
  </Button>
);

interface HeaderProps {
  currentPath: string;
}

const navItems = [
  { icon: <Home className="h-5 w-5" />, label: "Home", id: "all", to: "/" },
  { icon: <Calculator className="h-5 w-5" />, label: "Calculators", id: "calculators", to: "/calculators" },
  { icon: <FileType className="h-5 w-5" />, label: "File Tools", id: "file-tools", to: "/file-tools" },
  { icon: <RotateCcw className="h-5 w-5" />, label: "Converters", id: "converters", to: "/converters" },
  { icon: <Shapes className="h-5 w-5" />, label: "Generators", id: "generators", to: "/generators" },
  { icon: <Settings className="h-5 w-5" />, label: "Utilities", id: "utilities", to: "/utilities" },
  { icon: <Clock className="h-5 w-5" />, label: "Productivity", id: "productivity", to: "/productivity" },
  { icon: <Palette className="h-5 w-5" />, label: "Design", id: "design", to: "/design" },
  { icon: <Search className="h-5 w-5" />, label: "SEO Tools", id: "seo", to: "/seo" },
  { icon: <Dices className="h-5 w-5" />, label: "Lottery", id: "lottery", to: "/lottery" },
  { icon: <Globe className="h-5 w-5" />, label: "HTML5 APIs", id: "html5-apis", to: "/html5-apis" },
];

const getActiveId = (path: string): string => {
  if (path === "/") return "all";
  const segment = path.split("/")[1];
  const found = navItems.find((item) => item.id === segment);
  return found ? found.id : "all";
};

export default function Header({ currentPath }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const activeId = getActiveId(currentPath);

  return (
    <header className="border-b border-slate-200/20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-72 sm:max-w-sm border-r border-slate-200 dark:border-slate-700 p-0 bg-white dark:bg-slate-900"
            >
              <div className="py-6 px-5 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
                    ToolNames
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-8 w-8 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="sr-only">Close menu</span>
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                      <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                    </svg>
                  </Button>
                </div>
                <Separator className="bg-slate-200 dark:bg-slate-700" />
                <nav className="space-y-2 mt-6">
                  {navItems.map((item) => (
                    <NavItem
                      key={item.id}
                      icon={item.icon}
                      label={item.label}
                      to={item.to}
                      active={activeId === item.id}
                      onClick={() => setIsOpen(false)}
                    />
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
          <a
            href="/"
            className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent hover:from-indigo-600 hover:to-violet-600 transition-all ml-1 md:ml-0"
          >
            ToolNames
          </a>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="md:hidden text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={activeId === item.id ? "default" : "ghost"}
              className={`gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 ${
                activeId === item.id
                  ? "bg-indigo-500 text-white hover:bg-indigo-600 shadow-sm hover:shadow ring-2 ring-indigo-500/20"
                  : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:shadow-sm"
              }`}
              asChild
            >
              <a href={item.to} className="flex items-center">
                <span className="flex items-center justify-center mr-1.5">{item.icon}</span>
                <span>{item.label}</span>
              </a>
            </Button>
          ))}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="ml-1 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </nav>
      </div>
    </header>
  );
}
