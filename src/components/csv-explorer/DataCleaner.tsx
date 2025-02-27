import React, { useState } from "react";
import { CSVData, Column, DataValue } from "@/types/csv-explorer";

interface DataCleanerProps {
  data: CSVData | null;
  columns: Column[];
  setCsvData: React.Dispatch<React.SetStateAction<CSVData | null>>;
}

export const DataCleaner: React.FC<DataCleanerProps> = ({
  data,
  columns,
  setCsvData,
}) => {
  const [cleaningLog, setCleaningLog] = useState<string[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<string>("");
  const [nullHandlingStrategy, setNullHandlingStrategy] = useState<
    "remove" | "replace"
  >("remove");
  const [replacementValue, setReplacementValue] = useState<string>("");
  const [outlierThreshold, setOutlierThreshold] = useState<number>(2);

  if (!data || !data.data.length) {
    return (
      <div className="p-8 text-center text-gray-500">No data to clean</div>
    );
  }

  const addToLog = (message: string) => {
    setCleaningLog((prev) => [message, ...prev]);
  };

  const removeDuplicates = () => {
    if (!data) return;

    const uniqueMap = new Map();
    const uniqueRows: Record<string, DataValue>[] = [];

    data.data.forEach((row) => {
      // Create a key from all values to identify duplicates
      const key = Object.values(row).join("|");

      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, true);
        uniqueRows.push(row);
      }
    });

    const rowsRemoved = data.data.length - uniqueRows.length;

    setCsvData({
      ...data,
      data: uniqueRows,
    });

    addToLog(`Removed ${rowsRemoved} duplicate rows`);
  };

  const handleNullValues = () => {
    if (!data || !selectedColumn) return;

    const column = columns.find((col) => col.id === selectedColumn);
    if (!column) return;

    const updatedData = [...data.data];
    let nullsReplaced = 0;
    let rowsRemoved = 0;

    if (nullHandlingStrategy === "remove") {
      const filteredData = updatedData.filter((row) => {
        const value = row[selectedColumn];
        const isNull = value === null || value === undefined || value === "";
        if (isNull) rowsRemoved++;
        return !isNull;
      });

      setCsvData({
        ...data,
        data: filteredData,
      });

      addToLog(
        `Removed ${rowsRemoved} rows with null values in column "${column.name}"`
      );
    } else {
      // Replace nulls with specified value
      updatedData.forEach((row) => {
        const value = row[selectedColumn];
        if (value === null || value === undefined || value === "") {
          nullsReplaced++;

          // Convert replacement value to appropriate type
          let typedValue: DataValue = replacementValue;

          switch (column.type) {
            case "number":
              typedValue = parseFloat(replacementValue) || 0;
              break;
            case "boolean":
              typedValue = replacementValue.toLowerCase() === "true";
              break;
            case "date":
              typedValue = replacementValue
                ? new Date(replacementValue)
                : new Date();
              break;
          }

          row[selectedColumn] = typedValue;
        }
      });

      setCsvData({
        ...data,
        data: updatedData,
      });

      addToLog(
        `Replaced ${nullsReplaced} null values in column "${column.name}" with "${replacementValue}"`
      );
    }
  };

  const detectOutliers = () => {
    if (!data || !selectedColumn) return;

    const column = columns.find((col) => col.id === selectedColumn);
    if (!column || column.type !== "number") {
      addToLog("Outlier detection only works on numeric columns");
      return;
    }

    // Extract numeric values for the column
    const values = data.data
      .map((row) => row[selectedColumn])
      .filter((val) => val !== null && val !== undefined && !isNaN(Number(val)))
      .map((val) => Number(val));

    // Calculate mean and standard deviation
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance =
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      values.length;
    const stdDev = Math.sqrt(variance);

    // Identify rows with outliers
    const outlierIndices: number[] = [];

    data.data.forEach((row, index) => {
      const value = row[selectedColumn];
      if (value !== null && value !== undefined && !isNaN(Number(value))) {
        const numValue = Number(value);
        const zScore = Math.abs((numValue - mean) / stdDev);

        if (zScore > outlierThreshold) {
          outlierIndices.push(index);
        }
      }
    });

    // Mark outliers in the UI
    addToLog(
      `Detected ${outlierIndices.length} outliers in column "${column.name}" (Z-score > ${outlierThreshold})`
    );

    // Option to remove outliers
    if (outlierIndices.length > 0) {
      if (
        window.confirm(
          `Do you want to remove ${outlierIndices.length} outliers from column "${column.name}"?`
        )
      ) {
        const filteredData = data.data.filter(
          (_, index) => !outlierIndices.includes(index)
        );

        setCsvData({
          ...data,
          data: filteredData,
        });

        addToLog(
          `Removed ${outlierIndices.length} outliers from column "${column.name}"`
        );
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-md p-4 bg-white">
          <h3 className="text-lg font-medium mb-4">Remove Duplicate Rows</h3>
          <p className="text-sm text-gray-600 mb-4">
            Identify and remove duplicate rows based on all column values.
          </p>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={removeDuplicates}
          >
            Remove Duplicates
          </button>
        </div>

        <div className="border rounded-md p-4 bg-white">
          <h3 className="text-lg font-medium mb-4">Handle Null Values</h3>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Column
              </label>
              <select
                className="w-full border rounded p-2"
                value={selectedColumn}
                onChange={(e) => setSelectedColumn(e.target.value)}
              >
                <option value="">Select Column</option>
                {columns.map((column) => (
                  <option key={column.id} value={column.id}>
                    {column.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Strategy
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="remove"
                    checked={nullHandlingStrategy === "remove"}
                    onChange={() => setNullHandlingStrategy("remove")}
                    className="mr-2"
                  />
                  Remove Rows
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="replace"
                    checked={nullHandlingStrategy === "replace"}
                    onChange={() => setNullHandlingStrategy("replace")}
                    className="mr-2"
                  />
                  Replace Values
                </label>
              </div>
            </div>

            {nullHandlingStrategy === "replace" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Replacement Value
                </label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  value={replacementValue}
                  onChange={(e) => setReplacementValue(e.target.value)}
                  placeholder="Enter replacement value"
                />
              </div>
            )}

            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              onClick={handleNullValues}
              disabled={!selectedColumn}
            >
              Process Null Values
            </button>
          </div>
        </div>

        <div className="border rounded-md p-4 bg-white">
          <h3 className="text-lg font-medium mb-4">Detect Outliers</h3>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numeric Column
              </label>
              <select
                className="w-full border rounded p-2"
                value={selectedColumn}
                onChange={(e) => setSelectedColumn(e.target.value)}
              >
                <option value="">Select Column</option>
                {columns
                  .filter((col) => col.type === "number")
                  .map((column) => (
                    <option key={column.id} value={column.id}>
                      {column.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Z-Score Threshold (σ)
              </label>
              <input
                type="range"
                min="1"
                max="4"
                step="0.5"
                value={outlierThreshold}
                onChange={(e) =>
                  setOutlierThreshold(parseFloat(e.target.value))
                }
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>1σ</span>
                <span>2σ</span>
                <span>3σ</span>
                <span>4σ</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Current: {outlierThreshold}σ (
                {outlierThreshold === 2
                  ? "Moderate"
                  : outlierThreshold < 2
                  ? "Aggressive"
                  : "Conservative"}
                )
              </p>
            </div>

            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              onClick={detectOutliers}
              disabled={
                !selectedColumn ||
                columns.find((col) => col.id === selectedColumn)?.type !==
                  "number"
              }
            >
              Detect Outliers
            </button>
          </div>
        </div>
      </div>

      <div className="border rounded-md p-4 bg-white">
        <h3 className="text-lg font-medium mb-2">Cleaning Operations Log</h3>

        {cleaningLog.length === 0 ? (
          <p className="text-sm text-gray-500">
            No cleaning operations performed yet
          </p>
        ) : (
          <div className="border rounded overflow-y-auto max-h-60">
            <ul className="divide-y">
              {cleaningLog.map((log, index) => (
                <li key={index} className="p-2 text-sm">
                  {log}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
