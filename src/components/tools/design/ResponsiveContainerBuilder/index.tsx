import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { CardHeader } from "@/components/ui/card";
import { CardTitle } from "@/components/ui/card";
import { CardDescription } from "@/components/ui/card";
import { CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { InfoIcon, BookOpen } from "lucide-react";
import BreakpointEditor from "./BreakpointEditor";
import ResponsivePreview from "./ResponsivePreview";
import ContainerConfigurator from "./ContainerConfigurator";
import CodeExporter from "./CodeExporter";
import { EditorState, ExportFormat } from "./types";
import { defaultContainerConfig } from "@/utils/containerCodeGenerator";
import useResponsiveContainer from "@/hooks/useResponsiveContainer";

const ResponsiveContainerBuilder: React.FC = () => {
  // Initialize with default configuration
  const initialEditorState: EditorState = {
    activeBreakpoint: defaultContainerConfig.breakpoints[0].id,
    previewWidth: 768,
    showGrid: true,
    editMode: "visual",
  };

  // Use custom hook for container management
  const {
    containerConfig,
    setContainerConfig,
    editorState,
    setEditorState,
    addBreakpoint,
    updateBreakpoint,
    deleteBreakpoint,
  } = useResponsiveContainer(defaultContainerConfig, initialEditorState);

  const [exportFormat, setExportFormat] = useState<ExportFormat>("css");

  // Handle grid toggle
  const handleGridToggle = (show: boolean) => {
    setEditorState({
      ...editorState,
      showGrid: show,
    });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="mb-6">
        <CardHeader className="pb-4">
          <div className="flex flex-col space-y-4">
            <div>
              <CardTitle className="text-2xl font-bold">
                Responsive Container Builder
              </CardTitle>
              <CardDescription className="mt-2">
                Design responsive container layouts with visual tools. Define
                breakpoints, preview at different screen sizes, and export
                ready-to-use code.
              </CardDescription>
            </div>

            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5 bg-muted px-2 py-1 rounded-md">
                <InfoIcon className="h-3.5 w-3.5" />
                <span>Define breakpoints</span>
              </div>
              <div className="flex items-center gap-1.5 bg-muted px-2 py-1 rounded-md">
                <span>→</span>
                <span>Configure containers</span>
              </div>
              <div className="flex items-center gap-1.5 bg-muted px-2 py-1 rounded-md">
                <span>→</span>
                <span>Preview responsiveness</span>
              </div>
              <div className="flex items-center gap-1.5 bg-muted px-2 py-1 rounded-md">
                <span>→</span>
                <span>Export code</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="editor" className="w-full">
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="editor" className="flex items-center gap-1">
                  <span>1.</span> Visual Editor
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="flex items-center gap-1"
                >
                  <span>2.</span> Container Settings
                </TabsTrigger>
                <TabsTrigger value="export" className="flex items-center gap-1">
                  <span>3.</span> Export Code
                </TabsTrigger>
                <TabsTrigger value="guide">Help & Guide</TabsTrigger>
              </TabsList>

              <div className="flex items-center space-x-2">
                <Switch
                  id="show-grid"
                  checked={editorState.showGrid}
                  onCheckedChange={handleGridToggle}
                />
                <Label htmlFor="show-grid" className="text-sm cursor-pointer">
                  Show Grid
                </Label>
              </div>
            </div>

            <TabsContent value="editor" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5">
                  <div className="bg-muted rounded-md p-3 mb-3">
                    <h4 className="font-medium mb-1">Breakpoint Editor</h4>
                    <p className="text-sm text-muted-foreground mb-0">
                      Define your responsive breakpoints and how containers
                      behave at each size
                    </p>
                  </div>
                  <BreakpointEditor
                    containerConfig={containerConfig}
                    editorState={editorState}
                    onEditorStateChange={setEditorState}
                    onAddBreakpoint={addBreakpoint}
                    onUpdateBreakpoint={updateBreakpoint}
                    onDeleteBreakpoint={deleteBreakpoint}
                  />
                </div>
                <div className="lg:col-span-7">
                  <div className="bg-muted rounded-md p-3 mb-3">
                    <h4 className="font-medium mb-1">Live Preview</h4>
                    <p className="text-sm text-muted-foreground mb-0">
                      Resize to see how your container responds at different
                      viewport widths
                    </p>
                  </div>
                  <ResponsivePreview
                    containerConfig={containerConfig}
                    editorState={editorState}
                    onWidthChange={(width) =>
                      setEditorState({ ...editorState, previewWidth: width })
                    }
                  />
                </div>
              </div>

              <div className="bg-muted/30 border rounded-md p-4 mt-6">
                <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                  <InfoIcon className="h-4 w-4 text-blue-500" />
                  Quick Tips
                </h4>
                <ul className="text-sm text-muted-foreground grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Select a breakpoint to edit its properties</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>
                      Toggle "Fluid" to switch between fixed and percentage
                      widths
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>
                      Drag the preview slider to test at different widths
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Use device presets for standard screen sizes</span>
                  </li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="settings">
              <div className="border-b pb-4 mb-6">
                <h3 className="text-lg font-medium mb-2">Container Settings</h3>
                <p className="text-sm text-muted-foreground">
                  Configure global settings for your container classes. These
                  settings affect all breakpoints.
                </p>
              </div>
              <ContainerConfigurator
                containerConfig={containerConfig}
                onConfigChange={setContainerConfig}
              />

              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-md p-4 mt-6">
                <h4 className="text-sm font-medium text-blue-700 dark:text-blue-400 flex items-center gap-2 mb-2">
                  <InfoIcon className="h-4 w-4" />
                  Why These Settings Matter
                </h4>
                <p className="text-sm text-blue-700/80 dark:text-blue-400/80">
                  The container name becomes your CSS class. Centering applies
                  margin:auto, and CSS custom properties allow for easier
                  theming and maintenance. Once you're happy with these
                  settings, proceed to the Export tab.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="export">
              <div className="border-b pb-4 mb-6">
                <h3 className="text-lg font-medium mb-2">
                  Export Your Container Code
                </h3>
                <p className="text-sm text-muted-foreground">
                  Choose a format and copy the generated code to use in your
                  project.
                </p>

                <div className="flex space-x-3 mt-4">
                  <button
                    onClick={() => setExportFormat("css")}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      exportFormat === "css"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    CSS
                  </button>
                  <button
                    onClick={() => setExportFormat("scss")}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      exportFormat === "scss"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    SCSS
                  </button>
                  <button
                    onClick={() => setExportFormat("tailwind")}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      exportFormat === "tailwind"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    Tailwind Config
                  </button>
                </div>
              </div>

              <CodeExporter
                containerConfig={containerConfig}
                exportFormat={exportFormat}
                onFormatChange={setExportFormat}
              />

              <div className="bg-muted/30 border rounded-md p-4 mt-6">
                <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                  <InfoIcon className="h-4 w-4 text-blue-500" />
                  How to Use This Code
                </h4>
                <div className="text-sm text-muted-foreground space-y-3">
                  <p>
                    <strong>For CSS:</strong> Add to your stylesheet or include
                    in a &lt;style&gt; tag.
                  </p>
                  <p>
                    <strong>For SCSS:</strong> Import into your main SCSS file
                    or use with a preprocessor.
                  </p>
                  <p>
                    <strong>For Tailwind:</strong> Add to your
                    tailwind.config.js file under the appropriate section.
                  </p>
                  <p className="pt-2 border-t mt-2">
                    Then, add the class{" "}
                    <code className="px-1.5 py-0.5 bg-muted rounded text-xs">
                      {containerConfig.name}
                    </code>{" "}
                    to your container element.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="guide">
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-medium">
                    Using Responsive Containers
                  </h3>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">
                      What are Responsive Containers?
                    </h4>
                    <p className="text-muted-foreground">
                      Responsive containers help maintain consistent content
                      width across different screen sizes. They typically have
                      maximum widths at various breakpoints and center content
                      on the page.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">
                      Common Container Patterns
                    </h4>
                    <div className="space-y-2">
                      <div className="rounded border p-3">
                        <h5 className="text-sm font-medium">
                          Fixed-Width Container
                        </h5>
                        <p className="text-xs text-muted-foreground mt-1">
                          Has specific max-width values at each breakpoint.
                          Content width jumps at breakpoints.
                        </p>
                        <code className="text-xs bg-muted rounded px-1 py-0.5 mt-2 block">
                          max-width: 1280px;
                        </code>
                      </div>

                      <div className="rounded border p-3">
                        <h5 className="text-sm font-medium">Fluid Container</h5>
                        <p className="text-xs text-muted-foreground mt-1">
                          Uses percentage width, allowing content to fluidly
                          resize with the viewport.
                        </p>
                        <code className="text-xs bg-muted rounded px-1 py-0.5 mt-2 block">
                          width: 90%;
                        </code>
                      </div>

                      <div className="rounded border p-3">
                        <h5 className="text-sm font-medium">
                          Hybrid Container
                        </h5>
                        <p className="text-xs text-muted-foreground mt-1">
                          Fluid at smaller screens, but has a max-width to
                          prevent overly wide content.
                        </p>
                        <code className="text-xs bg-muted rounded px-1 py-0.5 mt-2 block">
                          width: 100%; max-width: 1200px;
                        </code>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Using This Tool</h4>
                    <ol className="list-decimal pl-4 space-y-2 text-muted-foreground">
                      <li>
                        Define your breakpoints (screen sizes where container
                        behavior changes)
                      </li>
                      <li>
                        Configure container width for each breakpoint (fixed or
                        fluid)
                      </li>
                      <li>Adjust container padding as needed</li>
                      <li>
                        Preview how your container will look at different screen
                        sizes
                      </li>
                      <li>
                        Export the generated code in your preferred format
                      </li>
                    </ol>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Best Practices</h4>
                    <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                      <li>
                        Use consistent breakpoints throughout your project
                      </li>
                      <li>
                        Consider adding padding that increases at larger screens
                      </li>
                      <li>
                        Don't make containers too wide on large screens
                        (improves readability)
                      </li>
                      <li>
                        Use CSS custom properties for easier theme customization
                      </li>
                      <li>
                        Test your containers with real content to ensure good
                        results
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResponsiveContainerBuilder;
