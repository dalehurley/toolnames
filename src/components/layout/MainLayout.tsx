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
  Bug,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useTools } from "@/contexts/ToolsContext";

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
    className="w-full justify-start gap-2"
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
  const { setFilterCategory, filterCategory } = useTools();
  const location = useLocation();

  // Update filter category based on current path
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
        ].includes(category)
      ) {
        setFilterCategory(category);
      } else if (pathParts[1] === "") {
        // For homepage
        setFilterCategory("all");
      }
    }
  }, [location.pathname, setFilterCategory]);

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
  ];

  // Debug function to check context state
  const debugState = () => {
    console.log({
      filterCategory,
      location: location.pathname,
    });
    alert(
      `Current category: ${filterCategory} - Path: ${location.pathname} - Check browser console for details`
    );
  };

  const handleCloseSheet = () => {
    setIsOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
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
                        onClick={handleCloseSheet}
                      />
                    ))}
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2"
                      onClick={debugState}
                    >
                      <Bug className="h-5 w-5" />
                      <span>Debug</span>
                    </Button>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
            <Link to="/" className="text-xl font-bold">
              ToolNames
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant={filterCategory === item.id ? "default" : "ghost"}
                className="gap-2"
                asChild
              >
                <Link to={item.to}>
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </Button>
            ))}
            <Button
              variant="ghost"
              size="icon"
              onClick={debugState}
              title="Debug state"
            >
              <Bug className="h-5 w-5" />
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {children || <Outlet />}
      </main>

      {/* Footer */}
      <footer className="border-t py-6 bg-background">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>
            © {new Date().getFullYear()} ToolNames.com - Free client-side tools
            for everyday tasks
          </p>
          <p className="text-sm mt-2">
            All tools run entirely in your browser - your data never leaves your
            device
          </p>
          <p className="text-sm mt-4">
            <Link to="/sitemap" className="text-primary hover:underline">
              Sitemap
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
};
