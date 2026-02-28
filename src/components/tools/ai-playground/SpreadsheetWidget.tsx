import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Sheet, Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/** Parse a GFM markdown table into headers + rows */
export function parseMarkdownTable(text: string): { headers: string[]; rows: string[][] } | null {
  const lines = text.trim().split("\n").filter((l) => l.trim());
  if (lines.length < 2) return null;

  // Must look like a markdown table (cells separated by |)
  if (!lines[0].includes("|")) return null;

  const parseRow = (line: string): string[] =>
    line
      .split("|")
      .map((c) => c.trim())
      .filter((_, i, arr) => i !== 0 && i !== arr.length - 1);

  const headers = parseRow(lines[0]);
  if (headers.length === 0) return null;

  // Line 1 should be the separator (--- | --- | ---)
  const sep = lines[1];
  if (!sep.match(/^[\s|:-]+$/)) return null;

  const rows = lines.slice(2).map(parseRow);
  return { headers, rows };
}

/** Find the first markdown table block in a text */
export function extractMarkdownTable(text: string): string | null {
  const tableRegex = /(\|.+\|\n\|[-:| ]+\|\n(?:\|.+\|\n?)+)/m;
  const match = tableRegex.exec(text);
  return match ? match[0] : null;
}

interface SpreadsheetWidgetProps {
  initialHeaders: string[];
  initialRows: string[][];
  className?: string;
}

export function SpreadsheetWidget({ initialHeaders, initialRows, className }: SpreadsheetWidgetProps) {
  const [headers] = useState<string[]>(initialHeaders);
  const [rows, setRows] = useState<string[][]>(initialRows.map((r) => [...r]));
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [editCell, setEditCell] = useState<[number, number] | null>(null);
  const [editValue, setEditValue] = useState("");

  const displayRows = sortCol !== null
    ? [...rows].sort((a, b) => {
        const av = a[sortCol] ?? "";
        const bv = b[sortCol] ?? "";
        const an = parseFloat(av);
        const bn = parseFloat(bv);
        if (!isNaN(an) && !isNaN(bn)) return sortAsc ? an - bn : bn - an;
        return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
      })
    : rows;

  const handleSort = (col: number) => {
    if (sortCol === col) setSortAsc((v) => !v);
    else { setSortCol(col); setSortAsc(true); }
  };

  const startEdit = (rowIdx: number, colIdx: number, value: string) => {
    setEditCell([rowIdx, colIdx]);
    setEditValue(value);
  };

  const commitEdit = useCallback(() => {
    if (!editCell) return;
    const [r, c] = editCell;
    setRows((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = editValue;
      return next;
    });
    setEditCell(null);
    setEditValue("");
  }, [editCell, editValue]);

  const addRow = () => {
    setRows((prev) => [...prev, Array(headers.length).fill("")]);
  };

  const deleteRow = (idx: number) => {
    setRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const exportCSV = () => {
    const csv = [headers, ...rows]
      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "table.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV downloaded");
  };

  const exportXLSX = async () => {
    try {
      const XLSX = await import("xlsx");
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
      XLSX.writeFile(wb, "table.xlsx");
      toast.success("Excel file downloaded");
    } catch (e) {
      toast.error("Could not export to Excel");
    }
  };

  return (
    <div className={cn("my-3 rounded-xl border overflow-hidden", className)}>
      {/* Header bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-950/40 border-b border-green-200 dark:border-green-800">
        <Sheet className="w-4 h-4 text-green-600 dark:text-green-400" />
        <span className="text-xs font-semibold text-green-700 dark:text-green-300 flex-1">
          Spreadsheet · {rows.length} row{rows.length !== 1 ? "s" : ""} × {headers.length} col{headers.length !== 1 ? "s" : ""}
        </span>
        <div className="flex gap-1">
          <Button size="sm" variant="outline" className="h-6 text-[10px] px-2 gap-1" onClick={exportCSV}>
            <Download className="w-3 h-3" />
            CSV
          </Button>
          <Button size="sm" variant="outline" className="h-6 text-[10px] px-2 gap-1 text-green-700 border-green-300" onClick={exportXLSX}>
            <Download className="w-3 h-3" />
            Excel
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-72 overflow-y-auto">
        <table className="w-full border-collapse text-xs">
          <thead className="sticky top-0 z-10">
            <tr>
              <th className="w-8 bg-muted border text-center text-[10px] text-muted-foreground py-1.5">#</th>
              {headers.map((h, i) => (
                <th
                  key={i}
                  className="border px-2 py-1.5 bg-muted text-left font-medium text-xs cursor-pointer hover:bg-muted/80 select-none whitespace-nowrap"
                  onClick={() => handleSort(i)}
                >
                  <span className="flex items-center gap-1">
                    {h}
                    {sortCol === i ? (
                      sortAsc ? <ChevronUp className="w-3 h-3 text-primary" /> : <ChevronDown className="w-3 h-3 text-primary" />
                    ) : (
                      <ChevronUp className="w-3 h-3 opacity-0 group-hover:opacity-40" />
                    )}
                  </span>
                </th>
              ))}
              <th className="w-8 border bg-muted" />
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-muted/20 group">
                <td className="border text-center text-[10px] text-muted-foreground py-1 w-8">{rowIdx + 1}</td>
                {headers.map((_, colIdx) => {
                  const isEditing = editCell?.[0] === rowIdx && editCell?.[1] === colIdx;
                  const cellValue = row[colIdx] ?? "";
                  return (
                    <td key={colIdx} className="border px-0 py-0 min-w-[80px]">
                      {isEditing ? (
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={commitEdit}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === "Tab") commitEdit();
                            if (e.key === "Escape") setEditCell(null);
                          }}
                          className="h-7 rounded-none border-0 border-primary border-2 text-xs px-2 focus-visible:ring-0"
                          autoFocus
                        />
                      ) : (
                        <div
                          className="px-2 py-1.5 cursor-text min-h-[28px] hover:bg-primary/5"
                          onDoubleClick={() => startEdit(rowIdx, colIdx, cellValue)}
                          title="Double-click to edit"
                        >
                          {cellValue}
                        </div>
                      )}
                    </td>
                  );
                })}
                <td className="border w-8">
                  <button
                    className="w-full h-7 flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive"
                    onClick={() => deleteRow(rowIdx)}
                    title="Delete row"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-t bg-muted/10">
        <button
          className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/80"
          onClick={addRow}
        >
          <Plus className="w-3 h-3" />
          Add row
        </button>
        <span className="ml-auto text-[10px] text-muted-foreground">
          Double-click a cell to edit · Click header to sort
        </span>
      </div>
    </div>
  );
}
