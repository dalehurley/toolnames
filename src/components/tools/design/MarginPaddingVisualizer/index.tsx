import React from "react";
import { SpacingProvider } from "./SpacingContext";
import BoxModelEditor from "./BoxModelEditor";
import BatchGenerator from "./BatchGenerator";
import ExportPanel from "./ExportPanel";
import ComparisonView from "./ComparisonView";
import PreviewElement from "./PreviewElement";
import SnapshotManager from "./SnapshotManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookmarkIcon } from "lucide-react";

const MarginPaddingVisualizer: React.FC = () => {
  return (
    <SpacingProvider>
      <div className="container mx-auto py-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BoxModelEditor />
            <PreviewElement />
          </div>

          <Tabs defaultValue="generator" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="generator">Batch Generator</TabsTrigger>
              <TabsTrigger value="export">Export Code</TabsTrigger>
              <TabsTrigger value="comparison">System Comparison</TabsTrigger>
              <TabsTrigger value="snapshots" className="flex items-center">
                <BookmarkIcon className="h-4 w-4 mr-2" />
                Snapshots
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generator" className="mt-0">
              <BatchGenerator />
            </TabsContent>

            <TabsContent value="export" className="mt-0">
              <ExportPanel />
            </TabsContent>

            <TabsContent value="comparison" className="mt-0">
              <ComparisonView />
            </TabsContent>

            <TabsContent value="snapshots" className="mt-0">
              <SnapshotManager />
            </TabsContent>
          </Tabs>

          <div className="text-sm text-slate-600 dark:text-slate-400 space-y-2 bg-slate-50 dark:bg-slate-900 p-4 rounded-md border">
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
              About Margin/Padding Visualizer
            </h3>
            <p>
              This tool helps you visualize and understand the CSS box model,
              which consists of content, padding, border, and margin. You can
              interactively adjust these values and see how they affect the
              layout of elements.
            </p>
            <p>
              The batch generator allows you to create consistent spacing scales
              for your design system, which can be exported in various formats
              including vanilla CSS, SCSS/SASS, and Tailwind configuration.
            </p>
            <p>
              Use the comparison view to see how different spacing systems (like
              Tailwind, Material Design, or Bootstrap) compare to each other and
              to your custom system.
            </p>
            <p>
              The snapshots feature allows you to save your favorite
              configurations for quick access later, and the responsive preview
              helps you see how your spacing looks on different device sizes.
            </p>
          </div>
        </div>
      </div>
    </SpacingProvider>
  );
};

export default MarginPaddingVisualizer;
