import { useState } from "react";
import { v1 as uuidv1, v4 as uuidv4, v3 as uuidv3, v5 as uuidv5 } from "uuid";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Copy,
  RefreshCw,
  Check,
  Download,
  Info,
  Fingerprint,
} from "lucide-react";

type UuidVersion = "v1" | "v4" | "v3" | "v5";

interface UuidOptions {
  version: UuidVersion;
  count: number;
  namespace?: string;
  name?: string;
}

export const UuidGenerator = () => {
  const [options, setOptions] = useState<UuidOptions>({
    version: "v4",
    count: 1,
    namespace: "",
    name: "",
  });
  const [generatedUuids, setGeneratedUuids] = useState<string[]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("options");
  const [error, setError] = useState<string | null>(null);

  // Example namespaces for v3 and v5
  const PREDEFINED_NAMESPACES = {
    DNS: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    URL: "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
    OID: "6ba7b812-9dad-11d1-80b4-00c04fd430c8",
    X500: "6ba7b814-9dad-11d1-80b4-00c04fd430c8",
  };

  const handleGenerateUuid = () => {
    setError(null);

    try {
      const uuids: string[] = [];

      // Validate namespace for v3/v5
      if (
        (options.version === "v3" || options.version === "v5") &&
        (!options.namespace || !isValidUuid(options.namespace))
      ) {
        setError("Please provide a valid namespace UUID for v3/v5");
        return;
      }

      // Validate name for v3/v5
      if (
        (options.version === "v3" || options.version === "v5") &&
        !options.name
      ) {
        setError("Please provide a name string for v3/v5");
        return;
      }

      // Generate UUIDs
      for (let i = 0; i < options.count; i++) {
        let uuid: string;

        switch (options.version) {
          case "v1":
            uuid = uuidv1();
            break;
          case "v4":
            uuid = uuidv4();
            break;
          case "v3":
            uuid = uuidv3(options.name!, options.namespace!);
            break;
          case "v5":
            uuid = uuidv5(options.name!, options.namespace!);
            break;
          default:
            uuid = uuidv4();
        }

        uuids.push(uuid);
      }

      setGeneratedUuids(uuids);
      setActiveTab("results");
    } catch (err) {
      setError(
        `Error generating UUID: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }
  };

  const isValidUuid = (uuid: string): boolean => {
    const regex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return regex.test(uuid);
  };

  const copyToClipboard = () => {
    if (generatedUuids.length === 0) return;

    navigator.clipboard.writeText(generatedUuids.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setGeneratedUuids([]);
    setCopied(false);
    setOptions({
      ...options,
      name: "",
    });
  };

  // Handle namespace selection
  const handleNamespaceSelect = (value: string) => {
    if (value === "custom") {
      setOptions({ ...options, namespace: "" });
    } else {
      setOptions({
        ...options,
        namespace:
          PREDEFINED_NAMESPACES[value as keyof typeof PREDEFINED_NAMESPACES],
      });
    }
  };

  const downloadUuids = () => {
    if (generatedUuids.length === 0) return;

    const blob = new Blob([generatedUuids.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `uuids-${options.version}-${new Date()
      .toISOString()
      .slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Fingerprint className="h-6 w-6 text-primary" />
          <div>
            <CardTitle className="text-2xl">UUID Generator</CardTitle>
            <CardDescription>
              Generate unique identifiers in various UUID formats
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="options">Options</TabsTrigger>
            <TabsTrigger value="results" disabled={generatedUuids.length === 0}>
              Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="options" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="version">UUID Version</Label>
                  <Select
                    value={options.version}
                    onValueChange={(value) =>
                      setOptions({ ...options, version: value as UuidVersion })
                    }
                  >
                    <SelectTrigger id="version">
                      <SelectValue placeholder="Select UUID version" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="v4">Version 4 (Random)</SelectItem>
                      <SelectItem value="v1">Version 1 (Timestamp)</SelectItem>
                      <SelectItem value="v5">
                        Version 5 (SHA-1 Name-Based)
                      </SelectItem>
                      <SelectItem value="v3">
                        Version 3 (MD5 Name-Based)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="count">Number of UUIDs</Label>
                  <Input
                    id="count"
                    type="number"
                    min={1}
                    max={100}
                    value={options.count}
                    onChange={(e) =>
                      setOptions({
                        ...options,
                        count: Math.min(
                          100,
                          Math.max(1, parseInt(e.target.value) || 1)
                        ),
                      })
                    }
                  />
                </div>

                {(options.version === "v3" || options.version === "v5") && (
                  <>
                    <div>
                      <Label htmlFor="namespace-select">Namespace</Label>
                      <Select onValueChange={handleNamespaceSelect}>
                        <SelectTrigger id="namespace-select">
                          <SelectValue placeholder="Select namespace" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DNS">DNS Namespace</SelectItem>
                          <SelectItem value="URL">URL Namespace</SelectItem>
                          <SelectItem value="OID">OID Namespace</SelectItem>
                          <SelectItem value="X500">X500 Namespace</SelectItem>
                          <SelectItem value="custom">
                            Custom Namespace
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {(!options.namespace || options.namespace === "") && (
                      <div>
                        <Label htmlFor="namespace">Custom Namespace UUID</Label>
                        <Input
                          id="namespace"
                          value={options.namespace}
                          onChange={(e) =>
                            setOptions({
                              ...options,
                              namespace: e.target.value,
                            })
                          }
                          placeholder="Enter a valid UUID for the namespace"
                        />
                      </div>
                    )}

                    <div>
                      <Label htmlFor="name">Name string</Label>
                      <Input
                        id="name"
                        value={options.name}
                        onChange={(e) =>
                          setOptions({ ...options, name: e.target.value })
                        }
                        placeholder="Enter name to hash"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium mb-2">About UUID Versions</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div>
                    <p className="font-medium">Version 4 (Random)</p>
                    <p>
                      Generates UUIDs using random numbers. Most common and
                      universally applicable.
                    </p>
                  </div>

                  <div>
                    <p className="font-medium">Version 1 (Timestamp)</p>
                    <p>
                      Generates UUIDs based on timestamp and MAC address. Good
                      for sequential IDs.
                    </p>
                  </div>

                  <div>
                    <p className="font-medium">Version 5 (SHA-1)</p>
                    <p>
                      Generates UUIDs by hashing a namespace and name with
                      SHA-1. Good for deterministic IDs.
                    </p>
                  </div>

                  <div>
                    <p className="font-medium">Version 3 (MD5)</p>
                    <p>
                      Like v5, but uses MD5 hashing. SHA-1 (v5) is preferred
                      over MD5 for security.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Button onClick={handleGenerateUuid}>Generate UUID</Button>

            {error && (
              <div className="bg-red-100 text-red-800 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
          </TabsContent>

          <TabsContent value="results" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-medium">
                  Generated {generatedUuids.length} UUID
                  {generatedUuids.length !== 1 ? "s" : ""}
                </span>
                <span className="ml-2 text-sm text-muted-foreground">
                  (Version {options.version})
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  {copied ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  {copied ? "Copied!" : "Copy All"}
                </Button>
                <Button variant="outline" size="sm" onClick={downloadUuids}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("options")}
                >
                  Back to Options
                </Button>
              </div>
            </div>

            {copied && (
              <div className="bg-green-100 text-green-800 p-2 rounded-md text-sm">
                UUIDs copied to clipboard!
              </div>
            )}

            <Textarea
              value={generatedUuids.join("\n")}
              readOnly
              className="font-mono text-sm min-h-[200px]"
            />

            <div className="flex gap-2">
              <Button onClick={handleGenerateUuid}>Generate Again</Button>
              <Button variant="outline" onClick={clearAll}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>

            <div className="bg-muted p-4 rounded-lg flex gap-2">
              <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="mb-1">
                  <strong>UUID (Universally Unique Identifier)</strong> is a
                  128-bit label used for information in computer systems. The
                  probability of a UUID collision is negligible with proper
                  implementation.
                </p>
                <p>
                  UUIDs are typically represented as 32 hexadecimal digits,
                  displayed in 5 groups separated by hyphens: 8-4-4-4-12.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
