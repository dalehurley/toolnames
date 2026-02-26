import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ConversionOptionsProps {
  format: string;
  onFormatChange: (format: string) => void;
  quality: string;
  onQualityChange: (quality: string) => void;
}

export function ConversionOptions({
  format,
  onFormatChange,
  quality,
  onQualityChange,
}: ConversionOptionsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-3">
        <Label>Target Format</Label>
        <RadioGroup
          value={format}
          onValueChange={onFormatChange}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {["wav", "mp3", "ogg", "aac"].map((fmt) => (
            <div key={fmt}>
              <RadioGroupItem value={fmt} id={fmt} className="peer sr-only" />
              <Label
                htmlFor={fmt}
                className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer uppercase font-semibold"
              >
                {fmt}
              </Label>
            </div>
          ))}
        </RadioGroup>
        {format !== "wav" && (
          <p className="text-xs text-yellow-600 dark:text-yellow-500 font-medium">
            Note: Browser-based conversion to {format.toUpperCase()} requires
            specific codecs. WAV is recommended for best compatibility.
          </p>
        )}
      </div>

      <div className="space-y-3">
        <Label>Quality / Bitrate</Label>
        <Select
          value={quality}
          onValueChange={onQualityChange}
          disabled={format === "wav"}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select quality" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="320">320 kbps (Best)</SelectItem>
            <SelectItem value="256">256 kbps (High)</SelectItem>
            <SelectItem value="192">192 kbps (Standard)</SelectItem>
            <SelectItem value="128">128 kbps (Voice)</SelectItem>
          </SelectContent>
        </Select>
        {format === "wav" && (
          <p className="text-xs text-muted-foreground">
            WAV is lossless (PCM) and does not use bitrate compression.
          </p>
        )}
      </div>
    </div>
  );
}
