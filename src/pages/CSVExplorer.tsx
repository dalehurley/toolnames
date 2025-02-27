import React, { useState } from "react";
import { FileUploader } from "@/components/csv-explorer/FileUploader";
import { DataGrid } from "@/components/csv-explorer/DataGrid";
import { DataAnalytics } from "@/components/csv-explorer/DataAnalytics";
import { DataCleaner } from "@/components/csv-explorer/DataCleaner";
import { ExportOptions } from "@/components/csv-explorer/ExportOptions";
import { CSVData, Column, ParseResult } from "@/types/csv-explorer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CSVExplorer: React.FC = () => {
  const [csvData, setCsvData] = useState<CSVData | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleCsvParsed = (
    data: CSVData,
    result: ParseResult,
    detectedColumns: Column[]
  ) => {
    setCsvData(data);
    setParseResult(result);
    setColumns(detectedColumns);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">CSV Explorer</h1>

      {!csvData ? (
        <FileUploader
          onCsvParsed={handleCsvParsed}
          setIsLoading={setIsLoading}
        />
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {parseResult?.name || "Uploaded File"}
            </h2>
            <button
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              onClick={() => {
                setCsvData(null);
                setParseResult(null);
                setColumns([]);
              }}
            >
              Upload New File
            </button>
          </div>

          <Tabs defaultValue="data">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="data">Data View</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="clean">Data Cleaning</TabsTrigger>
              <TabsTrigger value="export">Export</TabsTrigger>
            </TabsList>

            <TabsContent value="data">
              <DataGrid
                data={csvData}
                columns={columns}
                setColumns={setColumns}
                parseResult={parseResult}
              />
            </TabsContent>

            <TabsContent value="analytics">
              <DataAnalytics data={csvData} columns={columns} />
            </TabsContent>

            <TabsContent value="clean">
              <DataCleaner
                data={csvData}
                columns={columns}
                setCsvData={setCsvData}
              />
            </TabsContent>

            <TabsContent value="export">
              <ExportOptions
                data={csvData}
                columns={columns}
                parseResult={parseResult}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}

      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-medium mb-2">Processing file...</h3>
            <p>This may take a moment for large files.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CSVExplorer;
