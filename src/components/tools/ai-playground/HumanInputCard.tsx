import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MessageCircleQuestion, X, Send, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  HumanInputRequest,
  HumanInputAnswer,
  subscribeHumanInput,
} from "@/utils/humanInput";

// ── Standalone card shown when AI needs human input ───────────────────────────

export function HumanInputCardContainer() {
  const [request, setRequest] = useState<HumanInputRequest | null>(null);

  useEffect(() => {
    return subscribeHumanInput(setRequest);
  }, []);

  if (!request) return null;

  return <HumanInputCard request={request} />;
}

interface HumanInputCardProps {
  request: HumanInputRequest;
}

function HumanInputCard({ request }: HumanInputCardProps) {
  const [answers, setAnswers] = useState<HumanInputAnswer>(() => {
    const init: HumanInputAnswer = {};
    for (const f of request.fields) {
      init[f.key] = f.type === "checkbox" ? [] : "";
    }
    return init;
  });

  const setField = (key: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const toggleCheckbox = (key: string, option: string) => {
    const current = (answers[key] as string[]) || [];
    const next = current.includes(option)
      ? current.filter((v) => v !== option)
      : [...current, option];
    setField(key, next);
  };

  const canSubmit = request.fields.every((f) => {
    if (!f.required) return true;
    const val = answers[f.key];
    return Array.isArray(val) ? val.length > 0 : val.trim() !== "";
  });

  const handleSubmit = () => {
    if (!canSubmit) return;
    request.resolve(answers);
  };

  return (
    <div className="mx-3 mb-2 rounded-xl border border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-violet-950/40 shadow-md overflow-hidden animate-in slide-in-from-bottom-2">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-violet-100 dark:bg-violet-900/50 border-b border-violet-200 dark:border-violet-800">
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-violet-500 text-white flex-shrink-0">
          <MessageCircleQuestion className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-violet-800 dark:text-violet-200">
              AI needs your input
            </span>
            <Badge
              variant="outline"
              className="text-[9px] px-1.5 h-4 border-violet-400 text-violet-600 dark:text-violet-400"
            >
              ⏸ paused
            </Badge>
          </div>
          <p className="text-xs text-violet-700 dark:text-violet-300 mt-0.5 leading-snug">
            {request.question}
          </p>
        </div>
        <button
          onClick={() => request.cancel()}
          className="text-violet-400 hover:text-violet-600 flex-shrink-0"
          title="Cancel and stop"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Fields */}
      <div className="px-3 py-3 space-y-3">
        {request.fields.map((field) => (
          <div key={field.key} className="space-y-1.5">
            {/* Only show label if it differs from the question or there are multiple fields */}
            {(request.fields.length > 1 || field.label !== request.question) && (
              <Label className="text-xs font-medium text-violet-800 dark:text-violet-200">
                {field.label}
                {field.required && <span className="text-red-400 ml-0.5">*</span>}
              </Label>
            )}

            {field.type === "text" && (
              <Input
                autoFocus
                placeholder={field.placeholder || "Type your answer…"}
                value={answers[field.key] as string}
                onChange={(e) => setField(field.key, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) handleSubmit();
                }}
                className="h-8 text-xs border-violet-300 dark:border-violet-700 focus-visible:ring-violet-400"
              />
            )}

            {field.type === "select" && (
              <div className="relative">
                <select
                  value={answers[field.key] as string}
                  onChange={(e) => setField(field.key, e.target.value)}
                  className="w-full h-8 text-xs rounded-md border border-violet-300 dark:border-violet-700 bg-background px-2 pr-7 appearance-none focus:outline-none focus:ring-1 focus:ring-violet-400"
                >
                  <option value="">Select an option…</option>
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
              </div>
            )}

            {field.type === "radio" && (
              <div className="flex flex-wrap gap-2">
                {field.options?.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setField(field.key, opt)}
                    className={cn(
                      "text-xs px-3 py-1.5 rounded-full border transition-colors",
                      answers[field.key] === opt
                        ? "bg-violet-500 text-white border-violet-500"
                        : "border-violet-300 dark:border-violet-700 hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/30"
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {field.type === "checkbox" && (
              <div className="flex flex-wrap gap-2">
                {field.options?.map((opt) => {
                  const checked = (answers[field.key] as string[]).includes(opt);
                  return (
                    <button
                      key={opt}
                      onClick={() => toggleCheckbox(field.key, opt)}
                      className={cn(
                        "text-xs px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1.5",
                        checked
                          ? "bg-violet-500 text-white border-violet-500"
                          : "border-violet-300 dark:border-violet-700 hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/30"
                      )}
                    >
                      {checked && <span className="text-white">✓</span>}
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-950/30">
        <span className="text-[10px] text-violet-500 dark:text-violet-400">
          Agent loop paused · awaiting your response
        </span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 text-[11px] px-2 text-violet-500 hover:text-violet-700"
            onClick={() => request.cancel()}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="h-6 text-[11px] px-3 gap-1 bg-violet-500 hover:bg-violet-600 text-white"
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            <Send className="w-3 h-3" />
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
}
