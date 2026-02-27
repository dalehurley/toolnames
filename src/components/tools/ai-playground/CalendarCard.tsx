import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Download, Copy, Check, Clock, MapPin, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface ParsedEvent {
  title: string;
  date: string;
  time?: string;
  endTime?: string;
  location?: string;
  description?: string;
  duration?: string;
}

/**
 * Detect if a block of text describes a calendar event / meeting.
 * Looks for title + date patterns.
 */
export function parseCalendarEvent(text: string): ParsedEvent | null {
  const normalized = text.replace(/\r\n/g, "\n");

  // Must have both an event title and a date
  const titleMatch =
    /^(?:Title|Event|Meeting|Appointment|Call):\s*(.+)/im.exec(normalized);
  const dateMatch =
    /^Date:\s*(.+)/im.exec(normalized);

  if (!titleMatch || !dateMatch) return null;

  const timeMatch = /^(?:Time|Start(?:\s+Time)?):\s*(.+)/im.exec(normalized);
  const endTimeMatch = /^(?:End(?:\s+Time)?|Until):\s*(.+)/im.exec(normalized);
  const locationMatch = /^(?:Location|Where|Venue|Place):\s*(.+)/im.exec(normalized);
  const descriptionMatch = /^(?:Description|Notes?|Agenda|Details?):\s*([\s\S]+?)(?:^[A-Z][a-z]+:|\Z)/im.exec(normalized);
  const durationMatch = /^Duration:\s*(.+)/im.exec(normalized);

  return {
    title: titleMatch[1].trim(),
    date: dateMatch[1].trim(),
    time: timeMatch?.[1].trim(),
    endTime: endTimeMatch?.[1].trim(),
    location: locationMatch?.[1].trim(),
    description: descriptionMatch?.[1].trim(),
    duration: durationMatch?.[1].trim(),
  };
}

/** Generate a basic .ics file string */
function buildICS(event: ParsedEvent): string {
  const now = new Date();
  const uid = `${now.getTime()}@toolnames-ai`;

  // Try to parse date/time into DTSTART; fall back to all-day
  let dtstart = "";
  let dtend = "";

  try {
    const dateStr = event.time ? `${event.date} ${event.time}` : event.date;
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      const fmt = (d: Date) =>
        d
          .toISOString()
          .replace(/[-:]/g, "")
          .replace(/\.\d{3}/, "");
      dtstart = `DTSTART:${fmt(parsed)}`;

      if (event.endTime) {
        const endStr = `${event.date} ${event.endTime}`;
        const parsedEnd = new Date(endStr);
        dtend = !isNaN(parsedEnd.getTime()) ? `DTEND:${fmt(parsedEnd)}` : "";
      }
      if (!dtend) {
        // Default: 1 hour duration
        const end = new Date(parsed.getTime() + 60 * 60 * 1000);
        dtend = `DTEND:${fmt(end)}`;
      }
    }
  } catch {
    // fallback: all-day
  }

  if (!dtstart) {
    // All-day event using raw date string
    const allDayDate = event.date.replace(/\D/g, "").slice(0, 8);
    dtstart = `DTSTART;VALUE=DATE:${allDayDate || now.toISOString().slice(0, 10).replace(/-/g, "")}`;
    dtend = dtstart.replace("DTSTART", "DTEND");
  }

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//toolnames.com//AIPlayground//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `SUMMARY:${event.title.replace(/,/g, "\\,")}`,
    dtstart,
    dtend,
    event.location ? `LOCATION:${event.location.replace(/,/g, "\\,")}` : "",
    event.description
      ? `DESCRIPTION:${event.description.replace(/\n/g, "\\n").replace(/,/g, "\\,")}`
      : "",
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");

  return lines;
}

function downloadICS(event: ParsedEvent) {
  const ics = buildICS(event);
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${event.title.replace(/\s+/g, "-").toLowerCase()}.ics`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success("Calendar file downloaded");
}

interface CalendarCardProps {
  event: ParsedEvent;
  className?: string;
}

export function CalendarCard({ event, className }: CalendarCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = [
      event.title,
      `Date: ${event.date}`,
      event.time ? `Time: ${event.time}${event.endTime ? ` – ${event.endTime}` : ""}` : "",
      event.location ? `Location: ${event.location}` : "",
      event.description ? `\n${event.description}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Event details copied");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "my-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-emerald-100 dark:bg-emerald-900/50 border-b border-emerald-200 dark:border-emerald-800">
        <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          Calendar Event
        </span>
      </div>

      {/* Details */}
      <div className="px-4 py-3 space-y-2">
        <p className="font-semibold text-sm">{event.title}</p>

        <div className="space-y-1.5">
          <EventRow icon={<Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />} label={event.date} />
          {event.time && (
            <EventRow
              icon={<Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
              label={`${event.time}${event.endTime ? ` – ${event.endTime}` : ""}${event.duration ? ` (${event.duration})` : ""}`}
            />
          )}
          {event.location && (
            <EventRow
              icon={<MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
              label={event.location}
            />
          )}
          {event.description && (
            <EventRow
              icon={<FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
              label={event.description}
              muted
            />
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 px-4 pb-3">
        <Button
          size="sm"
          className="h-7 text-xs gap-1.5 flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
          onClick={() => downloadICS(event)}
        >
          <Download className="w-3 h-3" />
          Add to Calendar (.ics)
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs gap-1.5"
          onClick={handleCopy}
        >
          {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
          Copy
        </Button>
      </div>
    </div>
  );
}

function EventRow({
  icon,
  label,
  muted,
}: {
  icon: React.ReactNode;
  label: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="flex-shrink-0 mt-0.5">{icon}</span>
      <span className={cn("text-xs leading-relaxed", muted ? "text-muted-foreground" : "")}>
        {label}
      </span>
    </div>
  );
}
