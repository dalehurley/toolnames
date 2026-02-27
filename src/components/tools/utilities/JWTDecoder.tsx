import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Copy, Check, KeyRound, AlertTriangle, Info } from "lucide-react";

function base64UrlDecode(str: string): string {
  // Pad the string
  const padding = 4 - (str.length % 4);
  const padded = padding !== 4 ? str + "=".repeat(padding) : str;
  // Replace URL-safe chars
  const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  try {
    return decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
  } catch {
    return atob(base64);
  }
}

interface JWTParts {
  header: object;
  payload: object;
  signature: string;
  isExpired?: boolean;
  expiresAt?: Date;
  issuedAt?: Date;
}

function parseJWT(token: string): { parts?: JWTParts; error?: string } {
  const parts = token.trim().split(".");
  if (parts.length !== 3) {
    return { error: "Invalid JWT: must have exactly 3 parts (header.payload.signature)" };
  }
  try {
    const header = JSON.parse(base64UrlDecode(parts[0]));
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    const signature = parts[2];

    let isExpired: boolean | undefined;
    let expiresAt: Date | undefined;
    let issuedAt: Date | undefined;

    if (typeof payload === "object" && payload !== null) {
      const p = payload as Record<string, unknown>;
      if (typeof p.exp === "number") {
        expiresAt = new Date(p.exp * 1000);
        isExpired = Date.now() > p.exp * 1000;
      }
      if (typeof p.iat === "number") {
        issuedAt = new Date(p.iat * 1000);
      }
    }

    return { parts: { header, payload, signature, isExpired, expiresAt, issuedAt } };
  } catch {
    return { error: "Failed to decode JWT: invalid base64url or JSON" };
  }
}

const CopyButton = ({ text, label = "Copy" }: { text: string; label?: string }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <Button size="sm" variant="outline" onClick={copy}>
      {copied ? (
        <Check className="h-3.5 w-3.5 mr-1 text-green-500" />
      ) : (
        <Copy className="h-3.5 w-3.5 mr-1" />
      )}
      {copied ? "Copied!" : label}
    </Button>
  );
};

const JsonDisplay = ({ data }: { data: object }) => (
  <pre className="text-xs font-mono bg-slate-50 dark:bg-slate-900 rounded-lg p-4 overflow-x-auto text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-all">
    {JSON.stringify(data, null, 2)}
  </pre>
);

const SAMPLE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

export const JWTDecoder = () => {
  const [token, setToken] = useState("");
  const [result, setResult] = useState<{ parts?: JWTParts; error?: string } | null>(null);

  const decode = useCallback((value: string) => {
    setToken(value);
    if (!value.trim()) {
      setResult(null);
      return;
    }
    setResult(parseJWT(value));
  }, []);

  const loadSample = () => {
    decode(SAMPLE_JWT);
  };

  const formatDate = (d: Date) =>
    d.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "medium",
    });

  return (
    <div className="space-y-6 max-w-3xl mx-auto p-4">
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 p-4 rounded-full">
            <KeyRound className="h-8 w-8 text-amber-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold">JWT Decoder</h1>
        <p className="text-muted-foreground">
          Decode and inspect JSON Web Tokens. All decoding happens locally — your token never leaves your browser.
        </p>
      </div>

      {/* Privacy Notice */}
      <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm text-blue-700 dark:text-blue-300">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <span>Your JWT is decoded entirely in your browser. No data is sent to any server.</span>
      </div>

      {/* Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="jwt-input">JSON Web Token</Label>
          <Button size="sm" variant="outline" onClick={loadSample}>
            Load Sample
          </Button>
        </div>
        <Textarea
          id="jwt-input"
          value={token}
          onChange={(e) => decode(e.target.value)}
          placeholder="Paste your JWT here (e.g. eyJhbGci...)"
          rows={4}
          className="font-mono text-sm resize-y"
        />
      </div>

      {/* Error */}
      {result?.error && (
        <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-300">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{result.error}</span>
        </div>
      )}

      {/* Results */}
      {result?.parts && (
        <div className="space-y-4">
          {/* Expiry status */}
          {result.parts.expiresAt !== undefined && (
            <div
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
                result.parts.isExpired
                  ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
                  : "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
              }`}
            >
              {result.parts.isExpired ? (
                <>
                  <AlertTriangle className="h-4 w-4" />
                  Token expired on {formatDate(result.parts.expiresAt)}
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Token valid — expires {formatDate(result.parts.expiresAt)}
                </>
              )}
            </div>
          )}

          {/* Issued at */}
          {result.parts.issuedAt && (
            <div className="text-sm text-muted-foreground">
              Issued at: {formatDate(result.parts.issuedAt)}
            </div>
          )}

          {/* Header */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
              <h2 className="font-semibold text-sm uppercase tracking-wide text-slate-600 dark:text-slate-400">
                Header (Algorithm & Token Type)
              </h2>
              <CopyButton text={JSON.stringify(result.parts.header, null, 2)} />
            </div>
            <div className="p-4">
              <JsonDisplay data={result.parts.header} />
            </div>
          </div>

          {/* Payload */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
              <h2 className="font-semibold text-sm uppercase tracking-wide text-slate-600 dark:text-slate-400">
                Payload (Claims)
              </h2>
              <CopyButton text={JSON.stringify(result.parts.payload, null, 2)} />
            </div>
            <div className="p-4">
              <JsonDisplay data={result.parts.payload} />
            </div>
          </div>

          {/* Signature */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
              <h2 className="font-semibold text-sm uppercase tracking-wide text-slate-600 dark:text-slate-400">
                Signature
              </h2>
              <CopyButton text={result.parts.signature} />
            </div>
            <div className="p-4">
              <p className="text-xs font-mono break-all text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                {result.parts.signature}
              </p>
              <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                Signature cannot be verified without the secret key.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
