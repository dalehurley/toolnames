import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Check,
  Copy,
  RefreshCw,
  Lock,
  Shield,
  ExternalLink,
} from "lucide-react";

type HashAlgorithm = "sha1" | "sha256" | "sha384" | "sha512";

interface HashGeneratorProps {
  initialAlgorithm?: string;
}

const algorithmDetails: Record<
  HashAlgorithm,
  {
    title: string;
    description: string;
    cardTitle: string;
  }
> = {
  sha1: {
    title: "SHA-1",
    description: "160-bit hash, no longer considered secure (Use with caution)",
    cardTitle: "SHA-1 Hash Generator",
  },
  sha256: {
    title: "SHA-256",
    description: "256-bit hash from SHA-2 family, widely used (Recommended)",
    cardTitle: "SHA-256 Hash Generator",
  },
  sha384: {
    title: "SHA-384",
    description:
      "384-bit hash from SHA-2 family, stronger than SHA-256 (Recommended)",
    cardTitle: "SHA-384 Hash Generator",
  },
  sha512: {
    title: "SHA-512",
    description:
      "512-bit hash from SHA-2 family, most secure (Recommended for high security)",
    cardTitle: "SHA-512 Hash Generator",
  },
};

const isValidAlgorithm = (alg?: string): alg is HashAlgorithm => {
  return !!alg && ["sha1", "sha256", "sha384", "sha512"].includes(alg);
};

export const HashGenerator = ({ initialAlgorithm }: HashGeneratorProps) => {
  // Set the default algorithm value only once at component initialization
  const defaultAlgo = isValidAlgorithm(initialAlgorithm)
    ? initialAlgorithm
    : "sha256";

  const [input, setInput] = useState<string>("");
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>(defaultAlgo);
  const [hashOutput, setHashOutput] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // When initialAlgorithm changes (from URL changes), update the algorithm
  useEffect(() => {
    if (isValidAlgorithm(initialAlgorithm)) {
      setAlgorithm(initialAlgorithm);
    }
  }, [initialAlgorithm]);

  // Generate hash when input or algorithm changes
  useEffect(() => {
    if (input) {
      generateHash();
    } else {
      setHashOutput("");
    }
  }, [input, algorithm]);

  const generateHash = async () => {
    if (!input) {
      setHashOutput("");
      return;
    }

    setIsGenerating(true);

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(input);

      let digest: ArrayBuffer;

      // Different algorithms
      switch (algorithm) {
        case "sha1":
          digest = await crypto.subtle.digest("SHA-1", data);
          break;

        case "sha256":
          digest = await crypto.subtle.digest("SHA-256", data);
          break;

        case "sha384":
          digest = await crypto.subtle.digest("SHA-384", data);
          break;

        case "sha512":
          digest = await crypto.subtle.digest("SHA-512", data);
          break;

        default:
          digest = await crypto.subtle.digest("SHA-256", data);
      }

      // Convert to hex string
      const hashArray = Array.from(new Uint8Array(digest));
      const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      setHashOutput(hashHex);
    } catch (error) {
      console.error("Error generating hash:", error);
      setHashOutput("Error generating hash");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!hashOutput) return;

    navigator.clipboard.writeText(hashOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setInput("");
    setHashOutput("");
    setCopied(false);
  };

  // Get the current algorithm details
  const currentAlgorithmDetails = algorithmDetails[algorithm];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">
          {currentAlgorithmDetails.cardTitle || "Hash Generator"}
        </CardTitle>
        <CardDescription>
          {algorithm === "sha1"
            ? "Generate SHA-1 hashes from text (Note: SHA-1 is no longer considered secure)"
            : `Generate secure ${currentAlgorithmDetails.title} cryptographic hashes from text`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="input">Input Text</Label>
          <Textarea
            id="input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter text to hash"
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label>Hash Algorithm</Label>
          <Tabs
            value={algorithm}
            defaultValue={algorithm}
            onValueChange={(value) => setAlgorithm(value as HashAlgorithm)}
            className="w-full"
          >
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="sha1">SHA-1</TabsTrigger>
              <TabsTrigger value="sha256">SHA-256</TabsTrigger>
              <TabsTrigger value="sha384">SHA-384</TabsTrigger>
              <TabsTrigger value="sha512">SHA-512</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="hashOutput">Hash Output</Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                disabled={!hashOutput}
              >
                {copied ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAll}
                disabled={!input}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
          <div className="relative">
            <Textarea
              id="hashOutput"
              value={hashOutput}
              readOnly
              placeholder="Hash will appear here"
              className="font-mono text-sm min-h-[80px]"
            />
            {isGenerating && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <div className="text-sm text-muted-foreground">
                  Generating...
                </div>
              </div>
            )}
          </div>
        </div>

        {copied && (
          <div className="bg-green-100 text-green-800 p-2 rounded-md text-sm">
            Hash copied to clipboard!
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Hash Algorithms</h3>
            </div>
            <ul className="text-sm space-y-1 list-disc pl-4 text-muted-foreground">
              <li>
                <strong>SHA-1:</strong> 160-bit hash, no longer considered
                secure
                <span className="text-yellow-500 ml-1">(Use with caution)</span>
              </li>
              <li>
                <strong>SHA-256:</strong> 256-bit hash from SHA-2 family, widely
                used
                <span className="text-green-500 ml-1">(Recommended)</span>
              </li>
              <li>
                <strong>SHA-384:</strong> 384-bit hash from SHA-2 family,
                stronger than SHA-256
                <span className="text-green-500 ml-1">(Recommended)</span>
              </li>
              <li>
                <strong>SHA-512:</strong> 512-bit hash from SHA-2 family, most
                secure
                <span className="text-green-500 ml-1">
                  (Recommended for high security)
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Common Uses</h3>
            </div>
            <ul className="text-sm space-y-1 list-disc pl-4 text-muted-foreground">
              <li>File integrity verification</li>
              <li>Password storage (with proper salting)</li>
              <li>Digital signatures and certificates</li>
              <li>Data integrity in blockchain technology</li>
              <li>Checksum verification for downloads</li>
            </ul>
            <p className="text-xs mt-2 text-muted-foreground">
              Note: Hashing is one-way encryption. Once data is hashed, it
              cannot be unhashed. The same input will always produce the same
              hash output.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="w-full">
          <h3 className="text-sm font-medium mb-2">
            Direct Links to Specific Hash Algorithms:
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <a
              href="/generators/hash-generator/sha1"
              className="text-xs flex items-center p-2 border rounded-md hover:bg-muted"
            >
              SHA-1 Hash Generator <ExternalLink className="ml-1 h-3 w-3" />
            </a>
            <a
              href="/generators/hash-generator/sha256"
              className="text-xs flex items-center p-2 border rounded-md hover:bg-muted"
            >
              SHA-256 Hash Generator <ExternalLink className="ml-1 h-3 w-3" />
            </a>
            <a
              href="/generators/hash-generator/sha384"
              className="text-xs flex items-center p-2 border rounded-md hover:bg-muted"
            >
              SHA-384 Hash Generator <ExternalLink className="ml-1 h-3 w-3" />
            </a>
            <a
              href="/generators/hash-generator/sha512"
              className="text-xs flex items-center p-2 border rounded-md hover:bg-muted"
            >
              SHA-512 Hash Generator <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};
