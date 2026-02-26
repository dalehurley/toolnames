import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Copy, RefreshCw, Minimize2, Maximize2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

const SQL_KEYWORDS = [
  "SELECT", "FROM", "WHERE", "JOIN", "INNER", "LEFT", "RIGHT", "FULL", "OUTER",
  "ON", "GROUP", "BY", "ORDER", "HAVING", "LIMIT", "OFFSET", "UNION", "ALL",
  "INSERT", "INTO", "VALUES", "UPDATE", "SET", "DELETE", "CREATE", "TABLE",
  "ALTER", "DROP", "INDEX", "VIEW", "TRIGGER", "PROCEDURE", "FUNCTION",
  "AS", "AND", "OR", "NOT", "IN", "IS", "NULL", "LIKE", "BETWEEN", "EXISTS",
  "DISTINCT", "CASE", "WHEN", "THEN", "ELSE", "END", "WITH", "CTE", "RECURSIVE",
  "PRIMARY", "KEY", "FOREIGN", "REFERENCES", "UNIQUE", "DEFAULT", "CONSTRAINT",
  "ASC", "DESC", "NULLS", "FIRST", "LAST", "TOP", "FETCH", "NEXT", "ROWS", "ONLY",
  "IF", "EXISTS", "BEGIN", "COMMIT", "ROLLBACK", "TRANSACTION",
];

function formatSQL(sql: string, options: {
  uppercase: boolean;
  indentSize: number;
  newlineBeforeComma: boolean;
}): string {
  if (!sql.trim()) return "";

  let result = sql.trim();

  // Normalize whitespace
  result = result.replace(/\s+/g, " ");

  // Add newlines before major clauses
  const clauses = [
    "SELECT", "FROM", "WHERE", "LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "FULL JOIN",
    "OUTER JOIN", "JOIN", "GROUP BY", "ORDER BY", "HAVING", "LIMIT", "OFFSET",
    "UNION ALL", "UNION", "INSERT INTO", "VALUES", "UPDATE", "SET", "DELETE FROM",
    "CREATE TABLE", "ALTER TABLE", "WITH",
  ];

  for (const clause of clauses) {
    const regex = new RegExp(`\\b${clause.replace(/ /g, "\\s+")}\\b`, "gi");
    result = result.replace(regex, `\n${clause.toUpperCase()}`);
  }

  // Handle AND/OR
  result = result.replace(/\bAND\b/gi, "\n  AND");
  result = result.replace(/\bOR\b/gi, "\n  OR");

  // Indent after SELECT
  result = result.replace(/SELECT\n?(.+?)(?=\nFROM|\nWHERE)/is, (match) => {
    const selectContent = match.replace(/^SELECT\s*/i, "");
    const cols = selectContent.split(",").map(c => c.trim());
    if (cols.length > 1) {
      const indent = " ".repeat(options.indentSize);
      return `SELECT\n${indent}${cols.join(options.newlineBeforeComma ? `,\n${indent}` : `,\n${indent}`)}`;
    }
    return match;
  });

  // Apply keyword case
  if (options.uppercase) {
    for (const kw of SQL_KEYWORDS) {
      const regex = new RegExp(`\\b${kw}\\b`, "gi");
      result = result.replace(regex, kw.toUpperCase());
    }
  } else {
    for (const kw of SQL_KEYWORDS) {
      const regex = new RegExp(`\\b${kw}\\b`, "gi");
      result = result.replace(regex, kw.toLowerCase());
    }
  }

  // Clean up extra blank lines
  result = result.replace(/\n{3,}/g, "\n\n");
  result = result.trim();

  return result;
}

function minifySQL(sql: string): string {
  return sql
    .replace(/--[^\n]*/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function highlightSQL(sql: string): string {
  if (!sql) return "";

  let result = sql
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Strings
  result = result.replace(/'([^']*)'/g, `<span class="text-green-600 dark:text-green-400">'$1'</span>`);

  // Comments
  result = result.replace(/(--[^\n]*)/g, `<span class="text-gray-400 italic">$1</span>`);

  // Keywords
  for (const kw of SQL_KEYWORDS) {
    const regex = new RegExp(`\\b(${kw})\\b`, "gi");
    result = result.replace(regex, `<span class="text-blue-600 dark:text-blue-400 font-bold">$1</span>`);
  }

  // Numbers
  result = result.replace(/\b(\d+\.?\d*)\b/g, `<span class="text-orange-600 dark:text-orange-400">$1</span>`);

  return result;
}

const SAMPLE_SQL = `select u.id, u.name, u.email, count(o.id) as order_count, sum(o.total) as total_spent from users u left join orders o on u.id = o.user_id where u.created_at > '2024-01-01' and u.is_active = 1 group by u.id, u.name, u.email having count(o.id) > 0 order by total_spent desc limit 50`;

export const SqlFormatter = () => {
  const [input, setInput] = useState(SAMPLE_SQL);
  const [uppercase, setUppercase] = useState(true);
  const [newlineBeforeComma, setNewlineBeforeComma] = useState(false);
  const [indentSize, setIndentSize] = useState(2);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"formatted" | "highlighted" | "minified">("formatted");

  const formatted = useCallback(
    () => formatSQL(input, { uppercase, indentSize, newlineBeforeComma }),
    [input, uppercase, indentSize, newlineBeforeComma]
  )();

  const minified = minifySQL(input);
  const highlighted = highlightSQL(formatted);

  const outputText = viewMode === "minified" ? minified : formatted;

  const copy = () => {
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">SQL Formatter & Beautifier</CardTitle>
          <CardDescription>Format, beautify, and highlight SQL queries for better readability</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Options */}
          <div className="flex flex-wrap gap-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Switch id="uppercase" checked={uppercase} onCheckedChange={setUppercase} />
              <Label htmlFor="uppercase" className="cursor-pointer">Uppercase keywords</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="newlineComma" checked={newlineBeforeComma} onCheckedChange={setNewlineBeforeComma} />
              <Label htmlFor="newlineComma" className="cursor-pointer">Column per line</Label>
            </div>
            <div className="flex items-center gap-2">
              <Label>Indent:</Label>
              <div className="flex gap-1">
                {[2, 4].map(n => (
                  <Button key={n} variant={indentSize === n ? "default" : "outline"} size="sm" onClick={() => setIndentSize(n)}>
                    {n}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">SQL Input</Label>
              <Button variant="ghost" size="sm" onClick={() => setInput(SAMPLE_SQL)}>
                <RefreshCw className="h-3 w-3 mr-1" /> Sample
              </Button>
            </div>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="font-mono text-sm min-h-[150px]"
              placeholder="Paste your SQL query here..."
              spellCheck={false}
            />
          </div>

          {/* Output Tabs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {(["formatted", "highlighted", "minified"] as const).map(mode => (
                  <Badge
                    key={mode}
                    variant={viewMode === mode ? "default" : "outline"}
                    className="cursor-pointer capitalize"
                    onClick={() => setViewMode(mode)}
                  >
                    {mode === "highlighted" && <Maximize2 className="h-3 w-3 mr-1" />}
                    {mode === "minified" && <Minimize2 className="h-3 w-3 mr-1" />}
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </Badge>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={copy}>
                <Copy className="h-3 w-3 mr-1" /> Copy
              </Button>
            </div>

            {viewMode === "highlighted" ? (
              <div
                className="font-mono text-sm min-h-[300px] p-4 rounded-md border bg-muted/30 overflow-x-auto whitespace-pre leading-relaxed"
                dangerouslySetInnerHTML={{ __html: highlighted }}
              />
            ) : (
              <Textarea
                value={outputText}
                readOnly
                className="font-mono text-sm min-h-[300px] bg-muted/30"
                spellCheck={false}
              />
            )}
            {copied && <p className="text-xs text-green-600">Copied!</p>}
          </div>

          {/* Stats */}
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>Input: {input.length} chars</span>
            <span>Formatted: {formatted.length} chars</span>
            <span>Minified: {minified.length} chars</span>
            <span>Savings: {input.length > 0 ? Math.round((1 - minified.length / input.length) * 100) : 0}%</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
