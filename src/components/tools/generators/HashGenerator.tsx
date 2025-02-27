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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Copy, RefreshCw, Lock, Shield } from "lucide-react";

type HashAlgorithm = "md5" | "sha1" | "sha256" | "sha512";

export const HashGenerator = () => {
  const [input, setInput] = useState<string>("");
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>("sha256");
  const [hashOutput, setHashOutput] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

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
        case "md5":
          // Note: Web Crypto API doesn't support MD5 as it's considered insecure
          // This is a simplified implementation for demonstration
          setHashOutput(
            "MD5 is not supported by the Web Crypto API as it's considered insecure"
          );
          setIsGenerating(false);
          return;

        case "sha1":
          digest = await crypto.subtle.digest("SHA-1", data);
          break;

        case "sha256":
          digest = await crypto.subtle.digest("SHA-256", data);
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

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Hash Generator</CardTitle>
        <CardDescription>
          Generate secure cryptographic hashes from text using various
          algorithms
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
            onValueChange={(value) => setAlgorithm(value as HashAlgorithm)}
            className="w-full"
          >
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="md5">MD5</TabsTrigger>
              <TabsTrigger value="sha1">SHA-1</TabsTrigger>
              <TabsTrigger value="sha256">SHA-256</TabsTrigger>
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
                <strong>MD5:</strong> Fast but insecure, 128-bit hash
                <span className="text-red-500 ml-1">
                  (Not recommended for security purposes)
                </span>
              </li>
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
    </Card>
  );
};
