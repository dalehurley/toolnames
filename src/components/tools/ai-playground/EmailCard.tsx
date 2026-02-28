import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Copy, Check, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface ParsedEmail {
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
}

/**
 * Detect if a block of text contains a drafted email.
 * Looks for "To:", "Subject:", and at least some body content.
 */
export function parseEmail(text: string): ParsedEmail | null {
  // Normalize line endings
  const normalized = text.replace(/\r\n/g, "\n");

  // Look for email header block: To: ... Subject: ... (Body follows)
  const toMatch = /^To:\s*(.+)/im.exec(normalized);
  const subjectMatch = /^Subject:\s*(.+)/im.exec(normalized);

  if (!toMatch || !subjectMatch) return null;

  const ccMatch = /^CC?:\s*(.+)/im.exec(normalized);
  const bccMatch = /^BCC?:\s*(.+)/im.exec(normalized);

  // Body: everything after the last header line
  // Find the position of the last header we know about
  const headerRegex = /^(?:To|CC?|BCC?|Subject|From|Date):\s*.+/gim;
  let lastHeaderEnd = 0;
  let m: RegExpExecArray | null;
  while ((m = headerRegex.exec(normalized)) !== null) {
    lastHeaderEnd = m.index + m[0].length;
  }

  // Skip blank lines after headers
  let bodyStart = lastHeaderEnd;
  while (bodyStart < normalized.length && (normalized[bodyStart] === "\n" || normalized[bodyStart] === " ")) {
    bodyStart++;
  }

  const body = normalized.slice(bodyStart).trim();

  // Must have a non-trivial body
  if (body.length < 10) return null;

  return {
    to: toMatch[1].trim(),
    cc: ccMatch?.[1].trim(),
    bcc: bccMatch?.[1].trim(),
    subject: subjectMatch[1].trim(),
    body,
  };
}

function buildMailtoHref(email: ParsedEmail): string {
  const params = new URLSearchParams();
  if (email.subject) params.set("subject", email.subject);
  if (email.body) params.set("body", email.body);
  if (email.cc) params.set("cc", email.cc);
  if (email.bcc) params.set("bcc", email.bcc);

  // URLSearchParams uses + for spaces; mailto needs %20
  const query = params.toString().replace(/\+/g, "%20");
  const to = encodeURIComponent(email.to);
  return `mailto:${to}?${query}`;
}

interface EmailCardProps {
  email: ParsedEmail;
  className?: string;
}

export function EmailCard({ email, className }: EmailCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = [
      `To: ${email.to}`,
      email.cc ? `CC: ${email.cc}` : "",
      email.bcc ? `BCC: ${email.bcc}` : "",
      `Subject: ${email.subject}`,
      "",
      email.body,
    ]
      .filter(Boolean)
      .join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Email copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const previewLines = email.body.split("\n").slice(0, 3).join("\n");
  const hasMore = email.body.split("\n").length > 3;

  return (
    <div
      className={cn(
        "my-3 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 overflow-hidden",
        className
      )}
    >
      {/* Email header bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/50 border-b border-blue-200 dark:border-blue-800">
        <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
          Email Draft
        </span>
      </div>

      {/* Fields */}
      <div className="px-4 py-3 space-y-1.5 text-sm">
        <HeaderRow label="To" value={email.to} />
        {email.cc && <HeaderRow label="CC" value={email.cc} />}
        {email.bcc && <HeaderRow label="BCC" value={email.bcc} />}
        <HeaderRow label="Subject" value={email.subject} bold />

        {/* Divider */}
        <div className="border-t border-blue-200 dark:border-blue-800 pt-2 mt-2">
          <div className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {expanded ? email.body : previewLines}
            {!expanded && hasMore && "…"}
          </div>
          {hasMore && (
            <button
              className="mt-1 text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? (
                <>
                  <ChevronUp className="w-3 h-3" /> Show less
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3" /> Show more
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 px-4 pb-3">
        <Button
          size="sm"
          className="h-7 text-xs gap-1.5 flex-1"
          asChild
        >
          <a href={buildMailtoHref(email)} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-3 h-3" />
            Open in Mail App
          </a>
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

function HeaderRow({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex gap-2 text-xs">
      <span className="text-muted-foreground w-14 flex-shrink-0">{label}:</span>
      <span className={cn("flex-1 min-w-0 break-all", bold && "font-semibold")}>{value}</span>
    </div>
  );
}
