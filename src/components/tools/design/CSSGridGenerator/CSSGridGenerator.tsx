import { FC, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Code,
  LayoutGrid,
  Laptop,
  PanelLeftClose,
  HelpCircle,
} from "lucide-react";
import { GridCanvas } from "./GridCanvas";
import { GridControls } from "./GridControls";
import { CodeExport } from "./CodeExport";
import { BreakpointManager } from "./BreakpointManager";
import { TemplateGallery } from "./TemplateGallery";
import { GridCheatsheet } from "./GridCheatsheet";
import { useGridState } from "./hooks/useGridState";
import { ExportFormat } from "./types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const CSSGridGenerator: FC = () => {
  const {
    gridState,
    activeBreakpoint,
    breakpoints,
    exportFormat,
    selectedAreaId,
    templates,
    setExportFormat,
    setSelectedAreaId,
    updateBreakpointGridState,
    addColumn,
    removeColumn,
    updateColumn,
    addRow,
    removeRow,
    updateRow,
    addArea,
    updateArea,
    removeArea,
    updateGaps,
    updateContainerStyles,
    saveTemplate,
    loadTemplate,
    deleteTemplate,
    setActiveBreakpoint,
    addBreakpoint,
    removeBreakpoint,
  } = useGridState();

  const [fullWidthCanvas, setFullWidthCanvas] = useState(false);
  const [activeTab, setActiveTab] = useState("editor");

  const handleExportFormatChange = (value: string) => {
    setExportFormat(value as ExportFormat);
  };

  const handleLoadTemplate = (templateId: string) => {
    loadTemplate(templateId);
    // Automatically switch to the editor tab
    setActiveTab("editor");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <div>
          <h1 className="text-2xl font-bold">CSS Grid Generator</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create, customize, and export CSS Grid layouts visually
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFullWidthCanvas(!fullWidthCanvas)}
            className="flex items-center gap-1"
            title="Toggle controls panel"
          >
            <PanelLeftClose className="h-4 w-4" />
            <span className="hidden sm:inline">
              {fullWidthCanvas ? "Show Controls" : "Hide Controls"}
            </span>
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <TabsList className="mb-4">
          <TabsTrigger
            value="editor"
            className="flex items-center gap-1 py-2 px-4"
          >
            <LayoutGrid className="h-4 w-4" />
            <span>Grid Editor</span>
          </TabsTrigger>
          <TabsTrigger
            value="responsive"
            className="flex items-center gap-1 py-2 px-4"
          >
            <Laptop className="h-4 w-4" />
            <span>Responsive</span>
          </TabsTrigger>
          <TabsTrigger
            value="code"
            className="flex items-center gap-1 py-2 px-4"
          >
            <Code className="h-4 w-4" />
            <span>Export Code</span>
          </TabsTrigger>
          <TabsTrigger
            value="templates"
            className="flex items-center gap-1 py-2 px-4"
          >
            <span>Templates</span>
          </TabsTrigger>
          <TabsTrigger
            value="cheatsheet"
            className="flex items-center gap-1 py-2 px-4"
          >
            <BookOpen className="h-4 w-4" />
            <span>Cheatsheet</span>
          </TabsTrigger>
          <TabsTrigger
            value="help"
            className="flex items-center gap-1 py-2 px-4"
          >
            <HelpCircle className="h-4 w-4" />
            <span>Help</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="flex-1 flex">
          <div
            className={`${
              fullWidthCanvas ? "w-full" : "w-3/4"
            } transition-all duration-300 p-4`}
          >
            <GridCanvas
              gridState={gridState}
              selectedAreaId={selectedAreaId}
              onAreaSelect={setSelectedAreaId}
              onUpdateArea={updateArea}
              onRemoveArea={removeArea}
              onAddArea={addArea}
            />
          </div>
          {!fullWidthCanvas && (
            <div className="w-1/4 border-l p-4 overflow-y-auto">
              <GridControls
                gridState={gridState}
                selectedAreaId={selectedAreaId}
                onAddColumn={addColumn}
                onRemoveColumn={removeColumn}
                onUpdateColumn={updateColumn}
                onAddRow={addRow}
                onRemoveRow={removeRow}
                onUpdateRow={updateRow}
                onUpdateArea={updateArea}
                onUpdateGaps={updateGaps}
                onUpdateContainerStyles={updateContainerStyles}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="responsive" className="flex-1">
          <BreakpointManager
            breakpoints={breakpoints}
            activeBreakpoint={activeBreakpoint}
            gridState={gridState}
            onSetActiveBreakpoint={setActiveBreakpoint}
            onUpdateBreakpointGridState={updateBreakpointGridState}
            onAddBreakpoint={addBreakpoint}
            onRemoveBreakpoint={removeBreakpoint}
          />
        </TabsContent>

        <TabsContent value="code" className="flex-1">
          <CodeExport
            gridState={gridState}
            breakpoints={breakpoints}
            exportFormat={exportFormat}
            onExportFormatChange={handleExportFormatChange}
          />
        </TabsContent>

        <TabsContent value="templates" className="flex-1">
          <TemplateGallery
            templates={templates}
            onLoadTemplate={handleLoadTemplate}
            onSaveTemplate={saveTemplate}
            onDeleteTemplate={deleteTemplate}
            currentGridState={gridState}
          />
        </TabsContent>

        {/* New Cheatsheet Tab Content */}
        <TabsContent value="cheatsheet" className="flex-1 overflow-auto py-2">
          <div className="max-w-5xl mx-auto pb-8">
            <div className="mb-4">
              <h2 className="text-xl font-bold">CSS Grid Cheatsheet</h2>
              <p className="text-sm text-gray-500">
                A quick reference for CSS Grid properties and values
              </p>
            </div>
            <GridCheatsheet />
          </div>
        </TabsContent>

        {/* New Help Tab Content */}
        <TabsContent value="help" className="flex-1 overflow-auto py-2">
          <div className="max-w-4xl mx-auto pb-8">
            <div className="mb-4">
              <h2 className="text-xl font-bold">CSS Grid Generator Guide</h2>
              <p className="text-sm text-gray-500">
                Quick guide to using the CSS Grid Generator
              </p>
            </div>

            <div className="space-y-6 my-4">
              <Card className="p-6 border-l-4 border-l-blue-500">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Badge className="mr-2 bg-blue-500">Step 1</Badge>
                  Getting Started
                </h3>
                <ol className="list-decimal pl-5 space-y-3 text-sm">
                  <li className="pb-2">
                    Begin in the <strong>Grid Editor</strong> tab to build your
                    layout
                  </li>
                  <li className="pb-2">
                    Add/remove <strong>columns</strong> and{" "}
                    <strong>rows</strong> using the controls panel on the right
                  </li>
                  <li className="pb-2">
                    Create grid areas by <strong>clicking and dragging</strong>{" "}
                    on the grid canvas
                  </li>
                  <li className="pb-2">
                    Name and customize areas in the controls panel
                  </li>
                </ol>
                <div className="mt-3 bg-blue-50 dark:bg-blue-950 p-3 rounded-md">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    <strong>Pro tip:</strong> Use the toggle button in the top
                    right to hide the controls panel for a larger canvas view.
                  </p>
                </div>
              </Card>

              <Card className="p-6 border-l-4 border-l-purple-500">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Badge className="mr-2 bg-purple-500">Step 2</Badge>
                  Working with Grid Areas
                </h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start pb-2">
                    <span className="w-5 h-5 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mr-2 text-xs mt-0.5">
                      1
                    </span>
                    <span>
                      <strong>Click and drag</strong> on the grid canvas to
                      create a new area
                    </span>
                  </li>
                  <li className="flex items-start pb-2">
                    <span className="w-5 h-5 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mr-2 text-xs mt-0.5">
                      2
                    </span>
                    <span>
                      <strong>Click</strong> on an existing area to select it
                      for editing
                    </span>
                  </li>
                  <li className="flex items-start pb-2">
                    <span className="w-5 h-5 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mr-2 text-xs mt-0.5">
                      3
                    </span>
                    <span>
                      <strong>Right-click</strong> on an area for additional
                      options
                    </span>
                  </li>
                  <li className="flex items-start pb-2">
                    <span className="w-5 h-5 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mr-2 text-xs mt-0.5">
                      4
                    </span>
                    <span>
                      Use the <strong>Areas</strong> tab in the controls panel
                      to edit selected areas
                    </span>
                  </li>
                </ul>
                <div className="mt-3 bg-purple-50 dark:bg-purple-950 p-3 rounded-md">
                  <p className="text-xs text-purple-700 dark:text-purple-300">
                    <strong>Important:</strong> Grid areas cannot overlap. If
                    your selection overlaps an existing area, it will be
                    highlighted in red.
                  </p>
                </div>
              </Card>

              <Card className="p-6 border-l-4 border-l-green-500">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Badge className="mr-2 bg-green-500">Step 3</Badge>
                  Making Responsive Layouts
                </h3>
                <ol className="list-decimal pl-5 space-y-3 text-sm">
                  <li className="pb-2">
                    Switch to the <strong>Responsive</strong> tab to manage
                    breakpoints
                  </li>
                  <li className="pb-2">
                    Use <strong>Add Breakpoint</strong> to create custom
                    breakpoints
                  </li>
                  <li className="pb-2">
                    Select a breakpoint to customize its grid layout
                  </li>
                  <li className="pb-2">
                    Changes made at each breakpoint affect only that breakpoint
                  </li>
                </ol>
                <div className="mt-3 bg-green-50 dark:bg-green-950 p-3 rounded-md">
                  <p className="text-xs text-green-700 dark:text-green-300">
                    <strong>Pro tip:</strong> Start with the desktop layout
                    (largest breakpoint) and then create simpler layouts for
                    smaller screens.
                  </p>
                </div>
              </Card>

              <Card className="p-6 border-l-4 border-l-amber-500">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Badge className="mr-2 bg-amber-500">Step 4</Badge>
                  Exporting Your Grid
                </h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start pb-2">
                    <span className="w-5 h-5 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center mr-2 text-xs mt-0.5">
                      1
                    </span>
                    <span>
                      Move to the <strong>Export Code</strong> tab when your
                      grid is ready
                    </span>
                  </li>
                  <li className="flex items-start pb-2">
                    <span className="w-5 h-5 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center mr-2 text-xs mt-0.5">
                      2
                    </span>
                    <span>
                      Choose between <strong>CSS</strong>, <strong>SCSS</strong>
                      , or <strong>Tailwind</strong> formats
                    </span>
                  </li>
                  <li className="flex items-start pb-2">
                    <span className="w-5 h-5 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center mr-2 text-xs mt-0.5">
                      3
                    </span>
                    <span>
                      Use <strong>Copy</strong> to copy the code to your
                      clipboard
                    </span>
                  </li>
                  <li className="flex items-start pb-2">
                    <span className="w-5 h-5 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center mr-2 text-xs mt-0.5">
                      4
                    </span>
                    <span>
                      Use <strong>Download</strong> to save the code as a file
                    </span>
                  </li>
                </ul>
                <div className="mt-3 bg-amber-50 dark:bg-amber-950 p-3 rounded-md">
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    <strong>Remember:</strong> The code generator creates
                    responsive CSS for all your defined breakpoints.
                  </p>
                </div>
              </Card>

              <Card className="p-6 border-l-4 border-l-rose-500">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Badge className="mr-2 bg-rose-500">Step 5</Badge>
                  Using Templates
                </h3>
                <ul className="list-disc pl-5 space-y-3 text-sm">
                  <li className="pb-2">
                    Visit the <strong>Templates</strong> tab to browse
                    pre-defined grid layouts
                  </li>
                  <li className="pb-2">
                    Click on a template to instantly load it into the editor
                  </li>
                  <li className="pb-2">
                    Save your own custom templates for reuse
                  </li>
                  <li className="pb-2">
                    Filter templates by categories to find the right starting
                    point
                  </li>
                </ul>
                <div className="mt-3 bg-rose-50 dark:bg-rose-950 p-3 rounded-md">
                  <p className="text-xs text-rose-700 dark:text-rose-300">
                    <strong>Time saver:</strong> Templates include responsive
                    breakpoints, saving you time when creating complex layouts.
                  </p>
                </div>
              </Card>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-3">Keyboard Shortcuts</h3>
              <div className="overflow-hidden border rounded-md">
                <table className="min-w-full divide-y">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Shortcut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="px-6 py-2 whitespace-nowrap">
                        <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                          Delete
                        </code>{" "}
                        or
                        <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs ml-1">
                          Backspace
                        </code>
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm">
                        Remove selected area
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-2 whitespace-nowrap">
                        <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                          Tab
                        </code>
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm">
                        Cycle through areas
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-2 whitespace-nowrap">
                        <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                          Ctrl
                        </code>{" "}
                        +
                        <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs ml-1">
                          Z
                        </code>
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm">
                        Undo last action
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-2 whitespace-nowrap">
                        <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                          Ctrl
                        </code>{" "}
                        +
                        <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs ml-1">
                          Y
                        </code>
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm">
                        Redo last action
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Need More Help?</h3>
              <p className="text-sm">
                Check out the <strong>Cheatsheet</strong> tab for a
                comprehensive reference of CSS Grid properties and values.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
