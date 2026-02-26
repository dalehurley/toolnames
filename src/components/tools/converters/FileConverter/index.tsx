import React, { useState, useEffect, forwardRef } from "react";
import { saveAs } from "file-saver";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Download,
  RefreshCw,
  FileDown,
  Copy,
  FileUp,
  FileJson,
  FileText as FileCsv,
  FileType,
  FileCode,
  FileSpreadsheet,
  ArrowRight,
  Wand2,
} from "lucide-react";
import { FileDropzone } from "./FileDropzone";
import { FormatPreview } from "./FormatPreview";
import { ConversionOptions } from "./ConversionOptions";
import { DataVisualization } from "./DataVisualization";
import { NotesVisualization } from "./NotesVisualization";
import {
  convertData,
  ConversionOptions as ConversionOptionsType,
  ConversionResult,
} from "./utils/converters";
import { Badge } from "@/components/ui/badge";

// Using forwardRef to properly handle refs passed from parent components
const FileConverterComponent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>((props, ref) => {
  // File state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string | ArrayBuffer | null>(
    null
  );
  const [sourceFormat, setSourceFormat] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<string>("json");

  // Conversion state
  const [conversionOptions, setConversionOptions] = useState<
    Record<string, unknown>
  >({});
  const [convertedContent, setConvertedContent] = useState<string | null>(null);
  const [conversionResult, setConversionResult] =
    useState<ConversionResult | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [activeTab, setActiveTab] = useState<string>("upload");
  const [conversionCount, setConversionCount] = useState(0);

  // Format icons mapping
  const formatIcons: Record<string, React.ReactNode> = {
    json: <FileJson className="h-6 w-6" />,
    csv: <FileCsv className="h-6 w-6" />,
    xml: <FileCode className="h-6 w-6" />,
    yaml: <FileType className="h-6 w-6" />,
  };

  // Format colors mapping
  const formatColors: Record<string, string> = {
    json: "bg-blue-500",
    csv: "bg-green-500",
    xml: "bg-purple-500",
    yaml: "bg-yellow-500",
  };

  // Format gradient backgrounds
  const formatGradients: Record<string, string> = {
    json: "bg-gradient-to-r from-blue-500 to-indigo-600",
    csv: "bg-gradient-to-r from-green-500 to-emerald-600",
    xml: "bg-gradient-to-r from-purple-500 to-fuchsia-600",
    yaml: "bg-gradient-to-r from-yellow-500 to-amber-600",
  };

  // Available formats for conversion
  const availableFormats = [
    { id: "json", label: "JSON", description: "JavaScript Object Notation" },
    { id: "csv", label: "CSV", description: "Comma-Separated Values" },
    { id: "xml", label: "XML", description: "Extensible Markup Language" },
    { id: "yaml", label: "YAML", description: "YAML Ain't Markup Language" },
  ];

  // Reset state when changing source format
  useEffect(() => {
    setConvertedContent(null);
    setConversionResult(null);
    setError(null);
  }, [sourceFormat, targetFormat]);

  // Handle file selection
  const handleFileSelected = (
    file: File,
    content: string | ArrayBuffer,
    detectedFormat: string | null
  ) => {
    // Skip Excel files
    if (detectedFormat === "excel" || file.name.match(/\.(xlsx|xls)$/i)) {
      setError("Excel conversion is not supported at this time");
      return;
    }

    setSelectedFile(file);
    setFileContent(content);
    setSourceFormat(detectedFormat);
    setActiveTab("convert");
    setConvertedContent(null);
    setConversionResult(null);
    setError(null);

    // Set default options based on detected format
    const defaultOptions: Record<string, unknown> = {
      source: detectedFormat || "",
      target: targetFormat,
    };

    if (detectedFormat === "csv") {
      defaultOptions.hasHeader = true;
      defaultOptions.delimiter = ",";
      defaultOptions.dynamicTyping = true;
      defaultOptions.skipEmptyLines = true;
    } else if (detectedFormat === "json" || targetFormat === "json") {
      defaultOptions.indentation = 2;
      defaultOptions.sortKeys = false;
    } else if (detectedFormat === "xml" || targetFormat === "xml") {
      defaultOptions.indentation = 2;
      defaultOptions.ignoreAttributes = false;
    } else if (detectedFormat === "yaml" || targetFormat === "yaml") {
      defaultOptions.indentation = 2;
      defaultOptions.flowLevel = -1;
    }

    setConversionOptions(defaultOptions);
  };

  // Handle conversion
  const handleConvert = async () => {
    if (!fileContent || !sourceFormat) {
      setError("No file selected or format not detected");
      return;
    }

    setIsConverting(true);
    setError(null);

    try {
      // Prepare options
      const options: ConversionOptionsType = {
        ...conversionOptions,
        source: sourceFormat,
        target: targetFormat,
      };

      // Convert data
      const result = convertData(
        fileContent,
        sourceFormat,
        targetFormat,
        options
      );

      if (!result.success) {
        throw new Error(result.error || "Conversion failed");
      }

      setConversionResult(result);

      // Set converted content for preview
      if (result.text) {
        setConvertedContent(result.text);
      } else if (result.data) {
        // Try to stringify data if it's an object
        try {
          setConvertedContent(JSON.stringify(result.data, null, 2));
        } catch (_unused) {
          void _unused; // Suppress unused variable warning
          setConvertedContent(String(result.data));
        }
      }

      // Increment conversion count
      setConversionCount((prev) => prev + 1);

      // Switch to result tab
      setActiveTab("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsConverting(false);
    }
  };

  // Handle download
  const handleDownload = () => {
    if (!conversionResult || !selectedFile) return;

    try {
      const fileName = selectedFile.name.split(".")[0];
      let fileExtension = "";
      let mimeType = "";
      let content: Blob;

      // Set file extension and MIME type based on target format
      switch (targetFormat) {
        case "json":
          fileExtension = "json";
          mimeType = "application/json";
          content = new Blob(
            [
              conversionResult.text ||
                JSON.stringify(conversionResult.data, null, 2),
            ],
            { type: mimeType }
          );
          break;
        case "csv":
          fileExtension = "csv";
          mimeType = "text/csv";
          content = new Blob([conversionResult.text || ""], { type: mimeType });
          break;
        case "xml":
          fileExtension = "xml";
          mimeType = "application/xml";
          content = new Blob([conversionResult.text || ""], { type: mimeType });
          break;
        case "yaml":
          fileExtension = "yaml";
          mimeType = "text/yaml";
          content = new Blob([conversionResult.text || ""], { type: mimeType });
          break;
        default:
          throw new Error("Unsupported format");
      }

      // Save file
      saveAs(content, `${fileName}.${fileExtension}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  // Handle copy to clipboard
  const handleCopy = async () => {
    if (!convertedContent) return;

    try {
      await navigator.clipboard.writeText(convertedContent);
    } catch (_unused) {
      void _unused; // Suppress unused variable warning
      setError("Failed to copy to clipboard");
    }
  };

  // Reset the converter
  const handleReset = () => {
    setSelectedFile(null);
    setFileContent(null);
    setSourceFormat(null);
    setConvertedContent(null);
    setConversionResult(null);
    setError(null);
    setActiveTab("upload");
  };

  // Render format badge
  const renderFormatBadge = (format: string) => {
    if (!format) return null;

    return (
      <div className="flex items-center gap-2">
        <div
          className={`p-2 rounded-full ${
            formatColors[format] || "bg-gray-500"
          } text-white`}
        >
          {formatIcons[format] || <FileType className="h-6 w-6" />}
        </div>
        <div>
          <p className="font-medium">{format.toUpperCase()}</p>
          <p className="text-xs text-muted-foreground">
            {availableFormats.find((f) => f.id === format)?.description ||
              "File Format"}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div ref={ref} {...props} className="space-y-8">
      {/* Hero section */}
      <div className="bg-gradient-to-r from-indigo-50 to-sky-50 dark:from-indigo-950/40 dark:to-sky-950/40 rounded-xl p-8 shadow-sm">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 text-center">
            File Converter
          </h1>
          <p className="text-center text-muted-foreground mb-6">
            Convert between common file formats with just a few clicks. All
            processing happens in your browser for complete privacy.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {availableFormats.map((format) => (
              <div
                key={format.id}
                className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center border shadow-sm hover:shadow-md transition-shadow"
              >
                <div
                  className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                    formatColors[format.id]
                  }`}
                >
                  {formatIcons[format.id]}
                </div>
                <p className="text-sm font-medium">{format.label}</p>
              </div>
            ))}
          </div>

          {conversionCount > 0 && (
            <div className="mt-4 text-center">
              <Badge variant="outline" className="bg-white/50 dark:bg-black/10">
                {conversionCount} conversion{conversionCount !== 1 ? "s" : ""}{" "}
                completed
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger
              value="upload"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              1. Upload
            </TabsTrigger>
            <TabsTrigger
              value="convert"
              disabled={!sourceFormat}
              className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
            >
              2. Configure
            </TabsTrigger>
            <TabsTrigger
              value="result"
              disabled={!convertedContent}
              className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
            >
              3. Result
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40">
              <CardHeader>
                <CardTitle className="text-xl">Upload Your File</CardTitle>
                <CardDescription>
                  Drag and drop your file or select it from your device
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileDropzone onFileSelected={handleFileSelected} />
              </CardContent>
            </Card>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileJson className="h-5 w-5 text-blue-500" />
                    Supported Formats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="bg-blue-100 text-blue-800 border-blue-200"
                      >
                        JSON
                      </Badge>
                      <span>JavaScript Object Notation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800 border-green-200"
                      >
                        CSV
                      </Badge>
                      <span>Comma-Separated Values</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="bg-purple-100 text-purple-800 border-purple-200"
                      >
                        XML
                      </Badge>
                      <span>Extensible Markup Language</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="bg-yellow-100 text-yellow-800 border-yellow-200"
                      >
                        YAML
                      </Badge>
                      <span>YAML Ain't Markup Language</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Wand2 className="h-5 w-5 text-purple-500" />
                    Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
                      <span>Client-side conversion</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
                      <span>Format auto-detection</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
                      <span>Customizable options</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
                      <span>Privacy protection</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
                      <span>Format validation</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileDown className="h-5 w-5 text-green-500" />
                    After Conversion
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                      <span>Download converted file</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                      <span>Copy content to clipboard</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                      <span>Preview file content</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                      <span>Convert another file</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="convert" className="space-y-6">
            {selectedFile && sourceFormat && (
              <>
                <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/40">
                  <CardHeader>
                    <CardTitle className="text-xl">
                      Configure Conversion
                    </CardTitle>
                    <CardDescription>
                      Set your conversion options and preview the source file
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
                      <div className="flex-1 flex flex-col items-center text-center">
                        {renderFormatBadge(sourceFormat)}
                        <p className="text-xs mt-2 text-muted-foreground">
                          Source Format
                        </p>
                      </div>

                      <div className="py-2">
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t"></span>
                          </div>
                          <div className="relative flex justify-center">
                            <ArrowRight className="h-6 w-6 text-muted-foreground bg-white dark:bg-gray-800 px-1" />
                          </div>
                        </div>
                      </div>

                      <div className="flex-1">
                        <Select
                          value={targetFormat}
                          onValueChange={setTargetFormat}
                        >
                          <SelectTrigger className="w-full">
                            <div className="flex items-center gap-2">
                              {formatIcons[targetFormat]}
                              <SelectValue placeholder="Select target format" />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            {availableFormats
                              .filter((format) => format.id !== sourceFormat)
                              .map((format) => (
                                <SelectItem key={format.id} value={format.id}>
                                  <div className="flex items-center gap-2">
                                    {formatIcons[format.id]}
                                    <span>{format.label}</span>
                                  </div>
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs mt-2 text-center text-muted-foreground">
                          Target Format
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">
                        Conversion Options
                      </h3>
                      <ConversionOptions
                        sourceFormat={sourceFormat}
                        targetFormat={targetFormat}
                        options={conversionOptions}
                        onOptionsChange={setConversionOptions}
                      />
                    </div>

                    {typeof fileContent === "string" && (
                      <FormatPreview
                        content={fileContent}
                        format={sourceFormat}
                        title="Source File Preview"
                      />
                    )}
                  </CardContent>
                  <CardFooter className="justify-center pb-6">
                    <Button
                      onClick={handleConvert}
                      disabled={isConverting}
                      className={`w-full md:w-auto shadow-md ${
                        formatGradients[targetFormat] || "bg-primary"
                      }`}
                      size="lg"
                    >
                      {isConverting ? (
                        <>
                          <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                          Converting...
                        </>
                      ) : (
                        <>
                          <FileDown className="mr-2 h-5 w-5" />
                          Convert to {targetFormat.toUpperCase()}
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="result" className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {convertedContent && (
              <>
                <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/40">
                  <CardHeader className="border-b">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-xl flex items-center gap-2">
                        <div
                          className={`p-1 rounded ${
                            formatColors[targetFormat] || "bg-primary"
                          } text-white`}
                        >
                          {formatIcons[targetFormat]}
                        </div>
                        Conversion Result
                      </CardTitle>

                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800 border-green-200"
                      >
                        Conversion Successful
                      </Badge>
                    </div>
                    <CardDescription>
                      Your file has been successfully converted to{" "}
                      {targetFormat.toUpperCase()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <FormatPreview
                      content={
                        typeof convertedContent === "string"
                          ? convertedContent
                          : JSON.stringify(convertedContent)
                      }
                      format={targetFormat}
                      title="Conversion Result"
                    />
                  </CardContent>
                  <CardFooter className="flex-col md:flex-row gap-4 pt-2 pb-6">
                    <Button
                      onClick={handleDownload}
                      className="w-full md:w-auto bg-green-600 hover:bg-green-700"
                    >
                      <Download className="mr-2 h-5 w-5" />
                      Download {targetFormat.toUpperCase()}
                    </Button>

                    {typeof convertedContent === "string" && (
                      <Button
                        variant="outline"
                        onClick={handleCopy}
                        className="w-full md:w-auto"
                      >
                        <Copy className="mr-2 h-5 w-5" />
                        Copy to Clipboard
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      onClick={handleReset}
                      className="w-full md:w-auto"
                    >
                      <FileUp className="mr-2 h-5 w-5" />
                      Convert Another File
                    </Button>
                  </CardFooter>
                </Card>

                {/* Add Data Visualization */}
                <div className="mt-6">
                  {targetFormat === "json" && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold">Visualizations</h3>

                      <div className="grid grid-cols-1 gap-4">
                        {/* Try to detect if it's notes data */}
                        {typeof convertedContent === "string" &&
                        convertedContent.includes('"title"') &&
                        convertedContent.includes('"content"') &&
                        convertedContent.includes('"createdAt"') ? (
                          <NotesVisualization data={convertedContent} />
                        ) : (
                          <DataVisualization
                            data={convertedContent}
                            format={targetFormat}
                            title="Data Visualization"
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {targetFormat !== "json" && (
                    <DataVisualization
                      data={convertedContent}
                      format={targetFormat}
                      title="Data Visualization"
                    />
                  )}
                </div>

                <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
                  <h3 className="text-lg font-medium mb-4">What's Next?</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <FileJson className="h-4 w-4 text-blue-500" />
                        Format Data
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Use our JSON Formatter or CSV Explorer to further
                        process your data
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <FileCode className="h-4 w-4 text-purple-500" />
                        Validate
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Validate your JSON or XML data with our schema tools
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <FileSpreadsheet className="h-4 w-4 text-green-500" />
                        Visualize
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Create charts and visualizations from your tabular data
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* SEO Content Section */}
      <div className="max-w-4xl mx-auto mt-20 text-muted-foreground">
        <div className="space-y-12">
          {/* What is File Conversion Section */}
          <section className="border-t pt-8">
            <h2 className="text-2xl font-bold mb-4 text-foreground">
              What is File Conversion?
            </h2>
            <p className="mb-4">
              File conversion is the process of changing a file from one format
              to another while preserving its content. This is useful when you
              need to work with data in different applications or share
              information with others who may use different software systems.
            </p>
            <p>
              Our free online File Converter tool allows you to easily convert
              between popular data formats like CSV, JSON, XML, and YAML. All
              conversion happens directly in your browser, ensuring your data
              remains private and secure.
            </p>
          </section>

          {/* Common File Formats Section */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">
              Common File Formats Explained
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-foreground flex items-center gap-2">
                  <div className="bg-blue-500 p-1 rounded text-white">
                    <FileJson className="h-4 w-4" />
                  </div>
                  JSON (JavaScript Object Notation)
                </h3>
                <p className="mb-2">
                  JSON is a lightweight data interchange format that is easy for
                  humans to read and write and easy for machines to parse and
                  generate. It is based on a subset of JavaScript syntax and is
                  commonly used for transmitting data in web applications.
                </p>
                <p className="text-sm">
                  <strong>Common uses:</strong> API responses, configuration
                  files, data storage, and exchange between systems.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 text-foreground flex items-center gap-2">
                  <div className="bg-green-500 p-1 rounded text-white">
                    <FileCsv className="h-4 w-4" />
                  </div>
                  CSV (Comma-Separated Values)
                </h3>
                <p className="mb-2">
                  CSV is a simple file format used to store tabular data, such
                  as a spreadsheet or database. Each line in the file represents
                  a row of the table, and columns are separated by commas (or
                  other delimiters).
                </p>
                <p className="text-sm">
                  <strong>Common uses:</strong> Data export/import,
                  spreadsheets, database backups, and data migration.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 text-foreground flex items-center gap-2">
                  <div className="bg-purple-500 p-1 rounded text-white">
                    <FileCode className="h-4 w-4" />
                  </div>
                  XML (Extensible Markup Language)
                </h3>
                <p className="mb-2">
                  XML is a markup language that defines a set of rules for
                  encoding documents in a format that is both human-readable and
                  machine-readable. It is highly customizable and can represent
                  complex data structures.
                </p>
                <p className="text-sm">
                  <strong>Common uses:</strong> Configuration files, data
                  exchange, document storage formats (like DOCX and SVG), and
                  web services (SOAP).
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 text-foreground flex items-center gap-2">
                  <div className="bg-yellow-500 p-1 rounded text-white">
                    <FileType className="h-4 w-4" />
                  </div>
                  YAML (YAML Ain't Markup Language)
                </h3>
                <p className="mb-2">
                  YAML is a human-friendly data serialization standard that is
                  commonly used for configuration files and in applications
                  where data is being stored or transmitted. It's designed to be
                  easily readable by humans while still being machine-parsable.
                </p>
                <p className="text-sm">
                  <strong>Common uses:</strong> Configuration files, CI/CD
                  pipelines, Kubernetes and Docker configurations, and data
                  serialization.
                </p>
              </div>
            </div>
          </section>

          {/* Why Use Our Tool Section */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">
              Why Use Our File Converter Tool?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-foreground">
                  <div className="p-1 rounded-full bg-blue-100 text-blue-800">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                    </svg>
                  </div>
                  Privacy-First Approach
                </h3>
                <p>
                  All file conversions happen directly in your browser. Your
                  files are never uploaded to any server, ensuring complete
                  privacy and data security.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-foreground">
                  <div className="p-1 rounded-full bg-green-100 text-green-800">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  </div>
                  User-Friendly Interface
                </h3>
                <p>
                  Our intuitive, step-by-step interface makes file conversion
                  simple. Just upload your file, select your target format, and
                  download the converted result.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-foreground">
                  <div className="p-1 rounded-full bg-purple-100 text-purple-800">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 2v4M12 18v4M4 12H2M8 12h.01M12 12h.01M16 12h.01M20 12h2" />
                    </svg>
                  </div>
                  Advanced Customization
                </h3>
                <p>
                  Configure conversion options like indentation, delimiters, and
                  format-specific settings to get exactly the output you need
                  for your specific use case.
                </p>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section>
            <h2 className="text-2xl font-bold mb-6 text-foreground">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
                <h3 className="text-lg font-semibold mb-2 text-foreground">
                  Is this service completely free?
                </h3>
                <p>
                  Yes, our File Converter tool is completely free to use with no
                  usage limits. We believe in providing accessible tools that
                  respect user privacy and data ownership.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
                <h3 className="text-lg font-semibold mb-2 text-foreground">
                  Are my files secure when using this converter?
                </h3>
                <p>
                  Absolutely. All file processing happens directly in your
                  browser. Your files never leave your device, and no data is
                  sent to our servers. This ensures complete privacy and
                  security for your sensitive information.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
                <h3 className="text-lg font-semibold mb-2 text-foreground">
                  What's the maximum file size I can convert?
                </h3>
                <p>
                  The tool supports files up to 10MB in size. However, since all
                  processing happens in your browser, very large files might
                  cause performance issues depending on your device. For optimal
                  performance, we recommend files under 5MB.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
                <h3 className="text-lg font-semibold mb-2 text-foreground">
                  What should I do if my conversion fails?
                </h3>
                <p>
                  If your conversion fails, first verify that your source file
                  is valid and properly formatted. Common issues include
                  malformed JSON, incorrectly formatted CSV files, or XML with
                  syntax errors. You can also try adjusting the conversion
                  options, such as changing delimiter settings for CSV files or
                  indentation for JSON/XML/YAML.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
                <h3 className="text-lg font-semibold mb-2 text-foreground">
                  Can I automate conversions or use this via API?
                </h3>
                <p>
                  Currently, the File Converter tool is available as a web
                  interface only. For automated conversions or API access,
                  consider using open-source libraries like Papa Parse for CSV,
                  js-yaml for YAML, or fast-xml-parser for XML in your own
                  projects.
                </p>
              </div>
            </div>
          </section>

          {/* Use Cases Section */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">
              Common Use Cases
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
                <h3 className="text-lg font-semibold mb-2 text-foreground">
                  Data Analysis & Visualization
                </h3>
                <p>
                  Convert CSV data exported from spreadsheets or databases to
                  JSON format for use in modern data visualization libraries
                  like D3.js, Chart.js, or data analysis tools.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
                <h3 className="text-lg font-semibold mb-2 text-foreground">
                  API Integration
                </h3>
                <p>
                  Transform JSON responses from APIs into CSV format for easier
                  import into spreadsheet applications or databases for further
                  analysis and reporting.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
                <h3 className="text-lg font-semibold mb-2 text-foreground">
                  Configuration Management
                </h3>
                <p>
                  Convert between YAML and JSON formats to support different
                  configuration systems in software development, cloud
                  infrastructure, or DevOps workflows.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
                <h3 className="text-lg font-semibold mb-2 text-foreground">
                  Data Migration
                </h3>
                <p>
                  Facilitate moving data between different systems by converting
                  from one structured format to another, preserving
                  relationships and data integrity.
                </p>
              </div>
            </div>
          </section>

          {/* Footer Note */}
          <section className="border-t pt-6 text-center text-sm opacity-75">
            <p>
              This File Converter tool is provided as-is without warranty.
              Always verify your converted data for accuracy before using it in
              production environments.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
});

FileConverterComponent.displayName = "FileConverter";

// Export the component
export const FileConverter = FileConverterComponent;
