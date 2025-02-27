import React, { useState, useRef } from "react";
import { CSVData, Column, ParseResult, DataValue } from "@/types/csv-explorer";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Bar, Line, Pie } from "react-chartjs-2";
import "chart.js/auto";

interface ExportOptionsProps {
  data: CSVData | null;
  columns: Column[];
  parseResult: ParseResult | null;
}

export const ExportOptions: React.FC<ExportOptionsProps> = ({
  data,
  columns,
  parseResult,
}) => {
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState<"csv" | "excel" | "image">(
    "csv"
  );
  const [filename, setFilename] = useState<string>(
    parseResult?.name?.split(".")[0] || "export"
  );
  const chartRef = useRef<HTMLDivElement>(null);

  const toggleColumn = (columnId: string) => {
    if (selectedColumns.includes(columnId)) {
      setSelectedColumns(selectedColumns.filter((id) => id !== columnId));
    } else {
      setSelectedColumns([...selectedColumns, columnId]);
    }
  };

  const toggleAllColumns = () => {
    if (selectedColumns.length === columns.length) {
      setSelectedColumns([]);
    } else {
      setSelectedColumns(columns.map((column) => column.id));
    }
  };

  const prepareExportData = () => {
    if (!data) return [];

    // Use all columns if none selected
    const columnsToExport =
      selectedColumns.length > 0
        ? selectedColumns
        : columns.map((col) => col.id);

    // Filter data to only include selected columns
    return data.data.map((row) => {
      const filteredRow: Record<string, DataValue> = {};
      columnsToExport.forEach((colId) => {
        filteredRow[colId] = row[colId];
      });
      return filteredRow;
    });
  };

  const exportCSV = () => {
    const exportData = prepareExportData();
    if (exportData.length === 0) return;

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${filename}.csv`);
  };

  const exportExcel = () => {
    const exportData = prepareExportData();
    if (exportData.length === 0) return;

    // Convert data to array format expected by XLSX
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `${filename}.xlsx`);
  };

  const exportChart = () => {
    if (!chartRef.current) return;

    const canvas = chartRef.current.querySelector("canvas");
    if (!canvas) return;

    // Convert canvas to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        saveAs(blob, `${filename}-chart.png`);
      }
    });
  };

  const handleExport = () => {
    if (!data || data.data.length === 0) return;

    switch (exportFormat) {
      case "csv":
        exportCSV();
        break;
      case "excel":
        exportExcel();
        break;
      case "image":
        exportChart();
        break;
    }
  };

  // Create a simple chart for image export
  const renderExportChart = () => {
    if (!data || !data.data.length || selectedColumns.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center text-gray-500">
          Select columns to generate a preview chart
        </div>
      );
    }

    // Take first selected column for labels and second for data
    const labelColumn = selectedColumns[0];
    const dataColumn =
      selectedColumns.length > 1 ? selectedColumns[1] : selectedColumns[0];

    // Get column types
    const labelColumnType =
      columns.find((col) => col.id === labelColumn)?.type || "string";
    const dataColumnType =
      columns.find((col) => col.id === dataColumn)?.type || "number";

    // Determine chart type based on column types
    let chartType: "bar" | "line" | "pie" = "bar";

    if (labelColumnType === "date") {
      chartType = "line";
    } else if (
      selectedColumns.length === 1 &&
      (labelColumnType === "string" || labelColumnType === "boolean")
    ) {
      chartType = "pie";
    }

    // Create dataset
    const uniqueLabels = new Set<string>();
    const labelCounts: Record<string, number> = {};

    data.data.forEach((row) => {
      const label = String(row[labelColumn] || "Unknown");
      uniqueLabels.add(label);
      labelCounts[label] = (labelCounts[label] || 0) + 1;
    });

    const chartData = {
      labels: Array.from(uniqueLabels),
      datasets: [
        {
          label: dataColumn,
          data:
            chartType === "pie"
              ? Array.from(uniqueLabels).map((label) => labelCounts[label])
              : Array.from(uniqueLabels).map((label) => {
                  // Filter rows for this label
                  const rows = data.data.filter(
                    (row) => String(row[labelColumn]) === label
                  );

                  // For non-numeric columns, count occurrences
                  if (dataColumnType !== "number") {
                    return rows.length;
                  }

                  // For numeric columns, calculate average
                  const values = rows
                    .map((row) => row[dataColumn])
                    .filter((val) => val !== null && val !== undefined)
                    .map((val) => Number(val))
                    .filter((val) => !isNaN(val));

                  if (values.length === 0) return 0;
                  return (
                    values.reduce((sum, val) => sum + val, 0) / values.length
                  );
                }),
          backgroundColor: [
            "rgba(54, 162, 235, 0.5)",
            "rgba(255, 99, 132, 0.5)",
            "rgba(255, 206, 86, 0.5)",
            "rgba(75, 192, 192, 0.5)",
            "rgba(153, 102, 255, 0.5)",
            "rgba(255, 159, 64, 0.5)",
          ],
          borderColor: [
            "rgba(54, 162, 235, 1)",
            "rgba(255, 99, 132, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };

    const chartJsx =
      chartType === "bar" ? (
        <Bar data={chartData} />
      ) : chartType === "line" ? (
        <Line data={chartData} />
      ) : (
        <Pie data={chartData} />
      );

    return <div className="h-64">{chartJsx}</div>;
  };

  if (!data || !data.data.length) {
    return (
      <div className="p-8 text-center text-gray-500">No data to export</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border rounded-md p-4 bg-white">
        <h3 className="text-lg font-medium mb-4">Export Configuration</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Export Format
            </label>
            <select
              className="w-full border rounded p-2"
              value={exportFormat}
              onChange={(e) =>
                setExportFormat(e.target.value as "csv" | "excel" | "image")
              }
            >
              <option value="csv">CSV (.csv)</option>
              <option value="excel">Excel (.xlsx)</option>
              <option value="image">Chart Image (.png)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filename
            </label>
            <input
              type="text"
              className="w-full border rounded p-2"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="Enter filename (without extension)"
            />
          </div>

          <div className="self-end">
            <button
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={handleExport}
              disabled={!data || data.data.length === 0}
            >
              Export {exportFormat.toUpperCase()}
            </button>
          </div>
        </div>
      </div>

      <div className="border rounded-md p-4 bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Columns to Export</h3>

          <button
            className="text-sm text-blue-600 hover:text-blue-800"
            onClick={toggleAllColumns}
          >
            {selectedColumns.length === columns.length
              ? "Deselect All"
              : "Select All"}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {columns.map((column) => (
            <div key={column.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`export-col-${column.id}`}
                checked={selectedColumns.includes(column.id)}
                onChange={() => toggleColumn(column.id)}
              />
              <label htmlFor={`export-col-${column.id}`} className="text-sm">
                {column.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      {exportFormat === "image" && (
        <div className="border rounded-md p-4 bg-white" ref={chartRef}>
          <h3 className="text-lg font-medium mb-4">Chart Preview</h3>
          {renderExportChart()}
        </div>
      )}
    </div>
  );
};
