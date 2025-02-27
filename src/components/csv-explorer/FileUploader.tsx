import React, { useCallback, useState } from "react";
import Papa from "papaparse";
import {
  CSVData,
  Column,
  ParseResult,
  DataType,
  DataValue,
} from "@/types/csv-explorer";
import { useDropzone } from "react-dropzone";

interface FileUploaderProps {
  onCsvParsed: (data: CSVData, result: ParseResult, columns: Column[]) => void;
  setIsLoading: (loading: boolean) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onCsvParsed,
  setIsLoading,
}) => {
  const [error, setError] = useState<string | null>(null);

  const detectDataType = (value: string): DataType => {
    if (value === null || value === undefined || value.trim() === "")
      return "unknown";

    // Check if it's a date
    const dateRegex =
      /^\d{1,4}[-/]\d{1,2}[-/]\d{1,4}$|^\d{1,2}[-/]\d{1,2}[-/]\d{2,4}$/;
    if (dateRegex.test(value)) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) return "date";
    }

    // Check if it's a number
    if (!isNaN(Number(value)) && value.trim() !== "") return "number";

    // Check if it's a boolean
    if (value.toLowerCase() === "true" || value.toLowerCase() === "false")
      return "boolean";

    // Default to string
    return "string";
  };

  const determineColumnTypes = (
    data: Record<string, DataValue>[],
    fields: string[]
  ): Column[] => {
    // Sample the first 100 rows (or less if not available) to determine column types
    const sampleSize = Math.min(100, data.length);
    const sample = data.slice(0, sampleSize);

    return fields.map((field) => {
      const values = sample
        .map((row) => row[field])
        .filter((val) => val !== null && val !== undefined);

      // If no values to sample, default to string
      if (values.length === 0) {
        return {
          id: field,
          name: field,
          type: "string",
          originalType: "string",
        };
      }

      // Detect types for each value
      const types: DataType[] = values.map((val) =>
        detectDataType(String(val))
      );

      // Get the most common type
      const typeCounts: Record<DataType, number> = {
        string: 0,
        number: 0,
        boolean: 0,
        date: 0,
        unknown: 0,
      };

      types.forEach((type) => {
        typeCounts[type]++;
      });

      let mostCommonType: DataType = "string";
      let maxCount = 0;

      (Object.keys(typeCounts) as DataType[]).forEach((type) => {
        if (typeCounts[type] > maxCount) {
          maxCount = typeCounts[type];
          mostCommonType = type;
        }
      });

      // If majority of values aren't consistent, default to string
      const consistency = maxCount / values.length;
      const finalType = consistency > 0.7 ? mostCommonType : "string";

      return {
        id: field,
        name: field,
        type: finalType,
        originalType: finalType,
      };
    });
  };

  const processCSVFile = useCallback(
    (file: File) => {
      setIsLoading(true);
      setError(null);

      Papa.parse(file, {
        header: true,
        dynamicTyping: false, // We'll handle type detection manually
        skipEmptyLines: true,
        complete: (result) => {
          try {
            // Check if the file was parsed successfully
            if (
              result.errors.length > 0 &&
              result.errors[0].code !== "TooFewFields"
            ) {
              setError(`Error parsing CSV: ${result.errors[0].message}`);
              setIsLoading(false);
              return;
            }

            // Check if we have data and fields
            if (!result.data.length || !result.meta.fields?.length) {
              setError("The CSV file is empty or has an invalid format");
              setIsLoading(false);
              return;
            }

            const fields = result.meta.fields;
            const parsedData = result.data as Record<string, DataValue>[];
            const detectedColumns = determineColumnTypes(parsedData, fields);

            // Add file name to parse result
            const parseResult: ParseResult = {
              ...(result as ParseResult),
              name: file.name,
            };

            // Create our unified data object
            const csvData: CSVData = {
              fields,
              data: parsedData,
              originalData: [...parsedData],
            };

            onCsvParsed(csvData, parseResult, detectedColumns);
            setIsLoading(false);
          } catch (err) {
            console.error("Error processing CSV file:", err);
            setError("An unexpected error occurred while processing the file");
            setIsLoading(false);
          }
        },
        error: (error) => {
          console.error("PapaParse error:", error);
          setError(`Error parsing CSV: ${error.message}`);
          setIsLoading(false);
        },
      });
    },
    [onCsvParsed, setIsLoading]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError(null);

      // Only accept the first file
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];

        // Check file size (50MB limit)
        if (file.size > 50 * 1024 * 1024) {
          setError("File size exceeds 50MB limit");
          return;
        }

        // Check file type
        if (
          file.type !== "text/csv" &&
          !file.name.endsWith(".csv") &&
          !file.name.endsWith(".tsv") &&
          !file.name.endsWith(".txt")
        ) {
          setError("Please upload a CSV, TSV, or TXT file");
          return;
        }

        processCSVFile(file);
      }
    },
    [processCSVFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv", ".tsv", ".txt"],
    },
    maxFiles: 1,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed p-10 rounded-lg text-center cursor-pointer transition-colors
                    ${
                      isDragActive
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-blue-400"
                    }`}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>

          <h3 className="text-lg font-medium">
            {isDragActive
              ? "Drop the file here"
              : "Drag & drop your CSV file here"}
          </h3>

          <p className="text-sm text-gray-500">
            or <span className="text-blue-500">browse files</span>
          </p>

          <p className="text-xs text-gray-400 mt-2">
            Supports CSV, TSV, and TXT files up to 50MB
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};
