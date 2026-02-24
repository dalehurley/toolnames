import { useState, useEffect, useRef } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
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
  Sun,
  Moon,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useTools } from "@/contexts/ToolsContext";
import { availableTools } from "@/contexts/toolsData";
import { useTheme } from "@/hooks/useTheme";
import ScrollToTop from "./ScrollToTop";
import BackToTop from "@/components/BackToTop";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  active?: boolean;
  count?: number;
  onClick?: () => void;
}

const NavItem = ({ icon, label, to, active, count, onClick }: NavItemProps) => (
  <Button
    variant={active ? "default" : "ghost"}
    className="w-full justify-start gap-2"
    onClick={onClick}
    asChild
  >
    <Link to={to}>
      {icon}
      <span className="flex-1 text-left">{label}</span>
      {count !== undefined && (
        <Badge variant="secondary" className="ml-auto text-xs">
          {count}
        </Badge>
      )}
    </Link>
  </Button>
);

interface MainLayoutProps {
  children?: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { setFilterCategory, filterCategory, searchQuery, setSearchQuery } = useTools();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const searchRef = useRef<HTMLInputElement>(null);

  // Update filter category based on current path
  useEffect(() => {
    const pathParts = location.pathname.split("/");
    if (pathParts.length > 1 && pathParts[1]) {
      const category = pathParts[1];
      if (
        [
          "calculators",
          "converters",
          "generators",
          "utilities",
          "file-tools",
          "seo",
        ].includes(category)
      ) {
        setFilterCategory(category);
      } else if (pathParts[1] === "") {
        setFilterCategory("all");
      }
    }
  }, [location.pathname, setFilterCategory]);

  // Keyboard shortcut: Cmd/Ctrl+K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchRef.current?.focus(), 50);
      }
      if (e.key === "Escape" && searchOpen) {
        setSearchOpen(false);
        setSearchQuery("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen, setSearchQuery]);

  // Count tools per category
  const toolCounts = {
    all: availableTools.length,
    calculators: availableTools.filter((t) => t.category === "calculators").length,
    converters: availableTools.filter((t) => t.category === "converters").length,
    generators: availableTools.filter((t) => t.category === "generators").length,
    utilities: availableTools.filter((t) => t.category === "utilities").length,
    "file-tools": availableTools.filter((t) => t.category === "file-tools").length,
    seo: availableTools.filter((t) => t.category === "seo").length,
  } as Record<string, number>;

  const navItems = [
    { icon: <Home className="h-5 w-5" />, label: "Home", id: "all", to: "/" },
    {
      icon: <Calculator className="h-5 w-5" />,
      label: "Calculators",
      id: "calculators",
      to: "/calculators",
    },
    {
      icon: <FileType className="h-5 w-5" />,
      label: "File Tools",
      id: "file-tools",
      to: "/file-tools",
    },
    {
      icon: <RotateCcw className="h-5 w-5" />,
      label: "Converters",
      id: "converters",
      to: "/converters",
    },
    {
      icon: <Shapes className="h-5 w-5" />,
      label: "Generators",
      id: "generators",
      to: "/generators",
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: "Utilities",
      id: "utilities",
      to: "/utilities",
    },
    {
      icon: <Search className="h-5 w-5" />,
      label: "SEO Tools",
      id: "seo",
      to: "/seo",
    },
  ];

  const handleCloseSheet = () => {
    setIsOpen(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (!searchOpen) setSearchOpen(true);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      {/* Header */}
      <header className="border-b bg-background sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center gap-3">
          {/* Mobile menu trigger */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 sm:max-w-sm">
              <div className="py-6 space-y-4">
                <h2 className="text-2xl font-bold mb-4">ToolNames</h2>
                <Separator />
                <nav className="space-y-2">
                  {navItems.map((item) => (
                    <NavItem
                      key={item.id}
                      icon={item.icon}
                      label={item.label}
                      to={item.to}
                      active={filterCategory === item.id}
                      count={item.id !== "all" ? toolCounts[item.id] : undefined}
                      onClick={handleCloseSheet}
                    />
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link to="/" className="text-xl font-bold shrink-0">
            ToolNames
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant={filterCategory === item.id ? "default" : "ghost"}
                className="gap-1.5 text-sm"
                asChild
              >
                <Link to={item.to}>
                  {item.icon}
                  <span>{item.label}</span>
                  {item.id !== "all" && (
                    <Badge variant="secondary" className="text-xs ml-0.5">
                      {toolCounts[item.id]}
                    </Badge>
                  )}
                </Link>
              </Button>
            ))}
          </nav>

          {/* Search bar */}
          <div className="relative flex items-center ml-auto">
            {searchOpen ? (
              <div className="flex items-center gap-1">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    ref={searchRef}
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search tools..."
                    className="pl-8 pr-8 w-48 md:w-64 h-9"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      onClick={handleClearSearch}
                      className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground"
                onClick={() => {
                  setSearchOpen(true);
                  setTimeout(() => searchRef.current?.focus(), 50);
                }}
              >
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline text-sm">Search</span>
                <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border bg-muted px-1.5 py-0.5 text-xs font-mono">
                  <span>⌘K</span>
                </kbd>
              </Button>
            )}
          </div>

          {/* Dark/Light mode toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {children || <Outlet />}
      </main>

      {/* Footer */}
      <footer className="border-t py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div>
              <h3 className="font-semibold mb-3">ToolNames</h3>
              <p className="text-sm text-muted-foreground">
                Free, privacy-focused tools that run entirely in your browser.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Calculators</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li><Link to="/calculators/mortgage-calculator" className="hover:text-foreground">Mortgage</Link></li>
                <li><Link to="/calculators/bmi-calculator" className="hover:text-foreground">BMI</Link></li>
                <li><Link to="/calculators/compound-interest-calculator" className="hover:text-foreground">Compound Interest</Link></li>
                <li><Link to="/calculators" className="hover:text-foreground text-primary">All calculators →</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Generators &amp; Converters</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li><Link to="/generators/password-generator" className="hover:text-foreground">Password Generator</Link></li>
                <li><Link to="/generators/qr-code-generator" className="hover:text-foreground">QR Code Generator</Link></li>
                <li><Link to="/converters/color-converter" className="hover:text-foreground">Color Converter</Link></li>
                <li><Link to="/converters" className="hover:text-foreground text-primary">All converters →</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Utilities &amp; SEO</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li><Link to="/utilities/json-formatter" className="hover:text-foreground">JSON Formatter</Link></li>
                <li><Link to="/utilities/character-counter" className="hover:text-foreground">Character Counter</Link></li>
                <li><Link to="/seo/keyword-density-analyzer" className="hover:text-foreground">Keyword Density</Link></li>
                <li><Link to="/seo" className="hover:text-foreground text-primary">All SEO tools →</Link></li>
              </ul>
            </div>
          </div>
          <Separator className="mb-4" />
          <div className="flex flex-col md:flex-row justify-between items-center gap-2 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} ToolNames.com — Free client-side tools for everyday tasks</p>
            <div className="flex gap-4">
              <p>All tools run entirely in your browser — your data never leaves your device</p>
              <Link to="/sitemap" className="text-primary hover:underline">Sitemap</Link>
            </div>
          </div>
        </div>
      </footer>

      <BackToTop />
    </div>
  );
};
