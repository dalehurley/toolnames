import { useState, useEffect } from "react";
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
import { Copy, RefreshCw, Check, Info } from "lucide-react";

type UrlMode = "encode" | "decode" | "parseUrl";

export const UrlEncoder = () => {
  const [input, setInput] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [mode, setMode] = useState<UrlMode>("encode");
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    processInput();
  }, [input, mode]);

  const processInput = () => {
    setError(null);

    if (!input) {
      setOutput("");
      return;
    }

    try {
      switch (mode) {
        case "encode":
          setOutput(encodeURIComponent(input));
          break;
        case "decode":
          setOutput(decodeURIComponent(input));
          break;
        case "parseUrl":
          parseUrl(input);
          break;
      }
    } catch (err) {
      setError(
        `Error ${mode === "encode" ? "encoding" : "decoding"} URL: ${
          err instanceof Error ? err.message : "Invalid input"
        }`
      );
      setOutput("");
    }
  };

  const parseUrl = (url: string) => {
    try {
      const parsedUrl = new URL(url);
      setOutput(
        JSON.stringify(
          {
            protocol: parsedUrl.protocol,
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || "(default)",
            pathname: parsedUrl.pathname,
            search: parsedUrl.search,
            hash: parsedUrl.hash,
          },
          null,
          2
        )
      );
    } catch (err) {
      setError(
        `Invalid URL: ${
          err instanceof Error
            ? err.message
            : "The URL is not properly formatted"
        }`
      );
      setOutput("");
    }
  };

  const copyToClipboard = () => {
    if (!output) return;

    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setInput("");
    setOutput("");
    setError(null);
    setCopied(false);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">
          URL Encoder / Decoder / Parser
        </CardTitle>
        <CardDescription>
          Encode or decode URL components, or parse URLs into their constituent
          parts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={mode} onValueChange={(value) => setMode(value as UrlMode)}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="encode">Encode</TabsTrigger>
            <TabsTrigger value="decode">Decode</TabsTrigger>
            <TabsTrigger value="parseUrl">Parse URL</TabsTrigger>
          </TabsList>

          <TabsContent value="encode" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="encodeInput">Text to Encode</Label>
              <Textarea
                id="encodeInput"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter text to encode in a URL"
                className="min-h-[100px]"
              />
            </div>
          </TabsContent>

          <TabsContent value="decode" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="decodeInput">URL-Encoded Text</Label>
              <Textarea
                id="decodeInput"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter URL-encoded text to decode"
                className="min-h-[100px]"
              />
            </div>
          </TabsContent>

          <TabsContent value="parseUrl" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="urlInput">URL to Parse</Label>
              <Textarea
                id="urlInput"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter a URL to parse (e.g. https://example.com/path?query=value#hash)"
                className="min-h-[100px]"
              />
            </div>
          </TabsContent>
        </Tabs>

        {error && (
          <div className="bg-red-100 text-red-800 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="output">
              {mode === "encode"
                ? "Encoded URL"
                : mode === "decode"
                ? "Decoded Text"
                : "Parsed URL Components"}
            </Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                disabled={!output}
              >
                {copied ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAll}
                disabled={!input && !output}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
          <Textarea
            id="output"
            value={output}
            readOnly
            placeholder={`${
              mode === "encode"
                ? "Encoded"
                : mode === "decode"
                ? "Decoded"
                : "Parsed"
            } result will appear here`}
            className={`min-h-[100px] ${
              mode === "parseUrl" ? "font-mono text-sm" : ""
            }`}
          />
        </div>

        {copied && (
          <div className="bg-green-100 text-green-800 p-2 rounded-md text-sm">
            Output copied to clipboard!
          </div>
        )}

        <div className="bg-muted p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            <h3 className="font-medium">About URL Encoding</h3>
          </div>
          <div className="mt-2 space-y-2 text-sm text-muted-foreground">
            <p>
              URL encoding converts characters that are not allowed in URLs into
              a format that can be transmitted over the Internet.
            </p>
            <p>
              <strong>Common examples:</strong>
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Space becomes <code>%20</code>
              </li>
              <li>
                & becomes <code>%26</code>
              </li>
              <li>
                + becomes <code>%2B</code>
              </li>
              <li>
                / becomes <code>%2F</code>
              </li>
              <li>
                ? becomes <code>%3F</code>
              </li>
              <li>
                = becomes <code>%3D</code>
              </li>
              <li>
                # becomes <code>%23</code>
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
