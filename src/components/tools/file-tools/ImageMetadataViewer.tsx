import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, Image as ImageIcon, Download, Copy, X } from "lucide-react";

interface ImageMetadata {
  // Basic info
  fileName: string;
  fileSize: number;
  fileType: string;
  lastModified: string;
  // Image info
  width: number;
  height: number;
  aspectRatio: string;
  megapixels: number;
  // Computed
  orientation: string;
  colorDepth?: number;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}


function getOrientation(w: number, h: number): string {
  if (w > h) return "Landscape";
  if (h > w) return "Portrait";
  return "Square";
}

const EXIF_TAGS: Record<number, string> = {
  0x010F: "Make", 0x0110: "Model", 0x0112: "Orientation",
  0x011A: "XResolution", 0x011B: "YResolution", 0x0128: "ResolutionUnit",
  0x0131: "Software", 0x0132: "DateTime", 0x013B: "Artist",
  0x0213: "YCbCrPositioning", 0x8298: "Copyright",
  0x8769: "ExifIFD", 0x8825: "GPSIFD",
  0x9000: "ExifVersion", 0x9003: "DateTimeOriginal",
  0x9004: "DateTimeDigitized", 0x9201: "ShutterSpeedValue",
  0x9202: "ApertureValue", 0x9203: "BrightnessValue",
  0x9204: "ExposureBiasValue", 0x9205: "MaxApertureValue",
  0x9207: "MeteringMode", 0x9208: "LightSource",
  0x9209: "Flash", 0x920A: "FocalLength",
  0xA001: "ColorSpace", 0xA002: "PixelXDimension",
  0xA003: "PixelYDimension", 0xA20E: "FocalPlaneXResolution",
  0xA210: "FocalPlaneResolutionUnit", 0xA401: "CustomRendered",
  0xA402: "ExposureMode", 0xA403: "WhiteBalance",
  0xA405: "FocalLengthIn35mmFilm", 0xA406: "SceneCaptureType",
  0x829A: "ExposureTime", 0x829D: "FNumber",
  0x8822: "ExposureProgram", 0x8827: "ISOSpeedRatings",
};

function readExifFromJpeg(buffer: ArrayBuffer): Record<string, string> {
  const view = new DataView(buffer);
  const result: Record<string, string> = {};

  // Check for JPEG marker
  if (view.getUint16(0) !== 0xFFD8) return result;

  let offset = 2;
  const length = buffer.byteLength;

  while (offset < length) {
    if (view.getUint8(offset) !== 0xFF) break;
    const marker = view.getUint16(offset);
    offset += 2;

    // APP1 marker (EXIF)
    if (marker === 0xFFE1) {
      offset += 2; // skip segment length

      // Check for "Exif\0\0"
      const exifHeader = String.fromCharCode(
        view.getUint8(offset), view.getUint8(offset + 1),
        view.getUint8(offset + 2), view.getUint8(offset + 3)
      );

      if (exifHeader === "Exif") {
        const tiffOffset = offset + 6;
        const byteOrder = view.getUint16(tiffOffset);
        const littleEndian = byteOrder === 0x4949;

        const ifdOffset = view.getUint32(tiffOffset + 4, littleEndian);
        const ifdAbsolute = tiffOffset + ifdOffset;

        const numEntries = view.getUint16(ifdAbsolute, littleEndian);

        for (let i = 0; i < numEntries; i++) {
          const entryOffset = ifdAbsolute + 2 + i * 12;
          const tag = view.getUint16(entryOffset, littleEndian);
          const type = view.getUint16(entryOffset + 2, littleEndian);
          const count = view.getUint32(entryOffset + 4, littleEndian);
          const valueOffset = entryOffset + 8;

          const tagName = EXIF_TAGS[tag];
          if (!tagName) continue;

          try {
            if (type === 2) {
              // ASCII string
              const strOffset = count > 4
                ? tiffOffset + view.getUint32(valueOffset, littleEndian)
                : valueOffset;
              let str = "";
              for (let j = 0; j < count - 1; j++) {
                const c = view.getUint8(strOffset + j);
                if (c === 0) break;
                str += String.fromCharCode(c);
              }
              if (str) result[tagName] = str;
            } else if (type === 3) {
              // Short
              const val = view.getUint16(valueOffset, littleEndian);
              result[tagName] = String(val);
            } else if (type === 4) {
              // Long
              const val = view.getUint32(valueOffset, littleEndian);
              result[tagName] = String(val);
            } else if (type === 5) {
              // Rational
              const rOffset = tiffOffset + view.getUint32(valueOffset, littleEndian);
              const num = view.getUint32(rOffset, littleEndian);
              const den = view.getUint32(rOffset + 4, littleEndian);
              result[tagName] = den === 1 ? String(num) : `${num}/${den}`;
            }
          } catch {
            // Skip problematic entries
          }
        }
      }
      break;
    } else if (marker === 0xFFDA) {
      break;
    } else {
      const segLen = view.getUint16(offset);
      offset += segLen;
    }
  }

  return result;
}

export const ImageMetadataViewer = () => {
  const [metadata, setMetadata] = useState<ImageMetadata | null>(null);
  const [exifData, setExifData] = useState<Record<string, string>>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const d = gcd(w, h);

      setMetadata({
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        lastModified: new Date(file.lastModified).toLocaleString(),
        width: w,
        height: h,
        aspectRatio: `${w / d}:${h / d}`,
        megapixels: Math.round((w * h / 1000000) * 100) / 100,
        orientation: getOrientation(w, h),
      });
    };
    img.src = url;

    // Read EXIF if JPEG
    if (file.type === "image/jpeg" || file.type === "image/jpg") {
      const buffer = await file.arrayBuffer();
      const exif = readExifFromJpeg(buffer);
      setExifData(exif);
    } else {
      setExifData({});
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) processFile(file);
  };

  const clear = () => {
    setMetadata(null);
    setExifData({});
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const exportJSON = () => {
    if (!metadata) return;
    const data = { ...metadata, exif: exifData };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${metadata.fileName}-metadata.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyAll = () => {
    if (!metadata) return;
    const lines = [
      `File: ${metadata.fileName}`,
      `Size: ${formatBytes(metadata.fileSize)}`,
      `Type: ${metadata.fileType}`,
      `Dimensions: ${metadata.width} × ${metadata.height} px`,
      `Aspect Ratio: ${metadata.aspectRatio}`,
      `Megapixels: ${metadata.megapixels}`,
      `Orientation: ${metadata.orientation}`,
      `Modified: ${metadata.lastModified}`,
      ...Object.entries(exifData).map(([k, v]) => `${k}: ${v}`),
    ];
    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Image Metadata Viewer</CardTitle>
          <CardDescription>View image dimensions, file info, and EXIF metadata — all processed locally in your browser</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Zone */}
          {!metadata ? (
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${isDragging ? "border-primary bg-primary/5" : "hover:border-primary hover:bg-muted/50"}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Drop an image here or click to browse</p>
              <p className="text-sm text-muted-foreground mt-2">Supports JPEG, PNG, WebP, GIF, BMP, TIFF</p>
              <p className="text-xs text-muted-foreground mt-1">All processing happens in your browser — no uploads</p>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                <span className="font-medium">{metadata.fileName}</span>
                <Badge variant="secondary">{metadata.fileType.split("/")[1].toUpperCase()}</Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyAll}>
                  <Copy className="h-3 w-3 mr-1" /> {copied ? "Copied!" : "Copy All"}
                </Button>
                <Button variant="outline" size="sm" onClick={exportJSON}>
                  <Download className="h-3 w-3 mr-1" /> JSON
                </Button>
                <Button variant="ghost" size="sm" onClick={clear} className="text-muted-foreground hover:text-destructive">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileInput} />

          {metadata && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Preview */}
              {previewUrl && (
                <div className="lg:col-span-1">
                  <Label className="text-base font-semibold">Preview</Label>
                  <div className="mt-2 rounded-lg border overflow-hidden bg-muted/30 flex items-center justify-center min-h-[200px]">
                    <img
                      src={previewUrl}
                      alt={metadata.fileName}
                      className="max-w-full max-h-64 object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="lg:col-span-2 space-y-4">
                {/* Basic File Info */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">File Information</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "File Name", value: metadata.fileName },
                      { label: "File Size", value: formatBytes(metadata.fileSize) },
                      { label: "File Type", value: metadata.fileType },
                      { label: "Last Modified", value: metadata.lastModified },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-muted/50 rounded-md p-2">
                        <div className="text-xs text-muted-foreground">{label}</div>
                        <div className="font-medium text-sm mt-0.5 truncate" title={value}>{value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Image Dimensions */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">Image Dimensions</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { label: "Width", value: `${metadata.width} px` },
                      { label: "Height", value: `${metadata.height} px` },
                      { label: "Megapixels", value: `${metadata.megapixels} MP` },
                      { label: "Aspect Ratio", value: metadata.aspectRatio },
                      { label: "Orientation", value: metadata.orientation },
                      { label: "Total Pixels", value: (metadata.width * metadata.height).toLocaleString() },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-muted/50 rounded-md p-2">
                        <div className="text-xs text-muted-foreground">{label}</div>
                        <div className="font-medium text-sm mt-0.5">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* EXIF Data */}
                {Object.keys(exifData).length > 0 && (
                  <div>
                    <Label className="text-base font-semibold mb-3 block">
                      EXIF Metadata
                      <Badge variant="secondary" className="ml-2">{Object.keys(exifData).length} fields</Badge>
                    </Label>
                    <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                      {Object.entries(exifData).map(([key, value]) => (
                        <div key={key} className="bg-muted/50 rounded-md p-2">
                          <div className="text-xs text-muted-foreground">{key}</div>
                          <div className="font-medium text-sm mt-0.5 truncate" title={value}>{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {metadata.fileType === "image/jpeg" && Object.keys(exifData).length === 0 && (
                  <div className="p-3 bg-muted/50 rounded-md text-sm text-muted-foreground">
                    No EXIF metadata found in this JPEG. The image may have had its metadata stripped.
                  </div>
                )}

                {metadata.fileType !== "image/jpeg" && (
                  <div className="p-3 bg-muted/50 rounded-md text-sm text-muted-foreground">
                    EXIF metadata extraction is available for JPEG/JPG files only.
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
