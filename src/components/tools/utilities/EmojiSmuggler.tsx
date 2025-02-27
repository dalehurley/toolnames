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
import { Copy, RefreshCw, Info, Check } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Variation selectors block https://unicode.org/charts/nameslist/n_FE00.html
// VS1..=VS16
const VARIATION_SELECTOR_START = 0xfe00;
const VARIATION_SELECTOR_END = 0xfe0f;

// Variation selectors supplement https://unicode.org/charts/nameslist/n_E0100.html
// VS17..=VS256
const VARIATION_SELECTOR_SUPPLEMENT_START = 0xe0100;
const VARIATION_SELECTOR_SUPPLEMENT_END = 0xe01ef;

function toVariationSelector(byte: number): string | null {
  if (byte >= 0 && byte < 16) {
    return String.fromCodePoint(VARIATION_SELECTOR_START + byte);
  } else if (byte >= 16 && byte < 256) {
    return String.fromCodePoint(
      VARIATION_SELECTOR_SUPPLEMENT_START + byte - 16
    );
  } else {
    return null;
  }
}

function fromVariationSelector(codePoint: number): number | null {
  if (
    codePoint >= VARIATION_SELECTOR_START &&
    codePoint <= VARIATION_SELECTOR_END
  ) {
    return codePoint - VARIATION_SELECTOR_START;
  } else if (
    codePoint >= VARIATION_SELECTOR_SUPPLEMENT_START &&
    codePoint <= VARIATION_SELECTOR_SUPPLEMENT_END
  ) {
    return codePoint - VARIATION_SELECTOR_SUPPLEMENT_START + 16;
  } else {
    return null;
  }
}

function encode(emoji: string, text: string): string {
  // convert the string to utf-8 bytes
  const bytes = new TextEncoder().encode(text);
  let encoded = emoji;

  for (const byte of bytes) {
    const vs = toVariationSelector(byte);
    if (vs) encoded += vs;
  }

  return encoded;
}

function decode(text: string): string {
  const decoded = [];
  const chars = Array.from(text);

  for (const char of chars) {
    const byte = fromVariationSelector(char.codePointAt(0)!);

    if (byte === null && decoded.length > 0) {
      break;
    } else if (byte === null) {
      continue;
    }

    decoded.push(byte);
  }

  const decodedArray = new Uint8Array(decoded);
  return new TextDecoder().decode(decodedArray);
}

const EMOJI_LIST = [
  "😀",
  "😂",
  "🥰",
  "😎",
  "🤔",
  "👍",
  "👎",
  "👏",
  "😅",
  "🤝",
  "🎉",
  "🎂",
  "🍕",
  "🌈",
  "🌞",
  "🌙",
  "🔥",
  "💯",
  "🚀",
  "👀",
  "💀",
  "🥹",
];

const ALPHABET_LIST = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
];

const EmojiSelector = ({
  onEmojiSelect,
  selectedEmoji,
  emojiList,
  disabled,
}: {
  onEmojiSelect: (emoji: string) => void;
  selectedEmoji: string;
  emojiList: string[];
  disabled: boolean;
}) => {
  return (
    <div className="grid grid-cols-11 gap-2 md:grid-cols-22">
      {emojiList.map((emoji) => (
        <Button
          key={emoji}
          variant={selectedEmoji === emoji ? "default" : "outline"}
          className={`h-10 w-10 p-0 text-xl ${disabled ? "opacity-50" : ""}`}
          onClick={() => !disabled && onEmojiSelect(emoji)}
          disabled={disabled}
        >
          {emoji}
        </Button>
      ))}
    </div>
  );
};

export const EmojiSmuggler = () => {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [inputText, setInputText] = useState<string>("");
  const [selectedEmoji, setSelectedEmoji] = useState<string>("😀");
  const [outputText, setOutputText] = useState<string>("");
  const [errorText, setErrorText] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  // Convert input whenever it changes
  useEffect(() => {
    try {
      if (!inputText) {
        setOutputText("");
        setErrorText("");
        return;
      }

      const isEncoding = mode === "encode";

      if (isEncoding) {
        const output = encode(selectedEmoji, inputText);
        setOutputText(output);
      } else {
        const output = decode(inputText);
        setOutputText(output);
      }

      setErrorText("");
    } catch (_) {
      setOutputText("");
      setErrorText(
        `Error ${mode === "encode" ? "encoding" : "decoding"}: Invalid input`
      );
    }
  }, [mode, selectedEmoji, inputText]);

  const handleModeToggle = (value: string) => {
    setMode(value as "encode" | "decode");
    setInputText(""); // Clear input when changing modes
    setOutputText("");
    setErrorText("");
    setCopied(false);
  };

  const handleClear = () => {
    setInputText("");
    setOutputText("");
    setErrorText("");
    setCopied(false);
  };

  const copyToClipboard = () => {
    if (!outputText) return;

    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isEncoding = mode === "encode";

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Emoji Smuggler</CardTitle>
        <CardDescription>
          Hide secret messages in emojis using invisible Unicode variation
          selectors
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs
          value={mode}
          onValueChange={handleModeToggle}
          className="w-[400px] mx-auto"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="encode">Encode</TabsTrigger>
            <TabsTrigger value="decode">Decode</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-2">
          <Label htmlFor="inputText">
            {isEncoding ? "Text to Hide" : "Emoji with Hidden Message"}
          </Label>
          <Textarea
            id="inputText"
            placeholder={
              isEncoding
                ? "Enter text to hide in an emoji"
                : "Paste an emoji with a hidden message"
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        {isEncoding && (
          <>
            <div className="space-y-2">
              <Label>Select an Emoji</Label>
              <div className="border rounded-md p-4">
                <div className="font-medium mb-2 gap">Popular Emojis</div>
                <EmojiSelector
                  onEmojiSelect={setSelectedEmoji}
                  selectedEmoji={selectedEmoji}
                  emojiList={EMOJI_LIST}
                  disabled={!isEncoding}
                />

                <div className="font-medium mt-4 mb-2">Letters</div>
                <EmojiSelector
                  onEmojiSelect={setSelectedEmoji}
                  selectedEmoji={selectedEmoji}
                  emojiList={ALPHABET_LIST}
                  disabled={!isEncoding}
                />
              </div>
            </div>
          </>
        )}

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="outputText">
              {isEncoding ? "Encoded Result" : "Decoded Message"}
            </Label>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                disabled={!outputText}
              >
                {copied ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                {copied ? "Copied!" : "Copy"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                disabled={!inputText && !outputText}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
          <Textarea
            id="outputText"
            readOnly
            placeholder={
              isEncoding
                ? "Encoded emoji will appear here"
                : "Decoded message will appear here"
            }
            value={outputText}
            className="min-h-[100px]"
          />
        </div>

        {errorText && (
          <div className="bg-red-100 text-red-800 p-2 rounded-md text-sm">
            {errorText}
          </div>
        )}

        {copied && (
          <div className="bg-green-100 text-green-800 p-2 rounded-md text-sm">
            Text copied to clipboard!
          </div>
        )}

        <div className="bg-muted p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            <h3 className="font-medium">How it Works</h3>
          </div>
          <div className="mt-2 space-y-2 text-sm text-muted-foreground">
            <p>
              The Emoji Smuggler uses invisible Unicode variation selectors to
              hide messages within emojis or letters.
            </p>
            <p>
              <strong>To encode:</strong> Enter the text you want to hide,
              select an emoji or letter, and copy the result to share with
              others.
            </p>
            <p>
              <strong>To decode:</strong> Simply paste the emoji containing the
              hidden message and the tool will extract and display the secret
              text.
            </p>
            <p>
              The hidden message is completely invisible to the naked eye,
              making this a fun way to send secret messages in plain sight!
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
