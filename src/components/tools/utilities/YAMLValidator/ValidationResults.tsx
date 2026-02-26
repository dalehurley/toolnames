import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Download, FileJson, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface ValidationResultsProps {
  yamlText: string;
  jsonOutput: string | null;
  copyFeedback: string | null;
  onCopyJson: () => void;
  onDownloadJson: () => void;
  onCopyYaml: () => void;
  onDownloadYaml: () => void;
}

export const ValidationResults = ({
  yamlText,
  jsonOutput,
  copyFeedback,
  onCopyJson,
  onDownloadJson,
  onCopyYaml,
  onDownloadYaml,
}: ValidationResultsProps) => {
  const [selectedTab, setSelectedTab] = useState('json');

  if (!jsonOutput && !yamlText) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileJson className="h-5 w-5" />
          Output Preview
        </CardTitle>
        <CardDescription>View formatted and converted output</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="json">JSON Output</TabsTrigger>
            <TabsTrigger value="yaml">YAML Output</TabsTrigger>
          </TabsList>

          <TabsContent value="json" className="space-y-4">
            {jsonOutput ? (
              <>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96 text-sm font-mono border">
                    <code>{jsonOutput}</code>
                  </pre>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onCopyJson}
                    className="flex items-center gap-2"
                  >
                    {copyFeedback === 'json' ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy JSON
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onDownloadJson}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download JSON
                  </Button>
                </div>
              </>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No JSON Output</AlertTitle>
                <AlertDescription>
                  Enter valid YAML to see the JSON conversion
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="yaml" className="space-y-4">
            {yamlText ? (
              <>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96 text-sm font-mono border">
                    <code>{yamlText}</code>
                  </pre>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onCopyYaml}
                    className="flex items-center gap-2"
                  >
                    {copyFeedback === 'yaml' ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy YAML
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onDownloadYaml}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download YAML
                  </Button>
                </div>
              </>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No YAML Output</AlertTitle>
                <AlertDescription>
                  Enter valid YAML to generate output
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
