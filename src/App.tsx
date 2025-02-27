"use client";

import { useTools } from "./contexts/ToolsContext";
import ToolGrid from "./components/ToolGrid";
import ToolView from "./components/ToolView";

export default function App() {
  const { activeTool } = useTools();

  return (
    <div className="space-y-8">
      {!activeTool && (
        <section className="text-center py-12 space-y-4">
          <h1 className="text-4xl font-bold">Free Browser-Based Tools</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A collection of free, privacy-focused tools that run entirely in
            your browser. No data ever leaves your device - all processing
            happens locally.
          </p>
        </section>
      )}

      {activeTool ? <ToolView /> : <ToolGrid />}
    </div>
  );
}
