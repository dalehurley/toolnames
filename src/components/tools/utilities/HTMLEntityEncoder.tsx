import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Copy, ArrowLeftRight, Check, Code } from "lucide-react";

const HTML_ENTITIES: [RegExp, string][] = [
  [/&/g, "&amp;"],
  [/</g, "&lt;"],
  [/>/g, "&gt;"],
  [/"/g, "&quot;"],
  [/'/g, "&#39;"],
  [/©/g, "&copy;"],
  [/®/g, "&reg;"],
  [/™/g, "&trade;"],
  [/€/g, "&euro;"],
  [/£/g, "&pound;"],
  [/¥/g, "&yen;"],
  [/¢/g, "&cent;"],
  [/§/g, "&sect;"],
  [/¶/g, "&para;"],
  [/†/g, "&dagger;"],
  [/‡/g, "&Dagger;"],
  [/•/g, "&bull;"],
  [/…/g, "&hellip;"],
  [/—/g, "&mdash;"],
  [/–/g, "&ndash;"],
  [/←/g, "&larr;"],
  [/→/g, "&rarr;"],
  [/↑/g, "&uarr;"],
  [/↓/g, "&darr;"],
  [/♠/g, "&spades;"],
  [/♣/g, "&clubs;"],
  [/♥/g, "&hearts;"],
  [/♦/g, "&diams;"],
  [/ /g, "&nbsp;"],
];

function encodeHTML(text: string): string {
  let result = text;
  for (const [regex, entity] of HTML_ENTITIES) {
    result = result.replace(regex, entity);
  }
  return result;
}

function decodeHTML(text: string): string {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}

export const HTMLEntityEncoder = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [copiedOutput, setCopiedOutput] = useState(false);

  const process = useCallback(
    (value: string, currentMode: "encode" | "decode") => {
      setInput(value);
      try {
        if (currentMode === "encode") {
          setOutput(encodeHTML(value));
        } else {
          setOutput(decodeHTML(value));
        }
      } catch {
        setOutput("");
      }
    },
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    process(e.target.value, mode);
  };

  const switchMode = () => {
    const newMode = mode === "encode" ? "decode" : "encode";
    setMode(newMode);
    process(input, newMode);
  };

  const copyOutput = () => {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => {
      setCopiedOutput(true);
      setTimeout(() => setCopiedOutput(false), 2000);
    });
  };

  const commonEntities = [
    { char: "<", entity: "&lt;" },
    { char: ">", entity: "&gt;" },
    { char: "&", entity: "&amp;" },
    { char: '"', entity: "&quot;" },
    { char: "©", entity: "&copy;" },
    { char: "®", entity: "&reg;" },
    { char: "™", entity: "&trade;" },
    { char: "€", entity: "&euro;" },
    { char: "—", entity: "&mdash;" },
    { char: " ", entity: "&nbsp;" },
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto p-4">
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 p-4 rounded-full">
            <Code className="h-8 w-8 text-emerald-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold">HTML Entity Encoder / Decoder</h1>
        <p className="text-muted-foreground">
          Convert special characters to HTML entities and back.
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant={mode === "encode" ? "default" : "outline"}
          onClick={() => {
            setMode("encode");
            process(input, "encode");
          }}
          className={mode === "encode" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
        >
          Encode
        </Button>
        <button
          onClick={switchMode}
          className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          aria-label="Swap encode/decode"
        >
          <ArrowLeftRight className="h-4 w-4 text-slate-600 dark:text-slate-400" />
        </button>
        <Button
          variant={mode === "decode" ? "default" : "outline"}
          onClick={() => {
            setMode("decode");
            process(input, "decode");
          }}
          className={mode === "decode" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
        >
          Decode
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="he-input">
            {mode === "encode" ? "Plain Text" : "HTML with Entities"}
          </Label>
          <Textarea
            id="he-input"
            value={input}
            onChange={handleInputChange}
            placeholder={
              mode === "encode"
                ? 'Enter text with special characters, e.g. <div class="foo"> © 2024'
                : "Enter HTML entities, e.g. &lt;div&gt; &copy;"
            }
            rows={10}
            className="font-mono text-sm resize-y"
          />
          <div className="text-xs text-muted-foreground">
            {input.length} characters
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="he-output">
              {mode === "encode" ? "HTML Encoded" : "Decoded Text"}
            </Label>
            <Button
              size="sm"
              variant="outline"
              onClick={copyOutput}
              disabled={!output}
            >
              {copiedOutput ? (
                <Check className="h-4 w-4 mr-1 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 mr-1" />
              )}
              {copiedOutput ? "Copied!" : "Copy"}
            </Button>
          </div>
          <Textarea
            id="he-output"
            value={output}
            readOnly
            rows={10}
            className="font-mono text-sm bg-slate-50 dark:bg-slate-900 resize-y"
          />
          <div className="text-xs text-muted-foreground">
            {output.length} characters
          </div>
        </div>
      </div>

      {/* Common Entities Reference */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
        <h2 className="font-semibold mb-3 text-sm text-slate-700 dark:text-slate-300 uppercase tracking-wide">
          Common HTML Entities
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {commonEntities.map(({ char, entity }) => (
            <button
              key={entity}
              onClick={() => {
                const newInput = input + char;
                process(newInput, mode);
              }}
              className="flex flex-col items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all text-xs group"
              title={`Insert ${char}`}
            >
              <span className="text-base font-medium mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                {char === " " ? "⎵" : char}
              </span>
              <span className="font-mono text-muted-foreground text-[10px]">
                {entity}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
