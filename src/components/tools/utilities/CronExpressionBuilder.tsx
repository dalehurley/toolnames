import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Copy, CheckCircle2, AlertCircle } from "lucide-react";
const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const PRESETS = [
  { label: "Every minute", cron: "* * * * *", description: "Runs every minute" },
  { label: "Every 5 minutes", cron: "*/5 * * * *", description: "Runs every 5 minutes" },
  { label: "Every hour", cron: "0 * * * *", description: "Runs at the start of every hour" },
  { label: "Every day at midnight", cron: "0 0 * * *", description: "Runs at 00:00 every day" },
  { label: "Every day at noon", cron: "0 12 * * *", description: "Runs at 12:00 every day" },
  { label: "Every weekday", cron: "0 9 * * 1-5", description: "Runs at 9:00 AM Mon-Fri" },
  { label: "Every Sunday", cron: "0 0 * * 0", description: "Runs at midnight on Sundays" },
  { label: "Monthly (1st)", cron: "0 0 1 * *", description: "Runs at midnight on 1st of each month" },
  { label: "Yearly", cron: "0 0 1 1 *", description: "Runs at midnight on Jan 1st" },
];

function parseCronField(field: string, min: number, max: number): number[] {
  const values: number[] = [];
  if (field === "*") {
    for (let i = min; i <= max; i++) values.push(i);
    return values;
  }
  const parts = field.split(",");
  for (const part of parts) {
    if (part.includes("/")) {
      const [range, step] = part.split("/");
      const stepNum = parseInt(step);
      const start = range === "*" ? min : parseInt(range.split("-")[0]);
      const end = range.includes("-") ? parseInt(range.split("-")[1]) : max;
      for (let i = start; i <= end; i += stepNum) values.push(i);
    } else if (part.includes("-")) {
      const [start, end] = part.split("-").map(Number);
      for (let i = start; i <= end; i++) values.push(i);
    } else {
      const n = parseInt(part);
      if (!isNaN(n)) values.push(n);
    }
  }
  return [...new Set(values)].sort((a, b) => a - b);
}

function getNextRuns(cronExpr: string, count: number = 5): Date[] {
  try {
    const parts = cronExpr.trim().split(/\s+/);
    if (parts.length !== 5) return [];
    const [minPart, hourPart, domPart, monthPart, dowPart] = parts;

    const minutes = parseCronField(minPart, 0, 59);
    const hours = parseCronField(hourPart, 0, 23);
    const doms = parseCronField(domPart, 1, 31);
    const months = parseCronField(monthPart, 1, 12);
    const dows = parseCronField(dowPart, 0, 6);

    const results: Date[] = [];
    const now = new Date();
    now.setSeconds(0, 0);
    now.setMinutes(now.getMinutes() + 1);

    let current = new Date(now);
    let iterations = 0;
    const maxIterations = 525600; // 1 year of minutes

    while (results.length < count && iterations < maxIterations) {
      const m = current.getMonth() + 1;
      const dom = current.getDate();
      const dow = current.getDay();
      const h = current.getHours();
      const min = current.getMinutes();

      const domWild = domPart === "*";
      const dowWild = dowPart === "*";
      const domMatch = doms.includes(dom);
      const dowMatch = dows.includes(dow);

      const dayMatch = domWild && dowWild ? true
        : !domWild && !dowWild ? domMatch || dowMatch
        : domWild ? dowMatch : domMatch;

      if (months.includes(m) && dayMatch && hours.includes(h) && minutes.includes(min)) {
        results.push(new Date(current));
      }

      current.setMinutes(current.getMinutes() + 1);
      iterations++;
    }
    return results;
  } catch {
    return [];
  }
}

function describeCron(expr: string): string {
  try {
    const parts = expr.trim().split(/\s+/);
    if (parts.length !== 5) return "Invalid cron expression";
    const [min, hour, dom, month, dow] = parts;

    let desc = "Runs ";
    if (min === "*/5") desc += "every 5 minutes";
    else if (min === "*/10") desc += "every 10 minutes";
    else if (min === "*/15") desc += "every 15 minutes";
    else if (min === "*/30") desc += "every 30 minutes";
    else if (min === "*" && hour === "*") desc += "every minute";
    else if (min === "*") desc += `every minute of hour ${hour}`;
    else {
      desc += `at ${hour === "*" ? "every hour" : hour.padStart(2, "0")}:${min.padStart(2, "0")}`;
    }

    if (dom !== "*") desc += ` on day ${dom} of the month`;
    if (dow !== "*" && dom === "*") {
      const days = parseCronField(dow, 0, 6).map(d => DAYS_OF_WEEK[d]).join(", ");
      desc += ` on ${days}`;
    }
    if (month !== "*") {
      const months = parseCronField(month, 1, 12).map(m => MONTHS[m - 1]).join(", ");
      desc += ` in ${months}`;
    }
    return desc;
  } catch {
    return "Invalid expression";
  }
}

function validateCron(expr: string): { valid: boolean; message: string } {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return { valid: false, message: "Must have exactly 5 fields: minute hour day month weekday" };

  const ranges = [
    { min: 0, max: 59, name: "minute" },
    { min: 0, max: 23, name: "hour" },
    { min: 1, max: 31, name: "day" },
    { min: 1, max: 12, name: "month" },
    { min: 0, max: 6, name: "weekday" },
  ];

  for (let i = 0; i < 5; i++) {
    const field = parts[i];
    if (!/^(\*|(\d+(-\d+)?)(,(\d+(-\d+)?))*(\/\d+)?|\*\/\d+)$/.test(field)) {
      return { valid: false, message: `Invalid ${ranges[i].name} field: "${field}"` };
    }
  }
  return { valid: true, message: "Valid cron expression" };
}

export const CronExpressionBuilder = () => {
  const [cronExpr, setCronExpr] = useState("0 9 * * 1-5");
  const [copied, setCopied] = useState(false);

  const validation = useMemo(() => validateCron(cronExpr), [cronExpr]);
  const description = useMemo(() => describeCron(cronExpr), [cronExpr]);
  const nextRuns = useMemo(() => getNextRuns(cronExpr, 5), [cronExpr]);

  const copy = () => {
    navigator.clipboard.writeText(cronExpr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const parts = cronExpr.trim().split(/\s+/);
  const fieldLabels = ["Minute", "Hour", "Day", "Month", "Weekday"];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Cron Expression Builder</CardTitle>
          <CardDescription>Build, validate and visualize cron job schedules with next run times</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Expression Input */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Cron Expression</Label>
            <div className="flex gap-2">
              <Input
                value={cronExpr}
                onChange={(e) => setCronExpr(e.target.value)}
                className="font-mono text-lg tracking-widest"
                placeholder="* * * * *"
              />
              <Button variant="outline" size="icon" onClick={copy} title="Copy expression">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            {copied && <p className="text-xs text-green-600">Copied!</p>}
          </div>

          {/* Field Labels */}
          <div className="grid grid-cols-5 gap-2 text-center">
            {fieldLabels.map((label, i) => (
              <div key={label} className="space-y-1">
                <Badge variant="outline" className="w-full justify-center text-xs">{label}</Badge>
                <div className={`p-2 rounded font-mono text-lg font-bold text-center ${validation.valid ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                  {parts[i] || "*"}
                </div>
              </div>
            ))}
          </div>

          {/* Validation Status */}
          <div className={`flex items-center gap-2 p-3 rounded-md text-sm ${validation.valid ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"}`}>
            {validation.valid
              ? <CheckCircle2 className="h-4 w-4 shrink-0" />
              : <AlertCircle className="h-4 w-4 shrink-0" />
            }
            <span>{validation.message}</span>
          </div>

          {/* Description */}
          {validation.valid && (
            <div className="bg-muted rounded-md p-4">
              <p className="text-sm font-medium text-muted-foreground">Human Readable</p>
              <p className="text-base mt-1">{description}</p>
            </div>
          )}

          {/* Next Runs */}
          {validation.valid && nextRuns.length > 0 && (
            <div className="space-y-2">
              <Label className="text-base font-semibold">Next 5 Scheduled Runs</Label>
              <div className="space-y-1">
                {nextRuns.map((date, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-md bg-muted/50">
                    <Badge variant="secondary" className="w-6 h-6 flex items-center justify-center text-xs p-0 rounded-full shrink-0">
                      {i + 1}
                    </Badge>
                    <span className="font-mono text-sm">
                      {date.toLocaleString("en-US", {
                        weekday: "short", year: "numeric", month: "short",
                        day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Presets */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Common Schedules</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.cron}
                  onClick={() => setCronExpr(preset.cron)}
                  className="text-left p-3 rounded-md border hover:bg-muted transition-colors"
                >
                  <p className="font-medium text-sm">{preset.label}</p>
                  <p className="text-xs text-muted-foreground font-mono">{preset.cron}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Reference */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Field Reference</Label>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-muted">
                    <th className="text-left p-2 border rounded-tl">Field</th>
                    <th className="text-left p-2 border">Allowed Values</th>
                    <th className="text-left p-2 border rounded-tr">Special Characters</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Minute", "0-59", "* , - /"],
                    ["Hour", "0-23", "* , - /"],
                    ["Day of Month", "1-31", "* , - /"],
                    ["Month", "1-12", "* , - /"],
                    ["Day of Week", "0-6 (Sun=0)", "* , - /"],
                  ].map(([field, values, chars]) => (
                    <tr key={field} className="hover:bg-muted/50">
                      <td className="p-2 border font-medium">{field}</td>
                      <td className="p-2 border font-mono text-xs">{values}</td>
                      <td className="p-2 border font-mono text-xs">{chars}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground">
              <strong>*</strong> = any value &nbsp;|&nbsp; <strong>,</strong> = list (e.g. 1,3,5) &nbsp;|&nbsp; <strong>-</strong> = range (e.g. 1-5) &nbsp;|&nbsp; <strong>/</strong> = step (e.g. */5)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
