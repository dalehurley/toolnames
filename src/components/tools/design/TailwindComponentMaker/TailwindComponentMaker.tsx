import { FC, useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Settings,
  Code,
  Package,
  Save,
  Layers,
  Eye,
  Download,
  Smartphone,
  Tablet,
  Monitor,
  ScreenShare,
} from "lucide-react";

// Import subcomponents
import { ComponentControls } from "./components/ComponentControls";
import { ComponentCanvas } from "./components/ComponentCanvas";
import { ComponentCodeOutput } from "./components/ComponentCodeOutput";
import { ComponentLibrary } from "./components/ComponentLibrary";
import { StateSelector } from "./components/StateSelector";
import { MultiDevicePreview } from "./components/MultiDevicePreview";
import { DesignSystemManager } from "./components/DesignSystemManager";

// Import hooks
import { useComponentState, ExportFormat } from "./hooks/useComponentState";
import { useCodeGenerator } from "./hooks/useCodeGenerator";
import { useExporter } from "./hooks/useExporter";
import { useComponentStates } from "./hooks/useComponentStates";

// Import component templates
import { getTemplateById } from "./utils/componentTemplates";

export const TailwindComponentMaker: FC = () => {
  // Component state
  const {
    selectedComponentType,
    setSelectedComponentType,
    customizationOptions,
    updateCustomization,
    resetCustomization,
    activeViewport,
    setActiveViewport,
    exportFormat,
    setExportFormat,
    savedComponents,
    saveComponent,
    loadComponent,
    deleteComponent,
  } = useComponentState();

  // Component states (hover, focus, etc.)
  const { activeState, setActiveState, stateCustomizations, getStateClasses } =
    useComponentStates(customizationOptions);

  // Update state customizations when default customization changes
  useEffect(() => {
    // Only update default state
    stateCustomizations.default = customizationOptions;
  }, [customizationOptions]);

  // Code generation
  const { generateCode } = useCodeGenerator(
    selectedComponentType,
    customizationOptions
  );

  // Export functionality
  const { copyToClipboard, downloadSingleFile, exportAsZip } = useExporter(
    selectedComponentType,
    customizationOptions
  );

  // Local state
  const [componentName, setComponentName] = useState<string>("MyComponent");
  const [activeTab, setActiveTab] = useState<string>("design");
  const [previewMode, setPreviewMode] = useState<"single" | "multi">("single");

  // Get the selected template
  const selectedTemplate = getTemplateById(selectedComponentType);

  // Handle saving component
  const handleSaveComponent = () => {
    try {
      const id = saveComponent(componentName);
      toast.success("Component Saved", {
        description: `${componentName} has been saved to your library`,
      });
      return id;
    } catch {
      toast.error("Error Saving Component", {
        description: "There was an error saving your component",
      });
      return null;
    }
  };

  // Handle copy to clipboard
  const handleCopyToClipboard = async () => {
    const success = await copyToClipboard(exportFormat, componentName);

    if (success) {
      toast.success("Copied to Clipboard", {
        description: "Component code has been copied to clipboard",
      });
    } else {
      toast.error("Copy Failed", {
        description: "Failed to copy code to clipboard",
      });
    }
  };

  // Handle download file
  const handleDownloadFile = () => {
    try {
      downloadSingleFile(exportFormat, componentName);
      toast.success("Downloaded", {
        description: `${componentName} has been downloaded`,
      });
    } catch {
      toast.error("Download Failed", {
        description: "Failed to download component",
      });
    }
  };

  // Handle export as ZIP
  const handleExportZip = async () => {
    try {
      await exportAsZip({
        componentName,
        format: exportFormat,
        includeReadme: true,
        includeTypes: exportFormat === "react",
        includeExample: true,
      });

      toast.success("ZIP Package Created", {
        description: `${componentName}.zip has been downloaded`,
      });
    } catch {
      toast.error("Export Failed", {
        description: "Failed to create ZIP package",
      });
    }
  };

  // Viewport icons
  const viewportIcons = {
    mobile: <Smartphone size={16} />,
    tablet: <Tablet size={16} />,
    desktop: <Monitor size={16} />,
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Tailwind Component Maker</h1>
        <p className="text-gray-500">
          Create, customize, and export Tailwind CSS components
        </p>
      </div>

      <Tabs
        defaultValue="design"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-5 mb-6">
          <TabsTrigger value="design" className="flex items-center gap-2">
            <Settings size={16} />
            <span>Design</span>
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye size={16} />
            <span>Preview</span>
          </TabsTrigger>
          <TabsTrigger value="code" className="flex items-center gap-2">
            <Code size={16} />
            <span>Code</span>
          </TabsTrigger>
          <TabsTrigger value="library" className="flex items-center gap-2">
            <Layers size={16} />
            <span>Library</span>
          </TabsTrigger>
          <TabsTrigger value="designSystem" className="flex items-center gap-2">
            <Package size={16} />
            <span>Design System</span>
          </TabsTrigger>
        </TabsList>

        <div className="border rounded-lg p-6">
          <TabsContent value="design" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <ComponentControls
                  selectedComponentType={selectedComponentType}
                  setSelectedComponentType={setSelectedComponentType}
                  customizationOptions={customizationOptions}
                  updateCustomization={updateCustomization}
                  resetCustomization={resetCustomization}
                  componentName={componentName}
                  setComponentName={setComponentName}
                />

                {/* State Customization */}
                <div className="border rounded-md p-4">
                  <StateSelector
                    activeState={activeState}
                    setActiveState={setActiveState}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="border rounded-md p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Preview</h3>
                    <div className="flex border rounded-md overflow-hidden">
                      <button
                        className={`px-2 py-1 text-xs flex items-center gap-1 ${
                          activeViewport === "mobile"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                        onClick={() => setActiveViewport("mobile")}
                      >
                        {viewportIcons.mobile}
                        <span className="hidden md:inline">Mobile</span>
                      </button>
                      <button
                        className={`px-2 py-1 text-xs flex items-center gap-1 ${
                          activeViewport === "tablet"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                        onClick={() => setActiveViewport("tablet")}
                      >
                        {viewportIcons.tablet}
                        <span className="hidden md:inline">Tablet</span>
                      </button>
                      <button
                        className={`px-2 py-1 text-xs flex items-center gap-1 ${
                          activeViewport === "desktop"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                        onClick={() => setActiveViewport("desktop")}
                      >
                        {viewportIcons.desktop}
                        <span className="hidden md:inline">Desktop</span>
                      </button>
                    </div>
                  </div>

                  <ComponentCanvas
                    componentType={selectedComponentType}
                    customizationOptions={customizationOptions}
                    viewport={activeViewport}
                  />

                  {/* State indicator */}
                  {activeState !== "default" && (
                    <div className="mt-2 text-xs text-center p-1.5 bg-blue-50 text-blue-800 rounded-md">
                      <span>
                        Preview in{" "}
                        <span className="font-medium">{activeState}</span> state
                      </span>
                    </div>
                  )}
                </div>

                <div className="border rounded-md p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Quick Actions</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      className="px-3 py-2 bg-blue-500 text-white rounded-md text-sm flex items-center gap-2 hover:bg-blue-600 transition-colors"
                      onClick={handleSaveComponent}
                    >
                      <Save size={16} />
                      <span>Save Component</span>
                    </button>
                    <button
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm flex items-center gap-2 hover:bg-gray-200 transition-colors"
                      onClick={() => {
                        setActiveTab("code");
                        handleCopyToClipboard();
                      }}
                    >
                      <Code size={16} />
                      <span>Copy Code</span>
                    </button>
                    <button
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm flex items-center gap-2 hover:bg-gray-200 transition-colors"
                      onClick={() => {
                        setActiveTab("preview");
                        setPreviewMode("multi");
                      }}
                    >
                      <ScreenShare size={16} />
                      <span>Multi-device Preview</span>
                    </button>
                    <button
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm flex items-center gap-2 hover:bg-gray-200 transition-colors"
                      onClick={() => {
                        setActiveTab("code");
                        handleExportZip();
                      }}
                    >
                      <Package size={16} />
                      <span>Export ZIP</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                Preview: {selectedTemplate?.name || componentName}
              </h3>
              <div className="flex items-center gap-3">
                {/* Preview mode toggle */}
                <div className="flex border rounded-md overflow-hidden">
                  <button
                    className={`px-3 py-1.5 text-xs flex items-center gap-1.5 ${
                      previewMode === "single"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    onClick={() => setPreviewMode("single")}
                  >
                    <Eye size={16} />
                    <span>Single</span>
                  </button>
                  <button
                    className={`px-3 py-1.5 text-xs flex items-center gap-1.5 ${
                      previewMode === "multi"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    onClick={() => setPreviewMode("multi")}
                  >
                    <ScreenShare size={16} />
                    <span>Multiple</span>
                  </button>
                </div>

                {/* Viewport selector (only for single mode) */}
                {previewMode === "single" && (
                  <div className="flex border rounded-md overflow-hidden">
                    <button
                      className={`px-3 py-1.5 text-xs flex items-center gap-1.5 ${
                        activeViewport === "mobile"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                      onClick={() => setActiveViewport("mobile")}
                    >
                      {viewportIcons.mobile}
                      <span>Mobile</span>
                    </button>
                    <button
                      className={`px-3 py-1.5 text-xs flex items-center gap-1.5 ${
                        activeViewport === "tablet"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                      onClick={() => setActiveViewport("tablet")}
                    >
                      {viewportIcons.tablet}
                      <span>Tablet</span>
                    </button>
                    <button
                      className={`px-3 py-1.5 text-xs flex items-center gap-1.5 ${
                        activeViewport === "desktop"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                      onClick={() => setActiveViewport("desktop")}
                    >
                      {viewportIcons.desktop}
                      <span>Desktop</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* State selector for preview */}
            <div className="mb-4">
              <StateSelector
                activeState={activeState}
                setActiveState={setActiveState}
              />
            </div>

            <div className="border rounded-md p-4">
              {previewMode === "single" ? (
                <div className="min-h-[500px] flex items-center justify-center">
                  <ComponentCanvas
                    componentType={selectedComponentType}
                    customizationOptions={customizationOptions}
                    viewport={activeViewport}
                    fullScreen
                  />
                </div>
              ) : (
                <MultiDevicePreview
                  componentType={selectedComponentType}
                  customizationOptions={customizationOptions}
                  activeState={activeState}
                  getStateClasses={getStateClasses}
                />
              )}
            </div>

            {/* State info reminder */}
            {activeState !== "default" && previewMode === "single" && (
              <div className="text-sm p-3 bg-blue-50 text-blue-800 rounded-md">
                <strong>Note:</strong> You're previewing the component in the{" "}
                <strong>{activeState}</strong> state. This preview shows how the
                component will appear when a user interacts with it.
              </div>
            )}
          </TabsContent>

          <TabsContent value="code" className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-3/4">
                <div className="mb-4">
                  <h3 className="text-lg font-medium">Generated Code</h3>
                  <p className="text-sm text-gray-500">
                    Edit the component name and select the export format
                  </p>
                </div>

                <div className="flex flex-wrap items-center space-x-4 mb-4">
                  <div className="flex items-center space-x-2 my-2">
                    <label
                      htmlFor="componentName"
                      className="text-sm font-medium"
                    >
                      Component Name:
                    </label>
                    <input
                      type="text"
                      id="componentName"
                      value={componentName}
                      onChange={(e) => setComponentName(e.target.value)}
                      className="px-3 py-1 border rounded-md text-sm"
                    />
                  </div>

                  <div className="flex items-center space-x-2 my-2">
                    <label
                      htmlFor="exportFormat"
                      className="text-sm font-medium"
                    >
                      Format:
                    </label>
                    <select
                      id="exportFormat"
                      value={exportFormat}
                      onChange={(e) =>
                        setExportFormat(e.target.value as ExportFormat)
                      }
                      className="px-3 py-1 border rounded-md text-sm"
                    >
                      <option value="react">React</option>
                      <option value="vue">Vue</option>
                      <option value="html">HTML</option>
                    </select>
                  </div>
                </div>

                <ComponentCodeOutput
                  code={generateCode(exportFormat, componentName)}
                  language={
                    exportFormat === "html"
                      ? "html"
                      : exportFormat === "vue"
                      ? "vue"
                      : "tsx"
                  }
                  title={`${componentName}.${
                    exportFormat === "html"
                      ? "html"
                      : exportFormat === "vue"
                      ? "vue"
                      : "tsx"
                  }`}
                />

                {/* States Code Generation Note */}
                <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-md text-sm text-amber-800">
                  <p className="font-medium mb-1">Component State Handling</p>
                  <p>
                    The code above includes base styles. When implementing in
                    your project, remember to add state-specific styles (hover,
                    focus, active) according to your customizations.
                  </p>
                </div>
              </div>

              <div className="w-full md:w-1/4">
                <div className="border rounded-md p-4 sticky top-4">
                  <h3 className="text-lg font-medium mb-4">Export Options</h3>
                  <div className="space-y-3">
                    <button
                      className="w-full px-3 py-2 bg-blue-500 text-white rounded-md text-sm flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors"
                      onClick={handleCopyToClipboard}
                    >
                      <Code size={16} />
                      <span>Copy to Clipboard</span>
                    </button>
                    <button
                      className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                      onClick={handleDownloadFile}
                    >
                      <Download size={16} />
                      <span>Download File</span>
                    </button>
                    <button
                      className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                      onClick={handleExportZip}
                    >
                      <Package size={16} />
                      <span>Export as ZIP</span>
                    </button>
                    <Separator className="my-3" />
                    <button
                      className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                      onClick={handleSaveComponent}
                    >
                      <Save size={16} />
                      <span>Save to Library</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="library" className="space-y-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium">Component Library</h3>
              <p className="text-sm text-gray-500">
                Your saved components will appear here
              </p>
            </div>

            <ComponentLibrary
              savedComponents={savedComponents}
              loadComponent={loadComponent}
              deleteComponent={deleteComponent}
              setActiveTab={setActiveTab}
            />
          </TabsContent>

          <TabsContent value="designSystem" className="space-y-6">
            <DesignSystemManager />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
