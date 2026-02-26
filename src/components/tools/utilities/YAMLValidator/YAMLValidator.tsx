import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertCircle,
  CheckCircle,
  RefreshCw,
  FileJson,
  Copy,
  Download,
  Wand2,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSEO } from '@/hooks/useSEO';
import { YAMLEditor } from './YAMLEditor';
import {
  validateYAML,
  formatYAML,
  yamlToJSON,
  jsonToYAML,
  SAMPLE_YAML,
  ValidationError,
  FormatOptions,
} from './yamlUtils';

export function YAMLValidator() {
  const [yamlText, setYamlText] = useState<string>('');
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [jsonOutput, setJsonOutput] = useState<string | null>(null);
  const [jsonInput, setJsonInput] = useState<string>('');
  const [yamlFromJson, setYamlFromJson] = useState<string | null>(null);
  const [jsonToYamlError, setJsonToYamlError] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('validate');
  const [formatOptions, setFormatOptions] = useState<FormatOptions>({
    indent: 2,
    lineWidth: 80,
    sortKeys: false,
  });
  const [convertError, setConvertError] = useState<string | null>(null);

  // SEO integration
  useSEO({
    title: 'YAML Validator: Validate & Format YAML | ToolNames',
    description:
      'Free YAML validator. Validate YAML syntax, format YAML documents, and convert between YAML and JSON with real-time error detection.',
    keywords:
      'YAML validator, YAML formatter, YAML to JSON, validate YAML syntax, online YAML checker',
  });

  // Validate YAML on input change
  useEffect(() => {
    if (yamlText.trim()) {
      const result = validateYAML(yamlText);
      setErrors(result.errors);

      // Generate JSON output if valid
      if (result.valid) {
        try {
          const json = yamlToJSON(yamlText);
          setJsonOutput(json);
          setConvertError(null);
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Conversion failed';
          setConvertError(errorMsg);
          setJsonOutput(null);
        }
      } else {
        setJsonOutput(null);
      }
    } else {
      setErrors([]);
      setJsonOutput(null);
    }
  }, [yamlText]);

  // Format YAML
  const handleFormatYAML = () => {
    if (!yamlText.trim()) {
      return;
    }

    try {
      const formatted = formatYAML(yamlText, formatOptions);
      setYamlText(formatted);
      setConvertError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Format failed';
      setConvertError(errorMsg);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string, type: 'json' | 'yaml') => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(type);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  // Download file
  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Load sample
  const loadSample = () => {
    setYamlText(SAMPLE_YAML);
    setConvertError(null);
  };

  // Convert JSON to YAML
  const handleJsonToYaml = () => {
    if (!jsonInput.trim()) {
      setJsonToYamlError('Please enter JSON to convert');
      setYamlFromJson(null);
      return;
    }

    try {
      const yaml = jsonToYAML(jsonInput);
      setYamlFromJson(yaml);
      setJsonToYamlError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Invalid JSON';
      setJsonToYamlError(errorMsg);
      setYamlFromJson(null);
    }
  };

  // Clear all
  const clearAll = () => {
    setYamlText('');
    setErrors([]);
    setJsonOutput(null);
    setJsonInput('');
    setYamlFromJson(null);
    setJsonToYamlError(null);
    setConvertError(null);
    setCopyFeedback(null);
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <Card className="max-w-5xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl flex items-center gap-2">
            <FileJson className="h-8 w-8" />
            YAML Validator & Converter
          </CardTitle>
          <CardDescription>
            Validate YAML syntax, format documents, and convert between YAML and JSON
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="validate">Validate & Format</TabsTrigger>
              <TabsTrigger value="convert">YAML ↔ JSON</TabsTrigger>
            </TabsList>

            <TabsContent value="validate" className="space-y-6">
              {/* YAML Editor */}
              <YAMLEditor value={yamlText} onChange={setYamlText} errors={errors} />

              {/* Format Options */}
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Wand2 className="h-5 w-5" />
                    Format Options
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="indent-select">Indentation</Label>
                      <Select
                        value={formatOptions.indent.toString()}
                        onValueChange={(val) =>
                          setFormatOptions({ ...formatOptions, indent: parseInt(val) })
                        }
                      >
                        <SelectTrigger id="indent-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">2 spaces</SelectItem>
                          <SelectItem value="4">4 spaces</SelectItem>
                          <SelectItem value="8">8 spaces</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="linewidth-select">Line Width</Label>
                      <Select
                        value={formatOptions.lineWidth.toString()}
                        onValueChange={(val) =>
                          setFormatOptions({ ...formatOptions, lineWidth: parseInt(val) })
                        }
                      >
                        <SelectTrigger id="linewidth-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="60">60 characters</SelectItem>
                          <SelectItem value="80">80 characters</SelectItem>
                          <SelectItem value="120">120 characters</SelectItem>
                          <SelectItem value="999">Unlimited</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={formatOptions.sortKeys}
                          onCheckedChange={(checked) =>
                            setFormatOptions({
                              ...formatOptions,
                              sortKeys: checked === true,
                            })
                          }
                        />
                        Sort Keys
                      </Label>
                    </div>
                  </div>

                  <Button
                    onClick={handleFormatYAML}
                    disabled={!yamlText.trim() || errors.length > 0}
                    className="w-full"
                    size="lg"
                  >
                    <Wand2 className="h-4 w-4 mr-2" />
                    Format YAML
                  </Button>
                </CardContent>
              </Card>

              {/* Status Messages */}
              {convertError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{convertError}</AlertDescription>
                </Alert>
              )}

              {yamlText && errors.length === 0 && (
                <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertTitle className="text-green-900 dark:text-green-200">
                    Valid YAML
                  </AlertTitle>
                  <AlertDescription className="text-green-800 dark:text-green-300">
                    Your YAML document is syntactically correct
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="convert" className="space-y-6">
              {/* YAML to JSON Section */}
              <Card className="bg-muted/30">
                <CardHeader>
                  <CardTitle className="text-lg">YAML → JSON</CardTitle>
                  <CardDescription>
                    Enter YAML in the Validate tab, then view the JSON output here
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {jsonOutput ? (
                    <>
                      <div className="relative">
                        <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-64 text-sm font-mono border">
                          <code>{jsonOutput}</code>
                        </pre>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(jsonOutput, 'json')}
                          className="flex-1 flex items-center justify-center gap-2"
                        >
                          <Copy className="h-4 w-4" />
                          {copyFeedback === 'json' ? 'Copied!' : 'Copy'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadFile(jsonOutput, 'converted.json')}
                          className="flex-1 flex items-center justify-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </>
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {yamlText
                          ? errors.length > 0
                            ? 'Fix YAML errors in the Validate tab to convert'
                            : 'No valid YAML to convert'
                          : 'Enter YAML in the Validate tab first'}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* JSON to YAML Section */}
              <Card className="bg-muted/30">
                <CardHeader>
                  <CardTitle className="text-lg">JSON → YAML</CardTitle>
                  <CardDescription>
                    Paste JSON below to convert it to YAML format
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="json-input">JSON Input</Label>
                    <textarea
                      id="json-input"
                      value={jsonInput}
                      onChange={(e) => setJsonInput(e.target.value)}
                      className="w-full h-40 p-4 font-mono text-sm border rounded-lg bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder='{"key": "value", "array": [1, 2, 3]}'
                      spellCheck="false"
                    />
                  </div>
                  <Button onClick={handleJsonToYaml} disabled={!jsonInput.trim()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Convert to YAML
                  </Button>

                  {jsonToYamlError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{jsonToYamlError}</AlertDescription>
                    </Alert>
                  )}

                  {yamlFromJson && (
                    <>
                      <div className="space-y-2">
                        <Label>YAML Output</Label>
                        <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-64 text-sm font-mono border">
                          <code>{yamlFromJson}</code>
                        </pre>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(yamlFromJson, 'yaml')}
                          className="flex-1 flex items-center justify-center gap-2"
                        >
                          <Copy className="h-4 w-4" />
                          {copyFeedback === 'yaml' ? 'Copied!' : 'Copy'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadFile(yamlFromJson, 'converted.yaml')}
                          className="flex-1 flex items-center justify-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={loadSample}
              className="flex items-center gap-2"
            >
              Load Sample
            </Button>
            <Button
              variant="outline"
              onClick={clearAll}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Clear All
            </Button>
          </div>

          {/* Info Section */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
              About YAML
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <li>• YAML (YAML Ain't Markup Language) is a human-friendly data format</li>
              <li>
                • Uses indentation and simple syntax to represent complex data structures
              </li>
              <li>• Commonly used for configuration files and data exchange</li>
              <li>• This validator checks syntax and can convert between YAML and JSON</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
