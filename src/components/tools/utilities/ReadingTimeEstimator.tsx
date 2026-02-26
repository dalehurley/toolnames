import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { RefreshCw, Clock, BookOpen, Eye, FileText } from "lucide-react";

const SAMPLE_TEXT = `The art of reading is one of the most valuable skills a person can develop. Whether you're reading for pleasure, education, or professional development, the ability to absorb and process written information efficiently is crucial in today's information-rich world.

Speed reading techniques have been popularized by various educators and productivity experts. The Evelyn Wood Reading Dynamics program, developed in the late 1950s, claimed to help people read at rates of thousands of words per minute. However, research has shown that extremely high reading speeds come at the cost of comprehension.

The average adult reads approximately 200-300 words per minute for non-fiction material. For technical content, this often drops to 50-100 words per minute. Fiction, being more engaging, can be read at 250-400 words per minute by most adults. Academic readers, trained in their specific fields, can often skim through familiar material much faster.

The relationship between reading speed and comprehension is complex. Some people naturally read faster while maintaining high comprehension rates. Others benefit from specific techniques like meta guiding (using a finger or pointer to guide the eyes), reducing subvocalization (the internal speech some readers experience while reading), and minimizing regression (re-reading words or passages).`;

const READING_PROFILES = [
  { name: "Slow Reader", wpm: 150, icon: "🐢" },
  { name: "Average Reader", wpm: 250, icon: "📖" },
  { name: "Fast Reader", wpm: 400, icon: "🚀" },
  { name: "Speed Reader", wpm: 700, icon: "⚡" },
];

const CONTENT_TYPES = [
  { name: "Fiction / Novel", multiplier: 1.0 },
  { name: "News Article", multiplier: 1.1 },
  { name: "Blog Post", multiplier: 1.0 },
  { name: "Technical Docs", multiplier: 0.5 },
  { name: "Academic Paper", multiplier: 0.4 },
  { name: "Legal Text", multiplier: 0.3 },
];

function formatTime(minutes: number): string {
  if (minutes < 1) return `${Math.round(minutes * 60)} seconds`;
  if (minutes < 60) {
    const mins = Math.floor(minutes);
    const secs = Math.round((minutes - mins) * 60);
    if (secs === 0) return `${mins} min${mins !== 1 ? "s" : ""}`;
    return `${mins} min${mins !== 1 ? "s" : ""} ${secs}s`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (mins === 0) return `${hours} hour${hours !== 1 ? "s" : ""}`;
  return `${hours}h ${mins}min`;
}

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!word) return 0;
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
  word = word.replace(/^y/, "");
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

export const ReadingTimeEstimator = () => {
  const [text, setText] = useState(SAMPLE_TEXT);
  const [customWpm, setCustomWpm] = useState(250);
  const [contentType, setContentType] = useState(CONTENT_TYPES[0]);

  const stats = useMemo(() => {
    if (!text.trim()) return null;

    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    const charCount = text.length;
    const charNoSpaces = text.replace(/\s/g, "").length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;

    const syllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
    const avgSyllablesPerWord = syllables / wordCount;
    const avgWordsPerSentence = wordCount / sentences;

    // Flesch-Kincaid Reading Ease
    const fleschEase = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;
    const clampedFlesch = Math.max(0, Math.min(100, fleschEase));

    // Flesch-Kincaid Grade Level
    const gradeLevel = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;

    const adjustedWpm = customWpm * contentType.multiplier;
    const readingTimeMin = wordCount / adjustedWpm;

    return {
      wordCount, charCount, charNoSpaces, sentences, paragraphs,
      syllables, avgSyllablesPerWord, avgWordsPerSentence,
      fleschEase: clampedFlesch, gradeLevel: Math.max(1, gradeLevel),
      readingTimeMin,
    };
  }, [text, customWpm, contentType]);

  const getReadingLevel = (score: number) => {
    if (score >= 90) return { label: "Very Easy", color: "text-green-600" };
    if (score >= 70) return { label: "Easy", color: "text-green-500" };
    if (score >= 60) return { label: "Standard", color: "text-blue-600" };
    if (score >= 50) return { label: "Fairly Difficult", color: "text-yellow-600" };
    if (score >= 30) return { label: "Difficult", color: "text-orange-600" };
    return { label: "Very Difficult", color: "text-red-600" };
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Reading Time Estimator</CardTitle>
          <CardDescription>Analyze text complexity, estimate reading time, and get readability scores</CardDescription>
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
              className="min-h-[200px]"
              placeholder="Paste your text here to estimate reading time and get readability statistics..."
            />
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Your Reading Speed (WPM)</Label>
              <div className="flex items-center gap-3">
                <input
                  type="range" min="50" max="1000" value={customWpm}
                  onChange={(e) => setCustomWpm(Number(e.target.value))}
                  className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                />
                <Input
                  type="number" min="50" max="1000" value={customWpm}
                  onChange={(e) => setCustomWpm(Number(e.target.value))}
                  className="w-20 text-center"
                />
              </div>
              <div className="flex flex-wrap gap-1">
                {READING_PROFILES.map(p => (
                  <Button
                    key={p.name}
                    variant={customWpm === p.wpm ? "default" : "outline"}
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => setCustomWpm(p.wpm)}
                  >
                    {p.icon} {p.wpm}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Content Type</Label>
              <div className="grid grid-cols-2 gap-1">
                {CONTENT_TYPES.map(ct => (
                  <Button
                    key={ct.name}
                    variant={contentType.name === ct.name ? "default" : "outline"}
                    size="sm"
                    className="text-xs h-8 justify-start"
                    onClick={() => setContentType(ct)}
                  >
                    {ct.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {stats && (
            <>
              {/* Reading Time */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-primary">Estimated Reading Time</span>
                </div>
                <div className="text-5xl font-bold text-primary mb-2">
                  {formatTime(stats.readingTimeMin)}
                </div>
                <p className="text-sm text-muted-foreground">
                  at {Math.round(customWpm * contentType.multiplier)} WPM ({customWpm} WPM × {contentType.multiplier}× for {contentType.name})
                </p>
              </div>

              {/* Text Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "Words", value: stats.wordCount.toLocaleString(), icon: FileText },
                  { label: "Characters", value: stats.charCount.toLocaleString(), icon: FileText },
                  { label: "Sentences", value: stats.sentences.toLocaleString(), icon: BookOpen },
                  { label: "Paragraphs", value: stats.paragraphs.toLocaleString(), icon: FileText },
                  { label: "Avg Sentence Length", value: `${stats.avgWordsPerSentence.toFixed(1)} words`, icon: Eye },
                  { label: "Chars (no spaces)", value: stats.charNoSpaces.toLocaleString(), icon: FileText },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="bg-muted rounded-lg p-3">
                    <div className="flex items-center gap-1 text-muted-foreground text-xs mb-1">
                      <Icon className="h-3 w-3" /> {label}
                    </div>
                    <div className="text-xl font-bold">{value}</div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Readability Scores */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Readability Analysis</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Flesch Reading Ease */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Flesch Reading Ease</span>
                      <span className={`text-sm font-bold ${getReadingLevel(stats.fleschEase).color}`}>
                        {stats.fleschEase.toFixed(1)} — {getReadingLevel(stats.fleschEase).label}
                      </span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all"
                        style={{ width: `${stats.fleschEase}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">0 = Very hard, 100 = Very easy</p>
                  </div>

                  {/* Grade Level */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Flesch-Kincaid Grade</span>
                      <span className="text-sm font-bold">Grade {stats.gradeLevel.toFixed(1)}</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all"
                        style={{ width: `${Math.min(100, (stats.gradeLevel / 20) * 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Equivalent to {stats.gradeLevel < 6 ? "Elementary" : stats.gradeLevel < 9 ? "Middle School" : stats.gradeLevel < 13 ? "High School" : "College"} level
                    </p>
                  </div>
                </div>
              </div>

              {/* Reading time by profile */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">Reading Time by Profile</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {READING_PROFILES.map(p => (
                    <div key={p.name} className={`rounded-lg p-3 text-center border ${customWpm === p.wpm ? "border-primary bg-primary/5" : "border-transparent bg-muted/50"}`}>
                      <div className="text-xl">{p.icon}</div>
                      <div className="text-xs text-muted-foreground">{p.name}</div>
                      <div className="font-bold text-sm mt-1">
                        {formatTime(stats.wordCount / (p.wpm * contentType.multiplier))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
