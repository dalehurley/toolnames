import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Share2, Copy, Check, Link, FileText, Image as ImageIcon, ExternalLink } from "lucide-react";

const SHARE_TEMPLATES = [
  { name: "Blog Post", title: "Check out this article", text: "I found this really helpful article you should read!", url: "https://example.com/article" },
  { name: "Product", title: "Amazing product deal!", text: "Look at this amazing deal I found.", url: "https://example.com/product" },
  { name: "Video", title: "Watch this video", text: "You need to see this video — it's incredible.", url: "https://youtube.com/watch?v=example" },
  { name: "GitHub Repo", title: "Interesting GitHub repo", text: "Found an awesome open-source project:", url: "https://github.com/example/repo" },
];

function buildShareUrl(title: string, text: string, url: string): string {
  const params = new URLSearchParams();
  if (title) params.set("title", title);
  if (text) params.set("text", text);
  if (url) params.set("url", url);
  return `${window.location.origin}?share&${params.toString()}`;
}

export const WebShareTool = () => {
  const [title, setTitle] = useState("Check this out!");
  const [text, setText] = useState("I found something amazing and wanted to share it with you.");
  const [url, setUrl] = useState("https://toolnames.com");
  const [shareResult, setShareResult] = useState("");
  const [copied, setCopied] = useState("");
  const supported = !!navigator.share;

  const share = async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({ title: title || undefined, text: text || undefined, url: url || undefined });
      setShareResult("✓ Shared successfully!");
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setShareResult(`Error: ${err.message}`);
      } else {
        setShareResult("Share cancelled.");
      }
    }
    setTimeout(() => setShareResult(""), 3000);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id); setTimeout(() => setCopied(""), 2000);
  };

  const canShare = () => {
    if (!navigator.canShare) return false;
    return navigator.canShare({ title, text, url });
  };

  // Generate various share link formats
  const shareLinks = [
    { label: "Twitter / X", url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, icon: "𝕏" },
    { label: "Facebook", url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, icon: "f" },
    { label: "LinkedIn", url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, icon: "in" },
    { label: "WhatsApp", url: `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`, icon: "📱" },
    { label: "Telegram", url: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, icon: "✈️" },
    { label: "Reddit", url: `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`, icon: "👽" },
    { label: "Hacker News", url: `https://news.ycombinator.com/submitlink?u=${encodeURIComponent(url)}&t=${encodeURIComponent(title)}`, icon: "▲" },
    { label: "Email", url: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + "\n\n" + url)}`, icon: "✉️" },
  ];

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Share2 className="h-6 w-6 text-primary" />
          <div>
            <CardTitle className="text-2xl">Web Share Tool</CardTitle>
            <CardDescription>Share content using the native Web Share API or generate platform-specific share links</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Support badge */}
        <div className="flex items-center gap-2">
          <Badge className={supported ? "bg-green-500 text-white" : "bg-yellow-500 text-black"}>
            {supported ? "Web Share API: Supported" : "Web Share API: Not supported"}
          </Badge>
          {!supported && <span className="text-xs text-muted-foreground">Use platform links below instead.</span>}
        </div>

        {/* Templates */}
        <div className="flex flex-wrap gap-2">
          {SHARE_TEMPLATES.map(t => (
            <Button key={t.name} variant="outline" size="sm"
              onClick={() => { setTitle(t.title); setText(t.text); setUrl(t.url); }}>
              {t.name}
            </Button>
          ))}
        </div>

        <Tabs defaultValue="builder">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="builder">Share Builder</TabsTrigger>
            <TabsTrigger value="platforms">Platform Links</TabsTrigger>
            <TabsTrigger value="card">Share Card</TabsTrigger>
          </TabsList>

          <TabsContent value="builder" className="mt-4 space-y-4">
            <div className="space-y-3">
              <div>
                <Label>Title</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Share title" />
              </div>
              <div>
                <Label>Text</Label>
                <Textarea value={text} onChange={e => setText(e.target.value)} placeholder="Share text..." className="h-20 resize-none" />
              </div>
              <div>
                <Label>URL</Label>
                <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com" type="url" />
              </div>
            </div>

            <div className="flex gap-2 items-center flex-wrap">
              <Button onClick={share} disabled={!supported || (!title && !text && !url)}>
                <Share2 className="h-4 w-4 mr-2" />Share via Native API
              </Button>
              {shareResult && <span className="text-sm text-green-600">{shareResult}</span>}
            </div>

            {/* API call preview */}
            <div className="bg-muted rounded-lg p-3 font-mono text-xs">
              <div className="text-muted-foreground mb-1">// Web Share API call:</div>
              <div className="text-primary">navigator.share({"{"}</div>
              {title && <div className="ml-4">title: "{title}",</div>}
              {text && <div className="ml-4">text: "{text.slice(0, 50)}{text.length > 50 ? "..." : ""}",</div>}
              {url && <div className="ml-4">url: "{url}",</div>}
              <div className="text-primary">{"})"}</div>
            </div>
          </TabsContent>

          <TabsContent value="platforms" className="mt-4">
            <div className="grid grid-cols-2 gap-2">
              {shareLinks.map(({ label, url: shareUrl, icon }) => (
                <div key={label} className="border rounded-lg p-2 flex items-center gap-2">
                  <span className="text-lg w-6 text-center">{icon}</span>
                  <span className="flex-1 text-sm font-medium">{label}</span>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(shareUrl, label)}>
                    {copied === label ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                  <a href={shareUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="sm"><ExternalLink className="h-3 w-3" /></Button>
                  </a>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="card" className="mt-4">
            {/* Share card preview like social meta tags */}
            <div className="border rounded-xl overflow-hidden max-w-md shadow-lg">
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 aspect-video flex items-center justify-center">
                <ImageIcon className="h-16 w-16 text-primary/30" />
              </div>
              <div className="p-4 space-y-2">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  {url ? new URL(url.startsWith("http") ? url : "https://" + url).hostname : "example.com"}
                </div>
                <div className="font-bold text-lg leading-tight">{title || "Page Title"}</div>
                <div className="text-sm text-muted-foreground line-clamp-2">{text || "Page description goes here..."}</div>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(`<meta property="og:title" content="${title}" />\n<meta property="og:description" content="${text}" />\n<meta property="og:url" content="${url}" />`, "meta")}>
                {copied === "meta" ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                Copy Open Graph tags
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <div className="bg-muted rounded-lg p-3 text-sm text-muted-foreground">
          <strong>Web Share API</strong> — <code>navigator.share()</code> invokes the native OS share sheet on supported devices. Works on Chrome, Safari on iOS/Android. Fallback: platform-specific URLs.
        </div>
      </CardContent>
    </Card>
  );
};
