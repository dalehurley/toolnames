import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { ToolsProvider } from "./contexts/ToolsContext";
import { Toaster } from "@/components/ui/sonner";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ToolsProvider>
      <RouterProvider router={router} />
      <Toaster />
    </ToolsProvider>
  </React.StrictMode>
);
