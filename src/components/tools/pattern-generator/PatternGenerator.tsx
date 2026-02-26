import React, { useEffect, useState } from "react";
import { PatternProvider, usePattern } from "@/contexts/PatternContext";
import {
  PatternType,
  PatternConfig,
  SavedPattern,
  OutputFormat,
} from "@/types/pattern";
import {
  generatePatternCSS,
  generateOutput,
  generateId,
  patternPresets,
} from "@/utils/patternHelpers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Copy,
  Download,
  Save,
  Trash2,
  Undo,
  ArrowLeftRight,
  BookOpen,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PatternPreview from "./PatternPreview";
import StripeControls from "./patterns/StripeControls";
import DotControls from "./patterns/DotControls";
import GridControls from "./patterns/GridControls";
import GeometricControls from "./patterns/GeometricControls";
import WaveControls from "./patterns/WaveControls";
import LayeredControls from "./patterns/LayeredControls";
import PatternPresetGallery from "./PatternPresetGallery";

const PatternGeneratorContent: React.FC = () => {
  const { state, dispatch } = usePattern();
  const [patternName, setPatternName] = useState("");
  const [className, setClassName] = useState("pattern");
  const [copied, setCopied] = useState(false);
  const [cssOutput, setCssOutput] = useState("");
  const [showPresets, setShowPresets] = useState(false);

  // Generate CSS when pattern type or config changes
  useEffect(() => {
    const css = generatePatternCSS(state.type, state.config);
    dispatch({ type: "SET_GENERATED_CSS", payload: css });
  }, [state.type, state.config, dispatch]);

  // Generate output based on format when CSS or className changes
  useEffect(() => {
    if (state.generatedCSS) {
      setCssOutput(
        generateOutput(state.generatedCSS, state.outputFormat, className)
      );
    }
  }, [className, state.generatedCSS, state.outputFormat]);

  const handlePatternTypeChange = (type: PatternType) => {
    dispatch({ type: "SET_PATTERN_TYPE", payload: type });
  };

  const handleConfigChange = (config: Partial<PatternConfig>) => {
    dispatch({ type: "UPDATE_CONFIG", payload: config });
  };

  const handleOutputFormatChange = (format: OutputFormat) => {
    dispatch({ type: "SET_OUTPUT_FORMAT", payload: format });
  };

  const handleCopyCSS = () => {
    navigator.clipboard.writeText(cssOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSavePattern = () => {
    if (!patternName.trim()) return;

    dispatch({
      type: "SAVE_PATTERN",
      payload: {
        id: generateId(),
        name: patternName,
        config: state.config,
      },
    });

    setPatternName("");
  };

  const handleLoadPattern = (pattern: SavedPattern) => {
    dispatch({ type: "SET_PATTERN_TYPE", payload: pattern.type });
    dispatch({ type: "LOAD_PATTERN", payload: pattern.config });
  };

  const handleDeletePattern = (id: string) => {
    dispatch({ type: "DELETE_SAVED_PATTERN", payload: id });
  };

  const handleDownloadCSS = () => {
    const blob = new Blob([cssOutput], { type: "text/css" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${className || "pattern"}.css`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleUndoClick = () => {
    dispatch({ type: "UNDO" });
  };

  // Type assertion function to deal with TypeScript's strict typing issues
  const asPatternConfig = (config: unknown): PatternConfig => {
    // For layered patterns, make sure the layers array is properly handled
    const patternConfig = config as PatternConfig;

    // If this is a layered pattern with layers, ensure each layer has the correct structure
    if (patternConfig.layers && Array.isArray(patternConfig.layers)) {
      patternConfig.layers = patternConfig.layers.map((layer) => ({
        ...layer,
        // Ensure each layer has required fields
        visible: layer.visible ?? true,
        opacity: layer.opacity ?? 1,
        blendMode: layer.blendMode ?? "normal",
      }));
    }

    return patternConfig;
  };

  const handleApplyPreset = (preset: unknown, presetType: PatternType) => {
    dispatch({ type: "SET_PATTERN_TYPE", payload: presetType });

    // Use our enhanced type assertion function
    const patternConfig = asPatternConfig(preset);
    dispatch({ type: "LOAD_PATTERN", payload: patternConfig });

    setShowPresets(false);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Pattern Type</CardTitle>
                  <CardDescription>
                    Select the type of pattern to generate
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUndoClick}
                    title="Undo"
                  >
                    <Undo className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPresets(!showPresets)}
                    title="Presets"
                  >
                    {showPresets ? (
                      <ArrowLeftRight className="h-4 w-4" />
                    ) : (
                      <BookOpen className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {showPresets ? (
                <PatternPresetGallery
                  onSelectPreset={(presetId) => {
                    const preset = patternPresets.find(
                      (p) => p.id === presetId
                    );
                    if (preset) {
                      handleApplyPreset(preset.config, preset.type);
                    }
                  }}
                />
              ) : (
                <>
                  <Tabs
                    defaultValue={state.type}
                    onValueChange={(value) =>
                      handlePatternTypeChange(value as PatternType)
                    }
                    className="w-full"
                  >
                    <TabsList className="grid grid-cols-3 lg:grid-cols-6">
                      <TabsTrigger value="stripes">Stripes</TabsTrigger>
                      <TabsTrigger value="dots">Dots</TabsTrigger>
                      <TabsTrigger value="grid">Grid</TabsTrigger>
                      <TabsTrigger value="geometric">Geometric</TabsTrigger>
                      <TabsTrigger value="waves">Waves</TabsTrigger>
                      <TabsTrigger value="layered">Layered</TabsTrigger>
                    </TabsList>

                    <div className="mt-6">
                      <TabsContent value="stripes">
                        <StripeControls
                          config={state.config}
                          onChange={handleConfigChange}
                        />
                      </TabsContent>
                      <TabsContent value="dots">
                        <DotControls
                          config={state.config}
                          onChange={handleConfigChange}
                        />
                      </TabsContent>
                      <TabsContent value="grid">
                        <GridControls
                          config={state.config}
                          onChange={handleConfigChange}
                        />
                      </TabsContent>
                      <TabsContent value="geometric">
                        <GeometricControls
                          config={state.config}
                          onChange={handleConfigChange}
                        />
                      </TabsContent>
                      <TabsContent value="waves">
                        <WaveControls
                          config={state.config}
                          onChange={handleConfigChange}
                        />
                      </TabsContent>
                      <TabsContent value="layered">
                        <LayeredControls
                          config={state.config}
                          onChange={handleConfigChange}
                        />
                      </TabsContent>
                    </div>
                  </Tabs>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Saved Patterns</CardTitle>
              <CardDescription>
                Save and reuse your favorite patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <Label htmlFor="patternName" className="sr-only">
                    Pattern Name
                  </Label>
                  <Input
                    id="patternName"
                    placeholder="Pattern name"
                    value={patternName}
                    onChange={(e) => setPatternName(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleSavePattern}
                  disabled={!patternName.trim()}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
              </div>

              {state.savedPatterns.length > 0 ? (
                <div className="space-y-2">
                  {state.savedPatterns.map((pattern) => (
                    <div
                      key={pattern.id}
                      className="flex items-center justify-between p-2 border rounded-md"
                    >
                      <div>
                        <p className="font-medium">{pattern.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {pattern.type.charAt(0).toUpperCase() +
                            pattern.type.slice(1)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleLoadPattern(pattern)}
                        >
                          Load
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePattern(pattern.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  No saved patterns yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pattern Preview</CardTitle>
              <CardDescription>Live preview of your pattern</CardDescription>
            </CardHeader>
            <CardContent>
              <PatternPreview type={state.type} config={state.config} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Generated Output</CardTitle>
              <CardDescription>Copy and use in your projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="className">CSS Class Name</Label>
                    <Input
                      id="className"
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      placeholder="pattern"
                    />
                  </div>
                  <div>
                    <Label htmlFor="outputFormat">Output Format</Label>
                    <Select
                      value={state.outputFormat}
                      onValueChange={(value) =>
                        handleOutputFormatChange(value as OutputFormat)
                      }
                    >
                      <SelectTrigger id="outputFormat">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="css">CSS</SelectItem>
                        <SelectItem value="tailwind">Tailwind CSS</SelectItem>
                        <SelectItem value="styled-components">
                          Styled Components
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="relative">
                  <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                    <code>{cssOutput}</code>
                  </pre>

                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopyCSS}>
                      {copied ? "Copied!" : <Copy className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadCSS}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const PatternGenerator: React.FC = () => {
  return (
    <PatternProvider>
      <PatternGeneratorContent />
    </PatternProvider>
  );
};

export default PatternGenerator;
