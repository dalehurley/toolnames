import { useState, useEffect, useRef } from "react";
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
import { Separator } from "@/components/ui/separator";
import { Download, QrCode } from "lucide-react";
import * as QRCode from "qrcode";

interface QROptions {
  scale: number;
  margin: number;
  color: {
    dark: string;
    light: string;
  };
  errorCorrectionLevel: "L" | "M" | "Q" | "H";
}

export const QRCodeGenerator = () => {
  const [text, setText] = useState<string>("https://toolnames.com");
  const [qrDataURL, setQrDataURL] = useState<string>("");
  const [options, setOptions] = useState<QROptions>({
    scale: 8,
    margin: 4,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
    errorCorrectionLevel: "M",
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateQRCode = async () => {
    if (!text) return;

    try {
      // Generate QR code as data URL for display
      const dataURL = await QRCode.toDataURL(text, {
        errorCorrectionLevel: options.errorCorrectionLevel,
        margin: options.margin,
        scale: options.scale,
        color: options.color,
      });
      setQrDataURL(dataURL);

      // Draw on canvas for more options
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, text, {
          errorCorrectionLevel: options.errorCorrectionLevel,
          margin: options.margin,
          scale: options.scale,
          color: options.color,
        });
      }
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  useEffect(() => {
    generateQRCode();
  }, [text, options]);

  const downloadQRCode = () => {
    const link = document.createElement("a");
    link.href = qrDataURL;
    link.download = "qrcode.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleColorChange = (type: "dark" | "light", value: string) => {
    setOptions({
      ...options,
      color: {
        ...options.color,
        [type]: value,
      },
    });
  };

  const handleErrorCorrectionChange = (value: "L" | "M" | "Q" | "H") => {
    setOptions({
      ...options,
      errorCorrectionLevel: value,
    });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">QR Code Generator</CardTitle>
        <CardDescription>
          Generate QR codes for websites, contact information, or any text
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="qrText">Text or URL</Label>
            <Input
              id="qrText"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text or URL to encode"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="darkColor">Dark Color</Label>
              <div className="flex gap-2">
                <Input
                  id="darkColor"
                  type="color"
                  value={options.color.dark}
                  onChange={(e) => handleColorChange("dark", e.target.value)}
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={options.color.dark}
                  onChange={(e) => handleColorChange("dark", e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lightColor">Light Color</Label>
              <div className="flex gap-2">
                <Input
                  id="lightColor"
                  type="color"
                  value={options.color.light}
                  onChange={(e) => handleColorChange("light", e.target.value)}
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={options.color.light}
                  onChange={(e) => handleColorChange("light", e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scale">Size</Label>
              <Input
                id="scale"
                type="number"
                min="1"
                max="20"
                value={options.scale}
                onChange={(e) =>
                  setOptions({ ...options, scale: Number(e.target.value) || 8 })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="margin">Margin</Label>
              <Input
                id="margin"
                type="number"
                min="0"
                max="10"
                value={options.margin}
                onChange={(e) =>
                  setOptions({
                    ...options,
                    margin: Number(e.target.value) || 4,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="errorCorrection">Error Correction</Label>
              <select
                id="errorCorrection"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={options.errorCorrectionLevel}
                onChange={(e) =>
                  handleErrorCorrectionChange(
                    e.target.value as "L" | "M" | "Q" | "H"
                  )
                }
              >
                <option value="L">Low (7%)</option>
                <option value="M">Medium (15%)</option>
                <option value="Q">Quartile (25%)</option>
                <option value="H">High (30%)</option>
              </select>
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-1 flex flex-col items-center">
            {qrDataURL ? (
              <>
                <div className="border p-4 rounded-lg bg-white flex items-center justify-center">
                  <img src={qrDataURL} alt="QR Code" className="max-w-full" />
                </div>
                <canvas ref={canvasRef} className="hidden"></canvas>
                <Button
                  onClick={downloadQRCode}
                  className="mt-4 w-full md:w-auto"
                  variant="outline"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download QR Code
                </Button>
              </>
            ) : (
              <div className="border rounded-lg p-12 flex flex-col items-center justify-center text-center text-muted-foreground">
                <QrCode className="h-12 w-12 mb-4" />
                <h3 className="text-lg font-medium">
                  QR Code Will Appear Here
                </h3>
                <p>Enter some text above to generate a QR code</p>
              </div>
            )}
          </div>

          <div className="w-full md:w-1/2 space-y-4">
            <div className="border rounded-lg p-4 space-y-2">
              <h3 className="font-medium">QR Code Tips</h3>
              <ul className="text-sm space-y-1 list-disc pl-4 text-muted-foreground">
                <li>Keep your text or URL short for easier scanning</li>
                <li>
                  Use higher error correction for QR codes with logos or that
                  might get damaged
                </li>
                <li>
                  QR codes with high contrast (black/white) are easiest to scan
                </li>
                <li>
                  Test your QR code with multiple devices before finalizing
                </li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
