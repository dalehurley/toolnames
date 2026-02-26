import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils"; // Assuming this utility exists based on ShadCN
import { Card } from "@/components/ui/card";

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
}

export function FileUpload({ onFilesSelected }: FileUploadProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "audio/*": [".mp3", ".wav", ".ogg", ".aac", ".m4a", ".flac"],
    },
    onDrop: onFilesSelected,
  });

  return (
    <div {...getRootProps()} className="cursor-pointer">
      <input {...getInputProps()} />
      <Card
        className={cn(
          "border-2 border-dashed p-10 flex flex-col items-center justify-center text-center transition-colors bg-muted/5",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50",
        )}
      >
        <div className="bg-primary/10 p-4 rounded-full mb-4">
          <Upload className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">
          {isDragActive ? "Drop audio files here" : "Drag & drop audio files"}
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Support for MP3, WAV, OGG, AAC, M4A, FLAC. Client-side conversion
          ensures privacy.
        </p>
      </Card>
    </div>
  );
}
