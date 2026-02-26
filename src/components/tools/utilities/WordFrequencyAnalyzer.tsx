import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Download, RefreshCw } from "lucide-react";

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
  "being", "have", "has", "had", "do", "does", "did", "will", "would",
  "could", "should", "may", "might", "shall", "can", "need", "dare",
  "it", "its", "i", "me", "my", "we", "our", "you", "your", "he", "his",
  "she", "her", "they", "their", "them", "this", "that", "these", "those",
  "not", "no", "so", "if", "as", "up", "out", "about", "into", "than",
  "then", "when", "where", "which", "who", "what", "how", "all", "each",
  "more", "also", "just", "only", "s", "t", "re", "ve", "ll", "d",
]);

const COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f97316",
  "#eab308", "#22c55e", "#14b8a6", "#06b6d4", "#3b82f6",
];

const SAMPLE_TEXT = `The quick brown fox jumps over the lazy dog. The dog barked loudly at the fox.
The fox ran away quickly. Dogs and foxes have lived in competition for centuries.
Nature is beautiful and complex. The world is full of wonders that we can explore.`;

interface WordCount {
  word: string;
  count: number;
  percentage: number;
}

export const WordFrequencyAnalyzer = () => {
  const [text, setText] = useState(SAMPLE_TEXT);
  const [removeStopWords, setRemoveStopWords] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [minLength, setMinLength] = useState(2);
  const [topN, setTopN] = useState(20);

  const analysis = useMemo(() => {
    if (!text.trim()) return { words: [], totalWords: 0, uniqueWords: 0, sentences: 0, avgWordLength: 0 };

    const raw = text.replace(/[^\w\s'-]/g, " ");
    const tokens = raw.split(/\s+/).filter(w => w.length >= minLength);

    const normalizedTokens = caseSensitive ? tokens : tokens.map(w => w.toLowerCase());
    const filtered = removeStopWords
      ? normalizedTokens.filter(w => !STOP_WORDS.has(w.toLowerCase()))
      : normalizedTokens;

    const freq: Record<string, number> = {};
    for (const word of filtered) {
      freq[word] = (freq[word] || 0) + 1;
    }

    const totalWords = filtered.length;
    const sorted = Object.entries(freq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, topN)
      .map(([word, count]) => ({
        word,
        count,
        percentage: totalWords > 0 ? (count / totalWords) * 100 : 0,
      }));

    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const avgWordLength = filtered.length > 0
      ? filtered.reduce((s, w) => s + w.length, 0) / filtered.length
      : 0;

    return {
      words: sorted,
      totalWords,
      uniqueWords: Object.keys(freq).length,
      sentences,
      avgWordLength,
    };
  }, [text, removeStopWords, caseSensitive, minLength, topN]);

  const exportCSV = () => {
    const csv = "Word,Count,Percentage\n" +
      analysis.words.map(w => `"${w.word}",${w.count},${w.percentage.toFixed(2)}%`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "word-frequency.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Word Frequency Analyzer</CardTitle>
          <CardDescription>Analyze word frequency and distribution in any text with visual charts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Text Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Input Text</Label>
              <Button variant="ghost" size="sm" onClick={() => setText(SAMPLE_TEXT)}>
                <RefreshCw className="h-3 w-3 mr-1" /> Sample
              </Button>
            </div>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[150px]"
              placeholder="Paste or type your text here..."
            />
          </div>

          {/* Options */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Switch id="stopWords" checked={removeStopWords} onCheckedChange={setRemoveStopWords} />
              <Label htmlFor="stopWords" className="cursor-pointer">Remove stop words</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="caseSensitive" checked={caseSensitive} onCheckedChange={setCaseSensitive} />
              <Label htmlFor="caseSensitive" className="cursor-pointer">Case sensitive</Label>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="minLength" className="whitespace-nowrap">Min length:</Label>
              <Input
                id="minLength"
                type="number" min="1" max="10" value={minLength}
                onChange={(e) => setMinLength(Number(e.target.value))}
                className="w-16 text-center"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="topN" className="whitespace-nowrap">Show top:</Label>
              <Input
                id="topN"
                type="number" min="5" max="100" value={topN}
                onChange={(e) => setTopN(Number(e.target.value))}
                className="w-16 text-center"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Words", value: analysis.totalWords.toLocaleString() },
              { label: "Unique Words", value: analysis.uniqueWords.toLocaleString() },
              { label: "Sentences", value: analysis.sentences.toLocaleString() },
              { label: "Avg Word Length", value: `${analysis.avgWordLength.toFixed(1)} chars` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-muted rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-primary">{value}</div>
                <div className="text-xs text-muted-foreground mt-1">{label}</div>
              </div>
            ))}
          </div>

          {/* Chart */}
          {analysis.words.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Frequency Chart (Top {Math.min(15, analysis.words.length)})</Label>
                <Button variant="outline" size="sm" onClick={exportCSV}>
                  <Download className="h-3 w-3 mr-1" /> Export CSV
                </Button>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analysis.words.slice(0, 15)} margin={{ top: 5, right: 5, bottom: 40, left: 10 }}>
                    <XAxis
                      dataKey="word"
                      angle={-45}
                      textAnchor="end"
                      tick={{ fontSize: 11 }}
                      interval={0}
                    />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(value: number, _name: string, props: { payload?: WordCount }) => [
                        `${value} (${props.payload?.percentage.toFixed(1)}%)`,
                        "Count"
                      ]}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {analysis.words.slice(0, 15).map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Word List */}
          {analysis.words.length > 0 && (
            <div className="space-y-2">
              <Label className="text-base font-semibold">Word List</Label>
              <div className="max-h-64 overflow-y-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-muted">
                    <tr>
                      <th className="text-left p-2 font-medium">#</th>
                      <th className="text-left p-2 font-medium">Word</th>
                      <th className="text-right p-2 font-medium">Count</th>
                      <th className="text-right p-2 font-medium">Frequency</th>
                      <th className="p-2">Bar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.words.map((item, i) => (
                      <tr key={item.word} className="border-t hover:bg-muted/50">
                        <td className="p-2 text-muted-foreground">{i + 1}</td>
                        <td className="p-2 font-mono font-medium">{item.word}</td>
                        <td className="p-2 text-right">{item.count}</td>
                        <td className="p-2 text-right text-muted-foreground">{item.percentage.toFixed(1)}%</td>
                        <td className="p-2 w-24">
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${(item.count / (analysis.words[0]?.count || 1)) * 100}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
