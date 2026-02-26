import { useState, useCallback, forwardRef } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Upload, File as FileIcon, X } from "lucide-react";
import { detectFormat } from "./utils/converters";

interface FileDropzoneProps {
  onFileSelected: (
    file: File,
    content: string | ArrayBuffer,
    detectedFormat: string | null
  ) => void;
  acceptedFormats?: string[];
  maxSize?: number;
}

const FileDropzoneComponent = forwardRef<HTMLDivElement, FileDropzoneProps>(
  (props, ref) => {
    const {
      onFileSelected,
      acceptedFormats = [".csv", ".json", ".xml", ".yaml", ".yml"],
      maxSize = 10 * 1024 * 1024,
    } = props;

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback(
      async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];
        setSelectedFile(file);
        setIsLoading(true);
        setError(null);

        try {
          // Read file content
          const reader = new FileReader();

          reader.onload = async (event) => {
            if (!event.target || !event.target.result) {
              throw new Error("Failed to read file");
            }

            const content = event.target.result;

            // Binary formats like Excel
            if (file.name.match(/\.(xlsx|xls)$/i)) {
              setError("Excel conversion is not supported at this time");
              setIsLoading(false);
              setSelectedFile(null);
              return;
            } else {
              // Text-based formats
              if (typeof content === "string") {
                const detectedFormat = detectFormat(content, file.name);
                onFileSelected(file, content, detectedFormat);
              } else {
                throw new Error("Failed to read file as text");
              }
            }

            setIsLoading(false);
          };

          reader.onerror = () => {
            throw new Error("Failed to read file");
          };

          // Read as text or binary based on file type
          if (file.name.match(/\.(xlsx|xls)$/i)) {
            setError("Excel conversion is not supported at this time");
            setIsLoading(false);
            setSelectedFile(null);
          } else {
            reader.readAsText(file);
          }
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Failed to process file"
          );
          setIsLoading(false);
          setSelectedFile(null);
        }
      },
      [onFileSelected]
    );

    const { getRootProps, getInputProps, isDragActive, isDragReject } =
      useDropzone({
        onDrop,
        accept: acceptedFormats.reduce((acc, format) => {
          // Map extensions to MIME types
          if (format === ".csv") acc["text/csv"] = [".csv"];
          else if (format === ".json") acc["application/json"] = [".json"];
          else if (format === ".xml")
            acc["application/xml"] = [".xml", ".xhtml", ".svg"];
          else if (format === ".yaml" || format === ".yml")
            acc["text/yaml"] = [".yaml", ".yml"];
          return acc;
        }, {} as Record<string, string[]>),
        maxSize,
        multiple: false,
      });

    const removeFile = () => {
      setSelectedFile(null);
      setError(null);
    };

    return (
      <div className="w-full" ref={ref}>
        {!selectedFile ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer ${
              isDragActive
                ? "border-primary bg-muted/50"
                : "border-muted-foreground/25"
            } ${isDragReject ? "border-destructive" : ""}`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-lg font-medium">
                {isDragActive
                  ? "Drop the file here..."
                  : "Drag & drop a file here, or click to select"}
              </p>
              <p className="text-sm text-muted-foreground">
                Supported formats: CSV, JSON, XML, YAML
              </p>
              <p className="text-sm text-muted-foreground">
                Maximum file size: {(maxSize / (1024 * 1024)).toFixed(0)} MB
              </p>
              <Button variant="outline" className="mt-2">
                <Upload className="mr-2 h-4 w-4" />
                Select File
              </Button>
            </div>
          </div>
        ) : (
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileIcon className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={removeFile}
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
            {isLoading && (
              <div className="mt-2 flex items-center space-x-2">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                <p className="text-sm">Processing file...</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

FileDropzoneComponent.displayName = "FileDropzone";

export const FileDropzone = FileDropzoneComponent;
