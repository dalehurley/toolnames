import { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUpload } from "./FileUpload";
import { ConversionOptions } from "./ConversionOptions";
import { convertAudio } from "./audioUtils";
import {
  Music,
  FileAudio,
  Play,
  Pause,
  Download,
  Trash2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

interface AudioFileState {
  id: string;
  file: File;
  status: "idle" | "converting" | "done" | "error";
  progress: number;
  convertedBlob: Blob | null;
  errorMsg?: string;
}

export function AudioFormatConverter() {
  const [files, setFiles] = useState<AudioFileState[]>([]);
  const [format, setFormat] = useState("wav");
  const [quality, setQuality] = useState("192");

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      // Cleanup logic if needed
    };
  }, []);

  const handleFilesSelected = (newFiles: File[]) => {
    const newAudioFiles: AudioFileState[] = newFiles.map((f) => ({
      id: Math.random().toString(36).substr(2, 9),
      file: f,
      status: "idle",
      progress: 0,
      convertedBlob: null,
    }));
    setFiles((prev) => [...prev, ...newAudioFiles]);
  };

  const removeFile = (id: string) => {
    setFiles(files.filter((f) => f.id !== id));
  };

  const convertAll = async () => {
    // We update state to converting
    setFiles(
      files.map((f) =>
        f.status === "done"
          ? f
          : { ...f, status: "converting", progress: 0, errorMsg: undefined },
      ),
    );

    // Process sequentially to not freeze UI too much (audio decoding is heavy)
    for (const fileState of files) {
      if (fileState.status === "done") continue;

      try {
        // Update specific file to converting
        setFiles((prev) =>
          prev.map((p) =>
            p.id === fileState.id
              ? { ...p, status: "converting", progress: 50 }
              : p,
          ),
        );

        const result = await convertAudio(fileState.file, format as any);

        setFiles((prev) =>
          prev.map((p) =>
            p.id === fileState.id
              ? {
                  ...p,
                  status: "done",
                  progress: 100,
                  convertedBlob: result,
                }
              : p,
          ),
        );
      } catch (err: any) {
        setFiles((prev) =>
          prev.map((p) =>
            p.id === fileState.id
              ? {
                  ...p,
                  status: "error",
                  errorMsg: err.message || "Conversion failed",
                }
              : p,
          ),
        );
      }
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Music className="h-6 w-6 text-primary" />
            <CardTitle>Audio Format Converter</CardTitle>
          </div>
          <CardDescription>
            Convert audio files locally in your browser. No files are uploaded
            to any server.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FileUpload onFilesSelected={handleFilesSelected} />

          {files.length > 0 && (
            <>
              <Separator />
              <ConversionOptions
                format={format}
                onFormatChange={setFormat}
                quality={quality}
                onQualityChange={setQuality}
              />

              <div className="space-y-3 mt-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Queue ({files.length})</h3>
                  <Button
                    onClick={convertAll}
                    disabled={files.some((f) => f.status === "converting")}
                  >
                    {files.some((f) => f.status === "converting") ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                        Converting...
                      </>
                    ) : (
                      "Convert All"
                    )}
                  </Button>
                </div>

                {files.map((fileState) => (
                  <AudioFileItem
                    key={fileState.id}
                    fileState={fileState}
                    onRemove={() => removeFile(fileState.id)}
                    targetFormat={format}
                  />
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AudioFileItem({
  fileState,
  onRemove,
  targetFormat,
}: {
  fileState: AudioFileState;
  onRemove: () => void;
  targetFormat: string;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (!audioRef.current) {
      const blob = fileState.convertedBlob || fileState.file;
      const url = URL.createObjectURL(blob);
      audioRef.current = new Audio(url);
      audioRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  const download = () => {
    if (!fileState.convertedBlob) return;
    const url = URL.createObjectURL(fileState.convertedBlob);
    const a = document.createElement("a");
    a.href = url;
    const nameParts = fileState.file.name.split(".");
    const name = nameParts.slice(0, -1).join(".");
    a.download = `${name}.${targetFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="p-3 flex items-center gap-4">
      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <FileAudio className="h-5 w-5 text-primary" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="font-medium text-sm truncate">{fileState.file.name}</p>
          <span className="text-xs text-muted-foreground">
            {(fileState.file.size / 1024 / 1024).toFixed(2)} MB
          </span>
        </div>

        {fileState.status === "error" ? (
          <div className="flex items-center text-xs text-destructive">
            <AlertCircle className="h-3 w-3 mr-1" /> {fileState.errorMsg}
          </div>
        ) : (
          <Progress value={fileState.progress} className="h-1" />
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {(fileState.status === "idle" || fileState.status === "done") && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={togglePlay}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
        )}

        {fileState.status === "done" && (
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 text-green-600 border-green-200 hover:bg-green-50"
            onClick={download}
          >
            <Download className="h-4 w-4" />
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
