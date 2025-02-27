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
import { Copy, RefreshCw, Check, FileText } from "lucide-react";

interface TextStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  readingTime: number;
}

export const CharacterCounter = () => {
  const [text, setText] = useState<string>("");
  const [stats, setStats] = useState<TextStats>({
    characters: 0,
    charactersNoSpaces: 0,
    words: 0,
    sentences: 0,
    paragraphs: 0,
    readingTime: 0,
  });
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    const calculateStats = () => {
      // Characters
      const characters = text.length;
      const charactersNoSpaces = text.replace(/\s/g, "").length;

      // Words
      const words = text ? text.trim().split(/\s+/).filter(Boolean).length : 0;

      // Sentences
      // Match sentences that end with ., !, ? followed by a space or end of line
      const sentences = text
        ? text.split(/[.!?]+(?:\s|\n|$)/).filter(Boolean).length
        : 0;

      // Paragraphs
      const paragraphs = text
        ? text
            .split("\n")
            .map((p) => p.trim())
            .filter(Boolean).length
        : 0;

      // Reading time (average reading speed is ~200-250 words per minute)
      const readingTime = words > 0 ? Math.max(1, Math.ceil(words / 225)) : 0;

      setStats({
        characters,
        charactersNoSpaces,
        words,
        sentences,
        paragraphs,
        readingTime,
      });
    };

    calculateStats();
  }, [text]);

  const copyStats = () => {
    const statsText = `
Characters: ${stats.characters}
Characters (without spaces): ${stats.charactersNoSpaces}
Words: ${stats.words}
Sentences: ${stats.sentences}
Paragraphs: ${stats.paragraphs}
Estimated reading time: ${stats.readingTime} minute${
      stats.readingTime !== 1 ? "s" : ""
    }
    `.trim();

    navigator.clipboard.writeText(statsText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearText = () => {
    setText("");
  };

  const demoTexts = [
    {
      name: "Short paragraph",
      text: "The quick brown fox jumps over the lazy dog. This sentence contains all the letters in the English alphabet. It's commonly used for font testing!",
    },
    {
      name: "Lorem ipsum",
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    },
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          <div>
            <CardTitle className="text-2xl">Character Counter</CardTitle>
            <CardDescription>
              Count characters, words, sentences, and paragraphs in your text
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-2">
          {demoTexts.map((demo, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => setText(demo.text)}
            >
              {demo.name}
            </Button>
          ))}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="text-sm text-muted-foreground">
              Type or paste your text below
            </div>
            <div className="text-sm text-muted-foreground">
              {stats.characters} characters
            </div>
          </div>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to analyze..."
            className="min-h-[200px] font-mono text-sm"
          />
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div
              className="bg-primary h-1 rounded-full"
              style={{
                width: `${Math.min(100, (stats.characters / 5000) * 100)}%`,
              }}
            ></div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={copyStats}>
            {copied ? (
              <Check className="h-4 w-4 mr-2" />
            ) : (
              <Copy className="h-4 w-4 mr-2" />
            )}
            {copied ? "Copied!" : "Copy Statistics"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearText}
            disabled={!text}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Clear Text
          </Button>
        </div>

        {copied && (
          <div className="bg-green-100 text-green-800 p-2 rounded-md text-sm">
            Statistics copied to clipboard!
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-2">Text Statistics</h3>
            <div className="border rounded-md overflow-hidden">
              <div className="grid grid-cols-2 border-b">
                <div className="border-r p-2 font-medium">Characters</div>
                <div className="p-2 text-right">
                  {stats.characters.toLocaleString()}
                </div>
              </div>
              <div className="grid grid-cols-2 border-b">
                <div className="border-r p-2 font-medium">
                  Characters (without spaces)
                </div>
                <div className="p-2 text-right">
                  {stats.charactersNoSpaces.toLocaleString()}
                </div>
              </div>
              <div className="grid grid-cols-2 border-b">
                <div className="border-r p-2 font-medium">Words</div>
                <div className="p-2 text-right">
                  {stats.words.toLocaleString()}
                </div>
              </div>
              <div className="grid grid-cols-2 border-b">
                <div className="border-r p-2 font-medium">Sentences</div>
                <div className="p-2 text-right">
                  {stats.sentences.toLocaleString()}
                </div>
              </div>
              <div className="grid grid-cols-2 border-b">
                <div className="border-r p-2 font-medium">Paragraphs</div>
                <div className="p-2 text-right">
                  {stats.paragraphs.toLocaleString()}
                </div>
              </div>
              <div className="grid grid-cols-2">
                <div className="border-r p-2 font-medium">Reading Time</div>
                <div className="p-2 text-right">
                  {stats.readingTime} minute{stats.readingTime !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-medium mb-2">About This Tool</h3>
            <ul className="text-sm space-y-2 list-disc pl-4 text-muted-foreground">
              <li>
                <strong>Characters</strong> includes all letters, numbers,
                punctuation and spaces
              </li>
              <li>
                <strong>Words</strong> are counted by splitting text on
                whitespace
              </li>
              <li>
                <strong>Sentences</strong> are detected by periods, exclamation
                points, and question marks
              </li>
              <li>
                <strong>Paragraphs</strong> are detected by line breaks
              </li>
              <li>
                <strong>Reading time</strong> is estimated based on an average
                reading speed of 225 words per minute
              </li>
            </ul>
            <div className="mt-4 text-sm text-muted-foreground">
              <p>
                Perfect for writers, students, and content creators who need to
                check text length for requirements or SEO purposes.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
