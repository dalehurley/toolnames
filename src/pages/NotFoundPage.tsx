import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/MainLayout";

const NotFoundPage = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    document.title = "Page Not Found | ToolNames";

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate("/", { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="text-8xl mb-4" aria-hidden="true">🔍</div>
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
          404
        </h1>
        <h2 className="text-2xl font-medium mb-4">Page Not Found</h2>
        <p className="text-muted-foreground mb-4 max-w-md">
          Sorry, the page you're looking for doesn't exist or has been moved.
        </p>
        <p className="text-sm text-muted-foreground mb-8">
          Redirecting to homepage in{" "}
          <span className="font-semibold text-indigo-500">{countdown}</span>{" "}
          second{countdown !== 1 ? "s" : ""}…
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <Button asChild className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700">
            <Link to="/">Go to Homepage</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/sitemap">Browse All Tools</Link>
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default NotFoundPage;
