import React, { useState, useEffect, useRef } from "react";
import {
  CSVData,
  Column,
  ParseResult,
  DataType,
  DataValue,
} from "@/types/csv-explorer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface DataGridProps {
  data: CSVData | null;
  columns: Column[];
  setColumns: React.Dispatch<React.SetStateAction<Column[]>>;
  parseResult: ParseResult | null;
}

export const DataGrid: React.FC<DataGridProps> = ({
  data,
  columns,
  setColumns,
  // parseResult is defined in the interface but not used in this component
}) => {
  const [visibleColumns, setVisibleColumns] = useState<Column[]>(columns);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState<Record<string, DataValue>[]>(
    []
  );
  const [typeOverrides, setTypeOverrides] = useState<Record<string, DataType>>(
    {}
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 50;

  // Apply search filtering
  useEffect(() => {
    if (!data) {
      setFilteredData([]);
      return;
    }

    if (!searchTerm.trim()) {
      setFilteredData(data.data);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase();

    setFilteredData(
      data.data.filter((row) => {
        return Object.values(row).some((value) => {
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(searchTermLower);
        });
      })
    );
  }, [data, searchTerm]);

  // Update visible columns when columns change
  useEffect(() => {
    setVisibleColumns(columns);
  }, [columns]);

  const handleTypeChange = (columnId: string, newType: DataType) => {
    // Store the type override
    setTypeOverrides((prev) => ({
      ...prev,
      [columnId]: newType,
    }));

    // Update column type in state
    setColumns((cols) =>
      cols.map((col) => (col.id === columnId ? { ...col, type: newType } : col))
    );
  };

  const toggleColumnVisibility = (columnId: string) => {
    const isCurrentlyVisible = visibleColumns.some(
      (col) => col.id === columnId
    );

    if (isCurrentlyVisible) {
      setVisibleColumns(visibleColumns.filter((col) => col.id !== columnId));
    } else {
      const columnToAdd = columns.find((col) => col.id === columnId);
      if (columnToAdd) {
        setVisibleColumns([...visibleColumns, columnToAdd]);
      }
    }
  };

  const formatCellValue = (value: DataValue, columnType: DataType): string => {
    if (value === null || value === undefined) return "";

    switch (columnType) {
      case "date":
        try {
          // Only convert to date if it's a compatible type
          if (
            typeof value === "string" ||
            typeof value === "number" ||
            value instanceof Date
          ) {
            return new Date(value).toLocaleDateString();
          }
          return String(value);
        } catch {
          return String(value);
        }
      case "number":
        return typeof value === "number" || !isNaN(Number(value))
          ? Number(value).toLocaleString()
          : String(value);
      case "boolean":
        return value === true || value === "true" ? "True" : "False";
      default:
        return String(value);
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  if (!data || !data.data.length) {
    return (
      <div className="p-8 text-center text-gray-500">No data to display</div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Search data..."
            className="w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="text-sm text-gray-500">
            {filteredData.length} rows
          </span>
        </div>

        <div className="relative group">
          <Button variant="outline">Column Settings</Button>
          <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-md border hidden group-hover:block z-20">
            <div className="p-3 border-b">
              <h3 className="font-medium">Column Visibility</h3>
            </div>
            <div className="p-3 max-h-60 overflow-y-auto">
              {columns.map((column) => (
                <div
                  key={column.id}
                  className="flex items-center space-x-2 mb-2"
                >
                  <Checkbox
                    id={`col-${column.id}`}
                    checked={visibleColumns.some((col) => col.id === column.id)}
                    onCheckedChange={() => toggleColumnVisibility(column.id)}
                  />
                  <label htmlFor={`col-${column.id}`} className="text-sm">
                    {column.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div ref={containerRef} className="border rounded overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">#</TableHead>
              {visibleColumns.map((column) => (
                <TableHead key={column.id}>
                  <div className="flex justify-between items-center">
                    <span>{column.name}</span>
                    <select
                      value={typeOverrides[column.id] || column.type}
                      onChange={(e) =>
                        handleTypeChange(column.id, e.target.value as DataType)
                      }
                      className="ml-2 text-xs bg-transparent border-none outline-none"
                    >
                      <option value="string">Text</option>
                      <option value="number">Number</option>
                      <option value="date">Date</option>
                      <option value="boolean">Boolean</option>
                    </select>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((row, rowIndex) => (
              <TableRow key={rowIndex} className="hover:bg-gray-50">
                <TableCell className="font-medium">
                  {(page - 1) * rowsPerPage + rowIndex + 1}
                </TableCell>
                {visibleColumns.map((column) => (
                  <TableCell key={column.id}>
                    {formatCellValue(row[column.id], column.type)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                aria-disabled={page === 1}
                className={page === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Show pages around the current page
              let pageNum = i + 1;
              if (totalPages > 5) {
                if (page > 3) {
                  pageNum = page - 3 + i;
                }
                if (page > totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                }
              }

              return (
                <PaginationItem key={i}>
                  <PaginationLink
                    onClick={() => setPage(pageNum)}
                    isActive={page === pageNum}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            <PaginationItem>
              <PaginationNext
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                aria-disabled={page === totalPages}
                className={
                  page === totalPages ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};
