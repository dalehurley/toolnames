import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Upload, Download, Image as ImageIcon } from "lucide-react";

export const ImageConverter = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState<string>("webp");
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Reset converted image
      setConvertedUrl(null);
    }
  };

  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setOutputFormat(e.target.value);
    setConvertedUrl(null);
  };

  const convertImage = async () => {
    if (!selectedFile) return;

    setIsConverting(true);

    try {
      // Create a canvas element to convert the image
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          throw new Error("Could not get canvas context");
        }

        ctx.drawImage(img, 0, 0);

        // Convert to the selected format
        let mimeType = "image/jpeg";
        switch (outputFormat) {
          case "webp":
            mimeType = "image/webp";
            break;
          case "png":
            mimeType = "image/png";
            break;
          case "jpeg":
            mimeType = "image/jpeg";
            break;
        }

        const dataUrl = canvas.toDataURL(mimeType, 0.9);
        setConvertedUrl(dataUrl);
      };

      img.src = previewUrl as string;
    } catch (error) {
      console.error("Error converting image:", error);
    } finally {
      setIsConverting(false);
    }
  };

  const downloadImage = () => {
    if (!convertedUrl) return;

    const link = document.createElement("a");
    link.href = convertedUrl;
    link.download = `converted-image.${outputFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Image Converter</CardTitle>
        <CardDescription>
          Convert your images between different formats (JPEG, PNG, WebP)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  {selectedFile.name} ({Math.round(selectedFile.size / 1024)}{" "}
                  KB)
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="outputFormat">Output Format</Label>
              <select
                id="outputFormat"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={outputFormat}
                onChange={handleFormatChange}
              >
                <option value="webp">WebP</option>
                <option value="png">PNG</option>
                <option value="jpeg">JPEG</option>
              </select>

              <Button
                onClick={convertImage}
                className="w-full mt-4"
                disabled={!selectedFile || isConverting}
              >
                {isConverting ? "Converting..." : "Convert Image"}
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {previewUrl && (
            <div className="space-y-2">
              <Label>Original Image</Label>
              <div className="border rounded-lg overflow-hidden h-64 flex items-center justify-center bg-muted">
                <img
                  src={previewUrl}
                  alt="Original"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </div>
          )}

          {convertedUrl && (
            <div className="space-y-2">
              <Label>Converted Image</Label>
              <div className="border rounded-lg overflow-hidden h-64 flex items-center justify-center bg-muted">
                <img
                  src={convertedUrl}
                  alt="Converted"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <Button onClick={downloadImage} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download {outputFormat.toUpperCase()}
              </Button>
            </div>
          )}

          {!previewUrl && !convertedUrl && (
            <div className="col-span-2 border rounded-lg p-12 flex flex-col items-center justify-center text-center text-muted-foreground">
              <ImageIcon className="h-12 w-12 mb-4" />
              <h3 className="text-lg font-medium">No Image Selected</h3>
              <p>Upload an image to convert it to another format</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
