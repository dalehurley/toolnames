import { useState, useEffect } from "react";
import { marked } from "marked";
import { saveAs } from "file-saver";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link,
  Image,
  Code,
  Hash,
  Table,
  FileDown,
  Copy,
  HelpCircle,
  Info,
  Heading1,
  Heading2,
  Heading3,
  Braces,
  Quote,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";

// Configure marked properly with TypeScript
const renderer = new marked.Renderer();
marked.setOptions({
  renderer: renderer,
  gfm: true,
  breaks: true,
  pedantic: false,
});

// Use the extension API to add syntax highlighting
const markedHighlight = {
  name: "highlight",
  level: "block",
  // Simplified tokenizer that doesn't use parameters
  tokenizer() {
    return undefined; // Let the default code block tokenizer handle this
  },
  renderer(token: any) {
    const { lang, text } = token;
    const language = hljs.getLanguage(lang) ? lang : "plaintext";
    return `<pre><code class="hljs language-${language}">${
      hljs.highlight(text, { language }).value
    }</code></pre>`;
  },
};

// Register the extension
marked.use({ extensions: [markedHighlight] });

// Default markdown example
const DEFAULT_MARKDOWN = `# Markdown Editor

## Getting Started with Markdown

This is a **bold text** and this is an *italic text*.

### Lists

Unordered list:
- Item 1
- Item 2
- Item 3

Ordered list:
1. First item
2. Second item
3. Third item

### Code

Inline \`code\` and code blocks:

\`\`\`javascript
function greet(name) {
  console.log('Hello, ' + name + '!');
}
greet('World');
\`\`\`

### Links and Images

[Visit GitHub](https://github.com)

![Placeholder Image](https://via.placeholder.com/150)

### Tables

| Header 1 | Header 2 |
| -------- | -------- |
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |

### Blockquotes

> This is a blockquote.
> It can span multiple lines.

---

Feel free to edit this text and see the preview update in real-time!
`;

// Toolbar item interfaces
interface ToolbarItem {
  icon: React.ReactNode;
  tooltip: string;
  action: () => void;
}

export const MarkdownEditor = () => {
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);
  const [html, setHtml] = useState("");
  const [view, setView] = useState<"split" | "edit" | "preview">("split");
  const [syntaxHelpOpen, setSyntaxHelpOpen] = useState(false);

  // Update HTML when markdown changes
  useEffect(() => {
    // Handle both synchronous and Promise-based returns from marked
    const result = marked.parse(markdown);
    if (typeof result === "string") {
      setHtml(result);
    } else if (result instanceof Promise) {
      result.then((html) => setHtml(html));
    }
  }, [markdown]);

  // Insert text at cursor position
  const insertText = (before: string, after = "") => {
    const textarea = document.getElementById(
      "markdown-textarea"
    ) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = markdown.substring(start, end);
    const replacement = before + selectedText + after;

    const newMarkdown =
      markdown.substring(0, start) + replacement + markdown.substring(end);
    setMarkdown(newMarkdown);

    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 0);
  };

  // Export HTML
  const exportHtml = () => {
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    saveAs(blob, "markdown_export.html");
  };

  // Export markdown
  const exportMarkdown = () => {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    saveAs(blob, "markdown_export.md");
  };

  // Copy HTML to clipboard
  const copyHtml = () => {
    navigator.clipboard.writeText(html);
    // Could add a toast notification here
  };

  // Toolbar items
  const toolbarItems: ToolbarItem[] = [
    {
      icon: <Heading1 size={18} />,
      tooltip: "Heading 1",
      action: () => insertText("# ", ""),
    },
    {
      icon: <Heading2 size={18} />,
      tooltip: "Heading 2",
      action: () => insertText("## ", ""),
    },
    {
      icon: <Heading3 size={18} />,
      tooltip: "Heading 3",
      action: () => insertText("### ", ""),
    },
    {
      icon: <Bold size={18} />,
      tooltip: "Bold",
      action: () => insertText("**", "**"),
    },
    {
      icon: <Italic size={18} />,
      tooltip: "Italic",
      action: () => insertText("*", "*"),
    },
    {
      icon: <List size={18} />,
      tooltip: "Bullet List",
      action: () => insertText("- ", ""),
    },
    {
      icon: <ListOrdered size={18} />,
      tooltip: "Numbered List",
      action: () => insertText("1. ", ""),
    },
    {
      icon: <Link size={18} />,
      tooltip: "Link",
      action: () => insertText("[", "](https://example.com)"),
    },
    {
      icon: <Image size={18} />,
      tooltip: "Image",
      action: () => insertText("![Alt Text](", ")"),
    },
    {
      icon: <Code size={18} />,
      tooltip: "Inline Code",
      action: () => insertText("`", "`"),
    },
    {
      icon: <Braces size={18} />,
      tooltip: "Code Block",
      action: () => insertText("```\n", "\n```"),
    },
    {
      icon: <Quote size={18} />,
      tooltip: "Blockquote",
      action: () => insertText("> ", ""),
    },
    {
      icon: <Table size={18} />,
      tooltip: "Table",
      action: () =>
        insertText(
          "| Header | Header |\n| ------ | ------ |\n| Cell   | Cell   |\n",
          ""
        ),
    },
    {
      icon: <Hash size={18} />,
      tooltip: "Horizontal Rule",
      action: () => insertText("\n---\n", ""),
    },
  ];

  const markdownSyntaxExamples = [
    { syntax: "# Heading 1", description: "First level heading" },
    { syntax: "## Heading 2", description: "Second level heading" },
    { syntax: "### Heading 3", description: "Third level heading" },
    { syntax: "**bold text**", description: "Bold text" },
    { syntax: "*italic text*", description: "Italic text" },
    { syntax: "- Item", description: "Unordered list item" },
    { syntax: "1. Item", description: "Ordered list item" },
    { syntax: "[Link text](https://example.com)", description: "Hyperlink" },
    { syntax: "![Alt text](image-url.jpg)", description: "Image" },
    { syntax: "`inline code`", description: "Inline code" },
    { syntax: "```\ncode block\n```", description: "Code block" },
    { syntax: "> blockquote", description: "Blockquote" },
    {
      syntax: "| Header | Header |\n| ------ | ------ |\n| Cell   | Cell   |",
      description: "Table",
    },
    { syntax: "---", description: "Horizontal rule" },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-6 w-6 text-primary" />
          Markdown Editor
        </CardTitle>
        <CardDescription>
          Write markdown and see the rendered preview in real-time
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Tabs
            value={view}
            onValueChange={(value) =>
              setView(value as "split" | "edit" | "preview")
            }
          >
            <TabsList>
              <TabsTrigger value="split">Split View</TabsTrigger>
              <TabsTrigger value="edit">Edit Only</TabsTrigger>
              <TabsTrigger value="preview">Preview Only</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex gap-2">
            <Dialog open={syntaxHelpOpen} onOpenChange={setSyntaxHelpOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <HelpCircle className="h-4 w-4 mr-1" />
                  Syntax Help
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Markdown Syntax Guide</DialogTitle>
                  <DialogDescription>
                    Common markdown syntax examples and their rendered output
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="bg-muted p-2 rounded-md text-sm">
                    <p>
                      Click any syntax example to insert it into your editor
                    </p>
                  </div>
                  <div className="grid">
                    {markdownSyntaxExamples.map((example, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-[1fr,2fr] py-2 border-b cursor-pointer hover:bg-muted"
                        onClick={() => {
                          setMarkdown(markdown + "\n" + example.syntax);
                          setSyntaxHelpOpen(false);
                        }}
                      >
                        <div className="font-mono text-sm bg-muted p-1 rounded mr-4">
                          {example.syntax}
                        </div>
                        <div className="text-sm">{example.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 p-2 border rounded-md bg-muted">
          <TooltipProvider>
            {toolbarItems.map((item, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={item.action}>
                    {item.icon}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{item.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>

        <div
          className={`grid gap-4 ${
            view === "split" ? "md:grid-cols-2" : "grid-cols-1"
          }`}
        >
          {view !== "preview" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Editor</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMarkdown(DEFAULT_MARKDOWN)}
                >
                  Reset
                </Button>
              </div>
              <Textarea
                id="markdown-textarea"
                className="font-mono min-h-[500px] resize-none"
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
              />
            </div>
          )}

          {view !== "edit" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Preview</h3>
                <div className="flex gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={copyHtml}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Copy HTML</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <div
                className="p-4 border rounded-md min-h-[500px] prose prose-slate dark:prose-invert max-w-none overflow-auto"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between border-t p-4">
        <div className="flex items-center text-sm text-muted-foreground">
          <Info className="h-4 w-4 mr-1" />
          <span>
            {markdown.length} characters |{" "}
            {markdown.split(/\s+/).filter(Boolean).length} words
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportMarkdown}>
            <FileDown className="h-4 w-4 mr-1" />
            Export .md
          </Button>
          <Button variant="outline" onClick={exportHtml}>
            <FileDown className="h-4 w-4 mr-1" />
            Export HTML
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default MarkdownEditor;
