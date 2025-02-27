import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Upload,
  Download,
  Copy,
  Image as ImageIcon,
  FileCode,
  RefreshCw,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const Base64ImageConverter = () => {
  // Encode (Image to Base64) state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [base64Output, setBase64Output] = useState<string>("");
  const [imageFormat, setImageFormat] = useState<string>("image/png");
  const [encodeError, setEncodeError] = useState<string | null>(null);

  // Decode (Base64 to Image) state
  const [base64Input, setBase64Input] = useState<string>("");
  const [decodedImage, setDecodedImage] = useState<string | null>(null);
  const [decodeError, setDecodeError] = useState<string | null>(null);

  // Common state
  const [activeTab, setActiveTab] = useState<"encode" | "decode">("encode");
  const [copied, setCopied] = useState<boolean>(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const encodedTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle file selection for encoding
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEncodeError(null);
    setBase64Output("");

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      // Validate file is an image
      if (!file.type.startsWith("image/")) {
        setEncodeError("Selected file is not an image");
        setPreviewUrl(null);
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Convert selected image to Base64
  const convertImageToBase64 = () => {
    if (!selectedFile) {
      setEncodeError("Please select an image first");
      return;
    }

    setEncodeError(null);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/png;base64,")
      const base64 = result.split(",")[1];
      setBase64Output(base64);
    };
    reader.onerror = () => {
      setEncodeError("Failed to read the image file");
    };
    reader.readAsDataURL(selectedFile);
  };

  // Convert Base64 input to image
  const convertBase64ToImage = () => {
    setDecodeError(null);

    if (!base64Input.trim()) {
      setDecodeError("Please enter Base64 data");
      return;
    }

    try {
      // Try to clean up the input - remove whitespace, newlines
      let cleanInput = base64Input.trim().replace(/\s/g, "");

      // Check if the input already has a data URL prefix
      if (!cleanInput.startsWith("data:image")) {
        // Try to determine if it's a valid base64 string
        try {
          atob(cleanInput); // This will throw if not valid base64
          cleanInput = `data:image/png;base64,${cleanInput}`;
        } catch (e) {
          setDecodeError("Invalid Base64 encoding");
          return;
        }
      }

      setDecodedImage(cleanInput);
    } catch (error) {
      setDecodeError("Failed to decode Base64 to image");
    }
  };

  // Copy Base64 output to clipboard
  const copyToClipboard = () => {
    if (!base64Output) return;

    navigator.clipboard.writeText(base64Output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download the Base64 as an image
  const downloadDecodedImage = () => {
    if (!decodedImage) return;

    const link = document.createElement("a");
    link.href = decodedImage;
    link.download = "decoded-image";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset encode tab
  const resetEncode = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setBase64Output("");
    setEncodeError(null);
    setCopied(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Reset decode tab
  const resetDecode = () => {
    setBase64Input("");
    setDecodedImage(null);
    setDecodeError(null);
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value as "encode" | "decode");
    setCopied(false);
  };

  // Generate data URL for copying with prefix
  const getDataUrl = () => {
    if (!base64Output || !selectedFile) return "";
    const mimeType = imageFormat || selectedFile.type || "image/png";
    return `data:${mimeType};base64,${base64Output}`;
  };

  // Copy full data URL to clipboard
  const copyDataUrl = () => {
    const dataUrl = getDataUrl();
    if (!dataUrl) return;

    navigator.clipboard.writeText(dataUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Base64 Image Converter</CardTitle>
        <CardDescription>
          Convert images to Base64 encoding or decode Base64 strings to images
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="encode">Encode Image to Base64</TabsTrigger>
            <TabsTrigger value="decode">Decode Base64 to Image</TabsTrigger>
          </TabsList>

          <TabsContent value="encode" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="imageFile">Select Image</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      id="imageFile"
                      ref={fileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                      variant="outline"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Image
                    </Button>
                  </div>
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground">
                      {selectedFile.name} (
                      {Math.round(selectedFile.size / 1024)} KB)
                    </p>
                  )}
                </div>

                {previewUrl && (
                  <div className="space-y-2">
                    <Label>Image Preview</Label>
                    <div className="border rounded-lg overflow-hidden h-48 flex items-center justify-center bg-muted">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button
                    onClick={convertImageToBase64}
                    disabled={!selectedFile}
                    className="flex-1"
                  >
                    <FileCode className="mr-2 h-4 w-4" />
                    Convert to Base64
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetEncode}
                    disabled={!selectedFile && !base64Output}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reset
                  </Button>
                </div>

                {encodeError && (
                  <Alert variant="destructive">
                    <AlertDescription>{encodeError}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-4">
                {base64Output && (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="base64Output">Base64 Output</Label>
                        <div className="space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={copyToClipboard}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Base64
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={copyDataUrl}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Data URL
                          </Button>
                        </div>
                      </div>
                      <Textarea
                        id="base64Output"
                        ref={encodedTextareaRef}
                        value={base64Output}
                        readOnly
                        className="min-h-[150px] font-mono text-xs"
                      />
                      {copied && (
                        <div className="bg-green-100 text-green-800 p-2 rounded-md text-sm">
                          Copied to clipboard!
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dataUrlPreview">
                        Data URL Preview (for HTML/CSS)
                      </Label>
                      <Input
                        id="dataUrlPreview"
                        value={getDataUrl()}
                        readOnly
                        className="font-mono text-xs"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="decode" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="base64Input">Base64 Input</Label>
                  <Textarea
                    id="base64Input"
                    value={base64Input}
                    onChange={(e) => setBase64Input(e.target.value)}
                    placeholder="Paste Base64 encoded image data here..."
                    className="min-h-[200px] font-mono text-xs"
                  />
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={convertBase64ToImage}
                    disabled={!base64Input.trim()}
                    className="flex-1"
                  >
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Convert to Image
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetDecode}
                    disabled={!base64Input && !decodedImage}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reset
                  </Button>
                </div>

                {decodeError && (
                  <Alert variant="destructive">
                    <AlertDescription>{decodeError}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-4">
                {decodedImage && (
                  <div className="space-y-2">
                    <Label>Decoded Image</Label>
                    <div className="border rounded-lg overflow-hidden h-64 flex items-center justify-center bg-muted">
                      <img
                        src={decodedImage}
                        alt="Decoded"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <Button onClick={downloadDecodedImage} className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Download Image
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <Separator />

        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-medium mb-2">About Base64 Image Encoding</h3>
          <p className="text-sm text-muted-foreground">
            Base64 encoding allows binary image data to be transmitted in text
            format. This is useful for:
          </p>
          <ul className="text-sm text-muted-foreground list-disc pl-5 mt-2 space-y-1">
            <li>
              Embedding images directly in HTML, CSS, or JSON without external
              files
            </li>
            <li>Storing images in text-based databases or formats</li>
            <li>Sending images via APIs that only accept text</li>
            <li>
              Avoiding cross-origin issues with images in web applications
            </li>
          </ul>
          <p className="text-sm text-muted-foreground mt-2">
            <strong>Note:</strong> Base64 encoding increases file size by
            approximately 33%, so it's best used for smaller images.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
