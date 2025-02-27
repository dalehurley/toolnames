import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, RefreshCw, AlertTriangle } from "lucide-react";

export const Base64Tool = () => {
  const [encodeInput, setEncodeInput] = useState<string>("");
  const [encodeOutput, setEncodeOutput] = useState<string>("");
  const [decodeInput, setDecodeInput] = useState<string>("");
  const [decodeOutput, setDecodeOutput] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [decodeError, setDecodeError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"encode" | "decode">("encode");

  const handleEncodeInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const input = e.target.value;
    setEncodeInput(input);

    try {
      const encoded = btoa(input);
      setEncodeOutput(encoded);
    } catch {
      setEncodeOutput(
        "Error: Input contains characters that cannot be encoded to Base64"
      );
    }
  };

  const handleDecodeInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const input = e.target.value;
    setDecodeInput(input);
    setDecodeError(null);

    try {
      const decoded = atob(input);
      setDecodeOutput(decoded);
    } catch {
      setDecodeOutput("");
      setDecodeError("Invalid Base64 string");
    }
  };

  const handleClearEncode = () => {
    setEncodeInput("");
    setEncodeOutput("");
    setCopied(false);
  };

  const handleClearDecode = () => {
    setDecodeInput("");
    setDecodeOutput("");
    setDecodeError(null);
    setCopied(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as "encode" | "decode");
    setCopied(false);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Base64 Encoder / Decoder</CardTitle>
        <CardDescription>
          Encode text to Base64 or decode Base64 to text
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs
          defaultValue="encode"
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="encode">Encode to Base64</TabsTrigger>
            <TabsTrigger value="decode">Decode from Base64</TabsTrigger>
          </TabsList>

          <TabsContent value="encode" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="encodeInput">Text to Encode</Label>
              <Textarea
                id="encodeInput"
                value={encodeInput}
                onChange={handleEncodeInputChange}
                placeholder="Enter text to convert to Base64"
                className="min-h-[120px]"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="encodeOutput">Base64 Result</Label>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(encodeOutput)}
                    disabled={!encodeOutput}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearEncode}
                    disabled={!encodeInput}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </div>
              <Textarea
                id="encodeOutput"
                value={encodeOutput}
                readOnly
                placeholder="Base64 encoded result will appear here"
                className="min-h-[120px] font-mono"
              />
            </div>
          </TabsContent>

          <TabsContent value="decode" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="decodeInput">Base64 to Decode</Label>
              <Textarea
                id="decodeInput"
                value={decodeInput}
                onChange={handleDecodeInputChange}
                placeholder="Enter Base64 to convert to text"
                className="min-h-[120px] font-mono"
              />
              {decodeError && (
                <div className="flex items-center text-red-500 text-sm mt-1">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  {decodeError}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="decodeOutput">Decoded Result</Label>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(decodeOutput)}
                    disabled={!decodeOutput}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearDecode}
                    disabled={!decodeInput}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </div>
              <Textarea
                id="decodeOutput"
                value={decodeOutput}
                readOnly
                placeholder="Decoded text will appear here"
                className="min-h-[120px]"
              />
            </div>
          </TabsContent>
        </Tabs>

        {copied && (
          <div className="bg-green-100 text-green-800 p-2 rounded-md text-sm">
            Text copied to clipboard!
          </div>
        )}

        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-medium mb-2">What is Base64?</h3>
          <p className="text-sm text-muted-foreground">
            Base64 is a binary-to-text encoding scheme that represents binary
            data in an ASCII string format. It's commonly used when there's a
            need to encode binary data for storage or transfer in environments
            that only reliably support text content.
          </p>
          <div className="mt-3 space-y-1 text-sm text-muted-foreground">
            <p>
              <strong>Common uses:</strong>
            </p>
            <ul className="list-disc pl-5">
              <li>Embedding image data in HTML or CSS</li>
              <li>Sending binary data in JSON</li>
              <li>Email attachments (MIME)</li>
              <li>Storing complex data in cookies or local storage</li>
              <li>URL parameters where special characters aren't supported</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
