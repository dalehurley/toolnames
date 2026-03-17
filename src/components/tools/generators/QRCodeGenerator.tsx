import { useState, useEffect, useRef, useCallback } from "react";
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
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import {
  Download,
  QrCode,
  Copy,
  Printer,
  RotateCcw,
  Wifi,
  Mail,
  Phone,
  MessageSquare,
  Link,
  Type,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
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

interface WifiFields {
  ssid: string;
  password: string;
  security: "WPA" | "WEP" | "nopass";
  hidden: boolean;
}

interface EmailFields {
  to: string;
  subject: string;
  body: string;
}

interface SmsFields {
  phone: string;
  message: string;
}

type ContentType = "url" | "text" | "email" | "phone" | "sms" | "wifi";

const COLOR_PRESETS = [
  { name: "Classic", dark: "#000000", light: "#ffffff" },
  { name: "Navy", dark: "#1e3a5f", light: "#f0f4f8" },
  { name: "Forest", dark: "#1a4731", light: "#f0f9f4" },
  { name: "Crimson", dark: "#8b0000", light: "#fff5f5" },
  { name: "Ocean", dark: "#0077b6", light: "#e0f4ff" },
  { name: "Violet", dark: "#4c1d95", light: "#f5f3ff" },
];

const CONTENT_TIPS: Record<ContentType, string[]> = {
  url: [
    "Use HTTPS URLs for better security indicators when scanned",
    "Shorter URLs produce simpler QR codes that scan faster",
    "Consider a URL shortener for very long URLs",
  ],
  text: [
    "Keep text under 300 characters for reliable scanning",
    "Plain text QR codes work great for quick notes or instructions",
    "Avoid special characters that may not display correctly",
  ],
  email: [
    "Subject and body are pre-filled when the email app opens",
    "Test on multiple devices — some apps may handle mailto: differently",
    "Leave subject/body blank for a simple email address QR",
  ],
  phone: [
    "Include the country code (e.g. +1) for international compatibility",
    "Scanning will prompt the user to call the number",
    "Works with both mobile and VoIP apps",
  ],
  sms: [
    "Include country code for international SMS",
    "Pre-filled messages save users time",
    "Keep messages short — long messages may not pre-fill on all devices",
  ],
  wifi: [
    "Use WPA/WPA2 security for best protection",
    "Guests can join your network without seeing the password",
    "Mark as hidden if your network SSID is not broadcast",
  ],
};

const DEFAULT_OPTIONS: QROptions = {
  scale: 8,
  margin: 4,
  color: { dark: "#000000", light: "#ffffff" },
  errorCorrectionLevel: "M",
};

const MAX_CHARS = 500;

export const QRCodeGenerator = () => {
  const [contentType, setContentType] = useState<ContentType>("url");
  const [urlText, setUrlText] = useState<string>("https://toolnames.com");
  const [plainText, setPlainText] = useState<string>("");
  const [phoneText, setPhoneText] = useState<string>("");
  const [emailFields, setEmailFields] = useState<EmailFields>({
    to: "",
    subject: "",
    body: "",
  });
  const [smsFields, setSmsFields] = useState<SmsFields>({
    phone: "",
    message: "",
  });
  const [wifiFields, setWifiFields] = useState<WifiFields>({
    ssid: "",
    password: "",
    security: "WPA",
    hidden: false,
  });
  const [filename, setFilename] = useState<string>("qrcode");
  const [qrDataURL, setQrDataURL] = useState<string>("");
  const [qrPixelSize, setQrPixelSize] = useState<number>(0);
  const [inputError, setInputError] = useState<string>("");
  const [options, setOptions] = useState<QROptions>(DEFAULT_OPTIONS);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const buildQRText = useCallback((): string => {
    switch (contentType) {
      case "url":
        return urlText;
      case "text":
        return plainText;
      case "email": {
        const params: string[] = [];
        if (emailFields.subject) params.push(`subject=${encodeURIComponent(emailFields.subject)}`);
        if (emailFields.body) params.push(`body=${encodeURIComponent(emailFields.body)}`);
        return `mailto:${emailFields.to}${params.length ? "?" + params.join("&") : ""}`;
      }
      case "phone":
        return `tel:${phoneText}`;
      case "sms":
        return `sms:${smsFields.phone}${smsFields.message ? `?body=${encodeURIComponent(smsFields.message)}` : ""}`;
      case "wifi": {
        const escapedSsid = wifiFields.ssid.replace(/[\\;,":]/g, (c) => `\\${c}`);
        const escapedPass = wifiFields.password.replace(/[\\;,":]/g, (c) => `\\${c}`);
        return `WIFI:T:${wifiFields.security};S:${escapedSsid};P:${escapedPass};H:${wifiFields.hidden ? "true" : "false"};;`;
      }
      default:
        return "";
    }
  }, [contentType, urlText, plainText, emailFields, smsFields, wifiFields, phoneText]);

  const validateInput = useCallback((text: string): string => {
    if (!text) return "";
    if (text.length > MAX_CHARS) return `Input exceeds ${MAX_CHARS} characters — QR code may not scan reliably`;
    if (contentType === "url") {
      try {
        new URL(text);
        return "";
      } catch {
        if (text.startsWith("http") || text.startsWith("www.")) {
          return "URL appears malformed — check for typos";
        }
        return "";
      }
    }
    return "";
  }, [contentType]);

  const generateQRCode = useCallback(async () => {
    const text = buildQRText();
    if (!text) {
      setQrDataURL("");
      return;
    }

    const error = validateInput(text);
    setInputError(error);

    try {
      const dataURL = await QRCode.toDataURL(text, {
        errorCorrectionLevel: options.errorCorrectionLevel,
        margin: options.margin,
        scale: options.scale,
        color: options.color,
      });
      setQrDataURL(dataURL);

      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, text, {
          errorCorrectionLevel: options.errorCorrectionLevel,
          margin: options.margin,
          scale: options.scale,
          color: options.color,
        });
        setQrPixelSize(canvasRef.current.width);
      }
    } catch (err) {
      console.error("Error generating QR code:", err);
      setQrDataURL("");
    }
  }, [buildQRText, validateInput, options]);

  useEffect(() => {
    generateQRCode();
  }, [generateQRCode]);

  const downloadQRCode = (format: "png" | "svg") => {
    const safeFilename = filename.trim() || "qrcode";
    if (format === "png") {
      const link = document.createElement("a");
      link.href = qrDataURL;
      link.download = `${safeFilename}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("PNG downloaded");
    } else {
      const text = buildQRText();
      QRCode.toString(text, {
        type: "svg",
        errorCorrectionLevel: options.errorCorrectionLevel,
        margin: options.margin,
        color: options.color,
      })
        .then((svgString) => {
          const blob = new Blob([svgString], { type: "image/svg+xml" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `${safeFilename}.svg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          toast.success("SVG downloaded");
        })
        .catch(() => toast.error("Failed to generate SVG"));
    }
  };

  const copyToClipboard = async () => {
    if (!canvasRef.current) return;
    canvasRef.current.toBlob(async (blob) => {
      if (!blob) return;
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        toast.success("QR code copied to clipboard");
      } catch {
        toast.error("Clipboard access denied — try downloading instead");
      }
    });
  };

  const printQRCode = () => {
    if (!qrDataURL) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>QR Code</title>
          <style>
            body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
            img { max-width: 400px; }
          </style>
        </head>
        <body>
          <img src="${qrDataURL}" />
          <script>window.onload = () => { window.print(); window.close(); }<\/script>
        </body>
      </html>
    `);
    win.document.close();
    toast.success("Print dialog opened");
  };

  const resetOptions = () => {
    setOptions(DEFAULT_OPTIONS);
    toast.success("Options reset to defaults");
  };

  const currentText = buildQRText();
  const charCount = currentText.length;
  const tips = CONTENT_TIPS[contentType];

  return (
    <>
      <Toaster richColors />
      <Card className="w-full max-w-5xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-2xl">QR Code Generator</CardTitle>
              <CardDescription className="mt-1">
                Generate scannable QR codes for links, contact info, Wi-Fi, and more — free and instant
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={resetOptions} className="text-muted-foreground">
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Main Layout: Controls Left, QR Right */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left: Controls */}
            <div className="lg:col-span-3 space-y-5">
              {/* Content Type Tabs */}
              <div className="space-y-2">
                <Label>Content Type</Label>
                <Tabs
                  value={contentType}
                  onValueChange={(v) => setContentType(v as ContentType)}
                >
                  <TabsList className="grid grid-cols-3 sm:grid-cols-6 h-auto gap-1 p-1">
                    <TabsTrigger value="url" className="text-xs gap-1 px-2 py-1.5">
                      <Link className="h-3 w-3" /> URL
                    </TabsTrigger>
                    <TabsTrigger value="text" className="text-xs gap-1 px-2 py-1.5">
                      <Type className="h-3 w-3" /> Text
                    </TabsTrigger>
                    <TabsTrigger value="email" className="text-xs gap-1 px-2 py-1.5">
                      <Mail className="h-3 w-3" /> Email
                    </TabsTrigger>
                    <TabsTrigger value="phone" className="text-xs gap-1 px-2 py-1.5">
                      <Phone className="h-3 w-3" /> Phone
                    </TabsTrigger>
                    <TabsTrigger value="sms" className="text-xs gap-1 px-2 py-1.5">
                      <MessageSquare className="h-3 w-3" /> SMS
                    </TabsTrigger>
                    <TabsTrigger value="wifi" className="text-xs gap-1 px-2 py-1.5">
                      <Wifi className="h-3 w-3" /> Wi-Fi
                    </TabsTrigger>
                  </TabsList>

                  {/* URL */}
                  <TabsContent value="url" className="mt-3 space-y-2">
                    <Label htmlFor="urlInput">Website URL</Label>
                    <Input
                      id="urlInput"
                      value={urlText}
                      onChange={(e) => setUrlText(e.target.value)}
                      placeholder="https://example.com"
                    />
                  </TabsContent>

                  {/* Plain Text */}
                  <TabsContent value="text" className="mt-3 space-y-2">
                    <Label htmlFor="textInput">Plain Text</Label>
                    <textarea
                      id="textInput"
                      value={plainText}
                      onChange={(e) => setPlainText(e.target.value)}
                      placeholder="Enter any text to encode..."
                      rows={3}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    />
                  </TabsContent>

                  {/* Email */}
                  <TabsContent value="email" className="mt-3 space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="emailTo">To</Label>
                      <Input
                        id="emailTo"
                        type="email"
                        value={emailFields.to}
                        onChange={(e) => setEmailFields({ ...emailFields, to: e.target.value })}
                        placeholder="recipient@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emailSubject">Subject <span className="text-muted-foreground font-normal">(optional)</span></Label>
                      <Input
                        id="emailSubject"
                        value={emailFields.subject}
                        onChange={(e) => setEmailFields({ ...emailFields, subject: e.target.value })}
                        placeholder="Hello!"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emailBody">Message <span className="text-muted-foreground font-normal">(optional)</span></Label>
                      <textarea
                        id="emailBody"
                        value={emailFields.body}
                        onChange={(e) => setEmailFields({ ...emailFields, body: e.target.value })}
                        placeholder="Your message here..."
                        rows={2}
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                      />
                    </div>
                  </TabsContent>

                  {/* Phone */}
                  <TabsContent value="phone" className="mt-3 space-y-2">
                    <Label htmlFor="phoneInput">Phone Number</Label>
                    <Input
                      id="phoneInput"
                      type="tel"
                      value={phoneText}
                      onChange={(e) => setPhoneText(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                    />
                  </TabsContent>

                  {/* SMS */}
                  <TabsContent value="sms" className="mt-3 space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="smsPhone">Phone Number</Label>
                      <Input
                        id="smsPhone"
                        type="tel"
                        value={smsFields.phone}
                        onChange={(e) => setSmsFields({ ...smsFields, phone: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smsMessage">Message <span className="text-muted-foreground font-normal">(optional)</span></Label>
                      <Input
                        id="smsMessage"
                        value={smsFields.message}
                        onChange={(e) => setSmsFields({ ...smsFields, message: e.target.value })}
                        placeholder="Pre-filled message text"
                      />
                    </div>
                  </TabsContent>

                  {/* Wi-Fi */}
                  <TabsContent value="wifi" className="mt-3 space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="wifiSsid">Network Name (SSID)</Label>
                      <Input
                        id="wifiSsid"
                        value={wifiFields.ssid}
                        onChange={(e) => setWifiFields({ ...wifiFields, ssid: e.target.value })}
                        placeholder="My WiFi Network"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="wifiPassword">Password</Label>
                        <Input
                          id="wifiPassword"
                          type="password"
                          value={wifiFields.password}
                          onChange={(e) => setWifiFields({ ...wifiFields, password: e.target.value })}
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="wifiSecurity">Security</Label>
                        <Select
                          value={wifiFields.security}
                          onValueChange={(v) => setWifiFields({ ...wifiFields, security: v as WifiFields["security"] })}
                        >
                          <SelectTrigger id="wifiSecurity">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="WPA">WPA/WPA2</SelectItem>
                            <SelectItem value="WEP">WEP</SelectItem>
                            <SelectItem value="nopass">None (open)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={wifiFields.hidden}
                        onChange={(e) => setWifiFields({ ...wifiFields, hidden: e.target.checked })}
                        className="rounded"
                      />
                      Hidden network (SSID not broadcast)
                    </label>
                  </TabsContent>
                </Tabs>

                {/* Character counter & validation */}
                <div className="flex items-center justify-between text-xs mt-1">
                  {inputError ? (
                    <span className="flex items-center gap-1 text-amber-600">
                      <AlertCircle className="h-3 w-3" />
                      {inputError}
                    </span>
                  ) : charCount > 0 ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle2 className="h-3 w-3" />
                      Valid
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Enter content above</span>
                  )}
                  <span className={`tabular-nums ${charCount > MAX_CHARS ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                    {charCount} / {MAX_CHARS}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Customization */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Customization</h3>

                {/* Color Presets */}
                <div className="space-y-2">
                  <Label>Color Preset</Label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        title={preset.name}
                        onClick={() =>
                          setOptions({
                            ...options,
                            color: { dark: preset.dark, light: preset.light },
                          })
                        }
                        className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all hover:scale-105 ${
                          options.color.dark === preset.dark && options.color.light === preset.light
                            ? "ring-2 ring-ring ring-offset-1"
                            : ""
                        }`}
                        style={{
                          backgroundColor: preset.light,
                          color: preset.dark,
                          borderColor: preset.dark + "40",
                        }}
                      >
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: preset.dark }}
                        />
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Colors */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="darkColor">Dark Color</Label>
                    <div className="flex gap-2">
                      <input
                        id="darkColor"
                        type="color"
                        value={options.color.dark}
                        onChange={(e) =>
                          setOptions({ ...options, color: { ...options.color, dark: e.target.value } })
                        }
                        className="h-10 w-12 cursor-pointer rounded-md border border-input p-1"
                      />
                      <Input
                        value={options.color.dark}
                        onChange={(e) =>
                          setOptions({ ...options, color: { ...options.color, dark: e.target.value } })
                        }
                        className="flex-1 font-mono text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lightColor">Light Color</Label>
                    <div className="flex gap-2">
                      <input
                        id="lightColor"
                        type="color"
                        value={options.color.light}
                        onChange={(e) =>
                          setOptions({ ...options, color: { ...options.color, light: e.target.value } })
                        }
                        className="h-10 w-12 cursor-pointer rounded-md border border-input p-1"
                      />
                      <Input
                        value={options.color.light}
                        onChange={(e) =>
                          setOptions({ ...options, color: { ...options.color, light: e.target.value } })
                        }
                        className="flex-1 font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Size Slider */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Size</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground tabular-nums">
                        Scale {options.scale}
                      </span>
                      {qrPixelSize > 0 && (
                        <Badge variant="secondary" className="text-xs tabular-nums">
                          {qrPixelSize}×{qrPixelSize}px
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Slider
                    min={2}
                    max={20}
                    step={1}
                    value={[options.scale]}
                    onValueChange={([v]) => setOptions({ ...options, scale: v })}
                  />
                </div>

                {/* Margin Slider */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Quiet Zone Margin</Label>
                    <span className="text-sm text-muted-foreground tabular-nums">
                      {options.margin} {options.margin === 1 ? "module" : "modules"}
                    </span>
                  </div>
                  <Slider
                    min={0}
                    max={10}
                    step={1}
                    value={[options.margin]}
                    onValueChange={([v]) => setOptions({ ...options, margin: v })}
                  />
                </div>

                {/* Error Correction */}
                <div className="space-y-2">
                  <Label htmlFor="errorCorrection">Error Correction Level</Label>
                  <Select
                    value={options.errorCorrectionLevel}
                    onValueChange={(v) =>
                      setOptions({ ...options, errorCorrectionLevel: v as QROptions["errorCorrectionLevel"] })
                    }
                  >
                    <SelectTrigger id="errorCorrection">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="L">Low — 7% recovery (smaller QR)</SelectItem>
                      <SelectItem value="M">Medium — 15% recovery (recommended)</SelectItem>
                      <SelectItem value="Q">Quartile — 25% recovery</SelectItem>
                      <SelectItem value="H">High — 30% recovery (for logo overlays)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Right: QR Preview + Actions */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {/* QR Preview */}
              <div className="flex flex-col items-center gap-4">
                {qrDataURL ? (
                  <div
                    className="w-full rounded-xl border-2 border-dashed border-muted p-4 flex items-center justify-center"
                    style={{ background: options.color.light }}
                  >
                    <img
                      src={qrDataURL}
                      alt="Generated QR Code"
                      className="max-w-full"
                      style={{ imageRendering: "pixelated" }}
                    />
                  </div>
                ) : (
                  <div className="w-full rounded-xl border-2 border-dashed border-muted p-12 flex flex-col items-center justify-center text-center text-muted-foreground gap-3 min-h-[200px]">
                    <QrCode className="h-16 w-16 opacity-20" />
                    <div>
                      <p className="font-medium text-sm">Your QR code will appear here</p>
                      <p className="text-xs mt-1">Fill in the content fields on the left</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Filename Input */}
              {qrDataURL && (
                <div className="space-y-2">
                  <Label htmlFor="filename">Download Filename</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      id="filename"
                      value={filename}
                      onChange={(e) => setFilename(e.target.value)}
                      placeholder="qrcode"
                      className="flex-1"
                    />
                    <span className="text-sm text-muted-foreground whitespace-nowrap">.png / .svg</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {qrDataURL && (
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => downloadQRCode("png")}
                    className="col-span-2"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download PNG
                  </Button>
                  <Button
                    onClick={() => downloadQRCode("svg")}
                    variant="outline"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download SVG
                  </Button>
                  <Button onClick={copyToClipboard} variant="outline">
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Image
                  </Button>
                  <Button
                    onClick={printQRCode}
                    variant="ghost"
                    className="col-span-2 text-muted-foreground"
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                  </Button>
                </div>
              )}

              {/* Canvas (hidden, used for clipboard & size measurement) */}
              <canvas ref={canvasRef} className="hidden" />

              {/* Contextual Tips */}
              <div className="rounded-lg border bg-muted/40 p-4 space-y-2">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <QrCode className="h-4 w-4" />
                  Tips for {contentType === "url" ? "URL" : contentType === "wifi" ? "Wi-Fi" : contentType.charAt(0).toUpperCase() + contentType.slice(1)} QR Codes
                </h3>
                <ul className="text-xs space-y-1.5 text-muted-foreground">
                  {tips.map((tip, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                  <li className="flex gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Always test with multiple devices before printing or sharing</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
