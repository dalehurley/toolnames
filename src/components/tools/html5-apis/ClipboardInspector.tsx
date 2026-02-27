import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clipboard, Copy, Check, Download, RefreshCw, FileText, Code, Image as ImageIcon } from "lucide-react";

interface ClipboardItem { type: string; content: string; timestamp: number; size: number; }

function tryParseJSON(str: string) {
  try { return JSON.parse(str); } catch { return null; }
}

function tryParseXML(str: string) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(str, "application/xml");
    const err = doc.querySelector("parsererror");
    return err ? null : new XMLSerializer().serializeToString(doc);
  } catch { return null; }
}

function detectType(content: string): string {
  if (tryParseJSON(content)) return "JSON";
  if (/<\/?[a-z][\s\S]*>/i.test(content)) {
    if (tryParseXML(content)) return "XML";
    return "HTML";
  }
  if (/^https?:\/\//.test(content.trim())) return "URL";
  if (/^\d+$/.test(content.trim())) return "Number";
  if (/^[\w.+-]+@[\w-]+\.[\w.]+$/.test(content.trim())) return "Email";
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(content.trim())) return "UUID";
  if (/^[0-9a-f]{32,}$/i.test(content.trim())) return "Hash";
  return "Plain Text";
}

export const ClipboardInspector = () => {
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [history, setHistory] = useState<ClipboardItem[]>([]);
  const [copied, setCopied] = useState("");
  const [writeText, setWriteText] = useState("");
  const [writeStatus, setWriteStatus] = useState("");

  const readClipboard = async () => {
    setImageUrl(null);
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        if (item.types.includes("image/png") || item.types.includes("image/jpeg")) {
          const type = item.types.find(t => t.startsWith("image/"))!;
          const blob = await item.getType(type);
          const url = URL.createObjectURL(blob);
          setImageUrl(url);
          const entry: ClipboardItem = { type: "Image", content: `[${type} image, ${(blob.size / 1024).toFixed(1)} KB]`, timestamp: Date.now(), size: blob.size };
          setHistory(h => [entry, ...h.slice(0, 9)]);
          setContent(`[Image in clipboard: ${type}, ${(blob.size / 1024).toFixed(1)} KB]`);
          return;
        }
        if (item.types.includes("text/plain")) {
          const blob = await item.getType("text/plain");
          const text = await blob.text();
          setContent(text);
          const entry: ClipboardItem = { type: detectType(text), content: text, timestamp: Date.now(), size: new Blob([text]).size };
          setHistory(h => [entry, ...h.slice(0, 9)]);
          return;
        }
      }
    } catch {
      // Fallback to readText
      try {
        const text = await navigator.clipboard.readText();
        setContent(text);
        const entry: ClipboardItem = { type: detectType(text), content: text, timestamp: Date.now(), size: new Blob([text]).size };
        setHistory(h => [entry, ...h.slice(0, 9)]);
      } catch (err) {
        setContent("Permission denied. Click 'Allow' when prompted.");
      }
    }
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id); setTimeout(() => setCopied(""), 2000);
  };

  const writeToClipboard = async () => {
    await navigator.clipboard.writeText(writeText);
    setWriteStatus("✓ Written to clipboard!");
    setTimeout(() => setWriteStatus(""), 2000);
  };

  const downloadContent = () => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `clipboard-${Date.now()}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  const detectedType = content ? detectType(content) : "";
  const formatted = () => {
    const json = tryParseJSON(content);
    if (json) return JSON.stringify(json, null, 2);
    return content;
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Clipboard className="h-6 w-6 text-primary" />
          <div>
            <CardTitle className="text-2xl">Clipboard Inspector</CardTitle>
            <CardDescription>Read, analyze, convert, and write clipboard data using the Clipboard API</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <Tabs defaultValue="read">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="read">Read & Inspect</TabsTrigger>
            <TabsTrigger value="write">Write to Clipboard</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="read" className="space-y-4 mt-4">
            <div className="flex flex-wrap gap-2">
              <Button onClick={readClipboard}>
                <Clipboard className="h-4 w-4 mr-2" />Read Clipboard
              </Button>
              {content && (
                <>
                  <Button variant="outline" onClick={() => copyText(content, "main")}>
                    {copied === "main" ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                    Copy
                  </Button>
                  <Button variant="outline" onClick={downloadContent}>
                    <Download className="h-4 w-4 mr-1" />Download
                  </Button>
                  <Button variant="ghost" onClick={() => { setContent(""); setImageUrl(null); }}>
                    <RefreshCw className="h-4 w-4 mr-1" />Clear
                  </Button>
                </>
              )}
              {detectedType && <Badge variant="secondary">{detectedType}</Badge>}
              {content && <Badge variant="outline">{new Blob([content]).size} bytes</Badge>}
            </div>

            {imageUrl && (
              <div className="border rounded-lg p-3">
                <div className="text-sm font-medium mb-2 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />Image in clipboard
                </div>
                <img src={imageUrl} alt="Clipboard content" className="max-w-full max-h-64 rounded" />
              </div>
            )}

            {content && !imageUrl && (
              <div>
                <Tabs defaultValue="raw">
                  <TabsList>
                    <TabsTrigger value="raw"><FileText className="h-3 w-3 mr-1" />Raw</TabsTrigger>
                    <TabsTrigger value="formatted"><Code className="h-3 w-3 mr-1" />Formatted</TabsTrigger>
                  </TabsList>
                  <TabsContent value="raw">
                    <Textarea value={content} onChange={e => setContent(e.target.value)}
                      className="font-mono text-xs min-h-[200px]" />
                  </TabsContent>
                  <TabsContent value="formatted">
                    <pre className="bg-muted rounded-lg p-3 text-xs font-mono overflow-auto max-h-[300px] whitespace-pre-wrap">
                      {formatted()}
                    </pre>
                  </TabsContent>
                </Tabs>

                {/* Analysis */}
                <div className="grid grid-cols-2 gap-3 mt-3">
                  {[
                    { label: "Detected Type", value: detectedType },
                    { label: "Size", value: `${new Blob([content]).size} bytes` },
                    { label: "Characters", value: content.length.toLocaleString() },
                    { label: "Lines", value: content.split("\n").length.toLocaleString() },
                  ].map(({ label, value }) => (
                    <div key={label} className="border rounded p-2">
                      <div className="text-xs text-muted-foreground">{label}</div>
                      <div className="font-medium text-sm">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!content && !imageUrl && (
              <div className="text-center py-8 text-muted-foreground">
                <Clipboard className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Click "Read Clipboard" to inspect your clipboard contents.</p>
                <p className="text-xs mt-1">Browser will ask for permission on first use.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="write" className="space-y-4 mt-4">
            <Textarea value={writeText} onChange={e => setWriteText(e.target.value)}
              placeholder="Enter text to write to your clipboard..." className="min-h-[200px] font-mono text-sm" />
            <div className="flex gap-2 items-center">
              <Button onClick={writeToClipboard} disabled={!writeText}>
                <Copy className="h-4 w-4 mr-2" />Write to Clipboard
              </Button>
              {writeStatus && <span className="text-sm text-green-600">{writeStatus}</span>}
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            {history.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">No history yet. Read some clipboard content first.</div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {history.map(item => (
                  <div key={item.timestamp} className="border rounded-lg p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <Badge variant="secondary">{item.type}</Badge>
                        <Badge variant="outline">{item.size} bytes</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{new Date(item.timestamp).toLocaleTimeString()}</span>
                        <Button variant="ghost" size="sm" onClick={() => copyText(item.content, String(item.timestamp))}>
                          {copied === String(item.timestamp) ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setContent(item.content)}>↩</Button>
                      </div>
                    </div>
                    <div className="font-mono text-xs text-muted-foreground truncate">{item.content}</div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="bg-muted rounded-lg p-3 text-sm text-muted-foreground">
          <strong>Clipboard API</strong> — Async clipboard read/write requires user permission. No data leaves your device.
        </div>
      </CardContent>
    </Card>
  );
};
