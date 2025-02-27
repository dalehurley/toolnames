import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Copy, RefreshCw, FileText } from "lucide-react";

// Sample Lorem Ipsum text to start with
const LOREM_IPSUM_START =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ";

// Sample words for generating random text
const LOREM_WORDS = [
  "lorem",
  "ipsum",
  "dolor",
  "sit",
  "amet",
  "consectetur",
  "adipiscing",
  "elit",
  "sed",
  "do",
  "eiusmod",
  "tempor",
  "incididunt",
  "ut",
  "labore",
  "et",
  "dolore",
  "magna",
  "aliqua",
  "enim",
  "ad",
  "minim",
  "veniam",
  "quis",
  "nostrud",
  "exercitation",
  "ullamco",
  "laboris",
  "nisi",
  "ut",
  "aliquip",
  "ex",
  "ea",
  "commodo",
  "consequat",
  "duis",
  "aute",
  "irure",
  "dolor",
  "in",
  "reprehenderit",
  "voluptate",
  "velit",
  "esse",
  "cillum",
  "dolore",
  "eu",
  "fugiat",
  "nulla",
  "pariatur",
  "excepteur",
  "sint",
  "occaecat",
  "cupidatat",
  "non",
  "proident",
  "sunt",
  "in",
  "culpa",
  "qui",
  "officia",
  "deserunt",
  "mollit",
  "anim",
  "id",
  "est",
  "laborum",
];

export const LoremIpsumGenerator = () => {
  const [generationType, setGenerationType] = useState<
    "paragraphs" | "words" | "sentences"
  >("paragraphs");
  const [amount, setAmount] = useState<number>(3);
  const [startWithLorem, setStartWithLorem] = useState<boolean>(true);
  const [result, setResult] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  // Helper function to capitalize the first letter of a string
  const capitalize = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Helper function to end a sentence with period
  const endWithPeriod = (str: string): string => {
    return str.endsWith(".") ? str : str + ".";
  };

  // Generate a random word from the lorem ipsum list
  const getRandomWord = (): string => {
    return LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];
  };

  // Generate a random sentence
  const generateSentence = (startLorem: boolean = false): string => {
    const sentenceLength = Math.floor(Math.random() * 10) + 5; // 5-15 words
    let sentence = "";

    if (startLorem && startWithLorem) {
      sentence = LOREM_IPSUM_START;
    } else {
      // Start with a random word, capitalize it
      sentence = capitalize(getRandomWord());

      // Add random words
      for (let i = 1; i < sentenceLength; i++) {
        sentence += " " + getRandomWord();
      }

      // End with period
      sentence = endWithPeriod(sentence);
    }

    return sentence;
  };

  // Generate a paragraph
  const generateParagraph = (startLorem: boolean = false): string => {
    const sentenceCount = Math.floor(Math.random() * 3) + 3; // 3-6 sentences
    let paragraph = "";

    for (let i = 0; i < sentenceCount; i++) {
      // Only the first sentence in the first paragraph should potentially start with Lorem
      paragraph += generateSentence(i === 0 && startLorem) + " ";
    }

    return paragraph.trim();
  };

  // Main generation function
  const generateLoremIpsum = () => {
    let text = "";

    switch (generationType) {
      case "paragraphs":
        for (let i = 0; i < amount; i++) {
          // Only the first paragraph should potentially start with Lorem
          text += generateParagraph(i === 0) + "\n\n";
        }
        break;
      case "sentences":
        for (let i = 0; i < amount; i++) {
          // Only the first sentence should potentially start with Lorem
          text += generateSentence(i === 0) + " ";
        }
        break;
      case "words":
        // If starting with Lorem and enough words requested
        if (startWithLorem && amount >= 2) {
          text = "Lorem ipsum";
          for (let i = 2; i < amount; i++) {
            text += " " + getRandomWord();
          }
        } else {
          // Generate random words
          for (let i = 0; i < amount; i++) {
            if (i === 0) {
              text += capitalize(getRandomWord());
            } else {
              text += " " + getRandomWord();
            }
          }
        }
        // End with a period if it's at least a few words
        if (amount >= 3) {
          text = endWithPeriod(text);
        }
        break;
    }

    setResult(text.trim());
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculate max amount based on generation type
  const getMaxAmount = (): number => {
    switch (generationType) {
      case "paragraphs":
        return 10;
      case "sentences":
        return 20;
      case "words":
        return 100;
      default:
        return 10;
    }
  };

  // Get label for amount slider
  const getAmountLabel = (): string => {
    return `${amount} ${generationType}`;
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Lorem Ipsum Generator</CardTitle>
        <CardDescription>
          Generate placeholder text for design mockups and layouts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs
          value={generationType}
          onValueChange={(value) =>
            setGenerationType(value as "paragraphs" | "words" | "sentences")
          }
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="paragraphs">Paragraphs</TabsTrigger>
            <TabsTrigger value="sentences">Sentences</TabsTrigger>
            <TabsTrigger value="words">Words</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="amount">{getAmountLabel()}</Label>
              <span className="text-sm text-muted-foreground">{amount}</span>
            </div>
            <Slider
              id="amount"
              min={1}
              max={getMaxAmount()}
              step={1}
              value={[amount]}
              onValueChange={(values) => setAmount(values[0])}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="startWithLorem"
              checked={startWithLorem}
              onChange={(e) => setStartWithLorem(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="startWithLorem">Start with "Lorem ipsum"</Label>
          </div>

          <div className="flex justify-center space-x-4 pt-2">
            <Button onClick={generateLoremIpsum}>Generate Text</Button>
            <Button
              variant="outline"
              onClick={() => setResult("")}
              disabled={!result}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>

        {result && (
          <div className="space-y-2 pt-4">
            <div className="flex justify-between items-center">
              <Label htmlFor="result">Generated Text</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                disabled={!result}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
            <Textarea
              id="result"
              value={result}
              readOnly
              className="min-h-[200px] font-serif"
            />
            {copied && (
              <div className="bg-green-100 text-green-800 p-2 rounded-md text-sm">
                Text copied to clipboard!
              </div>
            )}
          </div>
        )}

        <div className="bg-muted p-4 rounded-lg mt-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h3 className="font-medium">About Lorem Ipsum</h3>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Lorem Ipsum is placeholder text commonly used in the graphic, print,
            and publishing industries for previewing layouts and visual mockups.
            It has roots in a piece of classical Latin literature from 45 BC,
            making it over 2000 years old.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
