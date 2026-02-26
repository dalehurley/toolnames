import { useState, useEffect } from "react";
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
  Clock,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useTools } from "@/contexts/ToolsContext";
import ScrollToTop from "./ScrollToTop";

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
    <Link to={to}>
      {icon}
      <span>{label}</span>
    </Link>
  </Button>
);

interface MainLayoutProps {
  children?: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { setFilterCategory, filterCategory, setActiveTool, tools } =
    useTools();
  const location = useLocation();

  // Update filter category and potentially the active tool based on current path
  useEffect(() => {
    const pathParts = location.pathname.split("/");

    // If the path is a category path like /calculators, set the filter category
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
          "productivity",
          "design",
        ].includes(category)
      ) {
        setFilterCategory(category);

        // If we have a tool path like /file-tools/file-converter, set the active tool
        if (pathParts.length > 2 && pathParts[2]) {
          const toolPath = pathParts[2];

          // Find the tool that matches this URL
          const matchingTool = tools.find((tool) => {
            const toolUrlParts = tool.url.split("/");
            const toolPathSegment = toolUrlParts[toolUrlParts.length - 1];
            return toolPathSegment === toolPath;
          });

          if (matchingTool) {
            setActiveTool(matchingTool.id);
          }
        }
      } else if (pathParts[1] === "") {
        // For homepage
        setFilterCategory("all");
      }
    }
  }, [location.pathname, setFilterCategory, setActiveTool, tools]);

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
      icon: <Clock className="h-5 w-5" />,
      label: "Productivity",
      id: "productivity",
      to: "/productivity",
    },
    {
      icon: <Palette className="h-5 w-5" />,
      label: "Design",
      id: "design",
      to: "/design",
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

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      {/* Header */}
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
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                      >
                        <path
                          d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
                          fill="currentColor"
                          fillRule="evenodd"
                          clipRule="evenodd"
                        ></path>
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
                        active={filterCategory === item.id}
                        onClick={handleCloseSheet}
                      />
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
            <Link
              to="/"
              className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent hover:from-indigo-600 hover:to-violet-600 transition-all ml-1 md:ml-0"
            >
              ToolNames
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant={filterCategory === item.id ? "default" : "ghost"}
                className={`gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  filterCategory === item.id
                    ? "bg-indigo-500 text-white hover:bg-indigo-600 shadow-sm hover:shadow ring-2 ring-indigo-500/20"
                    : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:shadow-sm"
                }`}
                asChild
              >
                <Link to={item.to} className="flex items-center">
                  <span className="flex items-center justify-center mr-1.5">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              </Button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {children || <Outlet />}
      </main>

      {/* Footer */}
      <footer className="border-t py-8 bg-background">
        <div className="container mx-auto px-4">
          {/* Main footer content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* ToolNames Info */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">ToolNames</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Free client-side tools for everyday tasks
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                All tools run entirely in your browser - your data never leaves
                your device
              </p>
              <Link
                to="/sitemap"
                className="text-primary hover:underline text-sm"
              >
                Sitemap
              </Link>
            </div>

            {/* Dale Hurley Projects - Column 1 */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">
                <a
                  href="https://www.dalehurley.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Dale Hurley Projects
                </a>
              </h3>
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium">
                    <a
                      href="https://spotfillr.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Spotfillr
                    </a>
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Childcare management platform for filling casual spots.
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">
                    <a
                      href="https://full.cx"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Full.CX
                    </a>
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    AI-driven tools for product teams and requirements.
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">
                    <a
                      href="https://customhomeworkmaker.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Custom Homework Maker
                    </a>
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    AI-powered personalized homework assignments.
                  </p>
                </div>
              </div>
            </div>

            {/* Dale Hurley Projects - Column 2 */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">More Tools</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium">
                    <a
                      href="https://www.1to5app.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      1 to 5 App
                    </a>
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Emotional learning tool for children aged 4-10.
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">
                    <a
                      href="https://rapidreportcard.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      RapidReportCard
                    </a>
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Performance management tools for businesses.
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">
                    <a
                      href="https://www.risks.io"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Risks.io
                    </a>
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Project risk identification and mitigation tools.
                  </p>
                </div>
              </div>
            </div>

            {/* Dale Hurley Projects - Column 3 */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">
                Apps & APIs
              </h3>
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium">
                    <a
                      href="https://speedbrain.app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      SpeedBrain
                    </a>
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Quiz app with quick-fire questions and leaderboards.
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">
                    <a
                      href="https://timelodge.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      TimeLodge
                    </a>
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Time tracking and client invoicing platform.
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">
                    <a
                      href="https://github.com/claude-php/claude-3-api"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Claude 3 API PHP
                    </a>
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    PHP package for Claude 3 API integration.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t pt-6 text-center text-muted-foreground">
            <p className="text-sm">
              © {new Date().getFullYear()} ToolNames.com - Free client-side
              tools for everyday tasks
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
