import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { X, Workflow, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export type AgenticMode =
  | "none"
  | "react"
  | "plan_execute"
  | "chain_of_thought"
  | "tree_of_thought";

export interface AgenticConfig {
  mode: AgenticMode;
  maxIterations: number;
  showThoughts: boolean;
  autoAskHuman: boolean;
}

interface AgenticFlowPanelProps {
  config: AgenticConfig;
  onChange: (patch: Partial<AgenticConfig>) => void;
  onClose: () => void;
}

interface ModeCard {
  id: AgenticMode;
  label: string;
  icon: string;
  description: string;
  looping: boolean;
  color: string;
  prompt: string;
}

const MODES: ModeCard[] = [
  {
    id: "none",
    label: "Standard",
    icon: "💬",
    description: "Normal conversation — single API call per message.",
    looping: false,
    color: "border-border",
    prompt: "",
  },
  {
    id: "react",
    label: "ReAct Loop",
    icon: "🔄",
    description:
      "Reason → Act → Observe, repeated until the task is complete. The AI thinks out loud, uses tools, and iterates.",
    looping: true,
    color: "border-orange-400",
    prompt: "react",
  },
  {
    id: "plan_execute",
    label: "Plan & Execute",
    icon: "📋",
    description:
      "First creates a numbered plan, then executes each step in order using tools and human input as needed.",
    looping: true,
    color: "border-blue-400",
    prompt: "plan_execute",
  },
  {
    id: "chain_of_thought",
    label: "Chain of Thought",
    icon: "🧠",
    description:
      "Forces step-by-step reasoning shown in collapsible <thinking> blocks before the final answer.",
    looping: false,
    color: "border-violet-400",
    prompt: "chain_of_thought",
  },
  {
    id: "tree_of_thought",
    label: "Tree of Thought",
    icon: "🌳",
    description:
      "Explores multiple solution paths, evaluates each, selects and executes the best one.",
    looping: false,
    color: "border-green-400",
    prompt: "tree_of_thought",
  },
];

export function AgenticFlowPanel({ config, onChange, onClose }: AgenticFlowPanelProps) {
  const activeMode = MODES.find((m) => m.id === config.mode) ?? MODES[0];

  return (
    <div className="flex flex-col h-full border-l bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/20">
        <div className="flex items-center gap-2">
          <Workflow className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-medium">Agentic Flow</span>
          {config.mode !== "none" && (
            <Badge variant="default" className="text-[10px] px-1.5 h-4 bg-orange-500">
              {activeMode.icon} {activeMode.label}
            </Badge>
          )}
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Info bar */}
      <div className="px-3 py-1.5 text-[10px] text-muted-foreground bg-orange-50/40 dark:bg-orange-950/20 border-b flex items-start gap-1.5">
        <Info className="w-3 h-3 flex-shrink-0 mt-0.5 text-orange-400" />
        <span>
          Agentic modes augment the system prompt and enable multi-step reasoning.
          The AI can call <code className="bg-muted px-0.5 rounded">ask_human</code> to pause
          and ask you questions mid-run.
        </span>
      </div>

      {/* Mode cards */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {MODES.map((mode) => {
          const isActive = config.mode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => onChange({ mode: mode.id })}
              className={cn(
                "w-full text-left rounded-lg border-2 p-3 transition-all",
                isActive
                  ? `${mode.color} bg-muted/30`
                  : "border-border hover:border-border/80 hover:bg-muted/10"
              )}
            >
              <div className="flex items-start gap-2.5">
                <span className="text-xl flex-shrink-0">{mode.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold">{mode.label}</span>
                    {mode.looping && (
                      <Badge variant="outline" className="text-[9px] px-1 h-3.5">
                        looping
                      </Badge>
                    )}
                    {isActive && (
                      <Badge className="text-[9px] px-1 h-3.5 bg-primary ml-auto">
                        active
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                    {mode.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Settings */}
      <div className="border-t p-3 space-y-4 bg-muted/5">
        {/* Max iterations — only for looping modes */}
        {activeMode.looping && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Max iterations</Label>
              <span className="text-xs font-mono text-muted-foreground">
                {config.maxIterations}
              </span>
            </div>
            <Slider
              min={2}
              max={20}
              step={1}
              value={[config.maxIterations]}
              onValueChange={([v]) => onChange({ maxIterations: v })}
              className="w-full"
            />
            <p className="text-[10px] text-muted-foreground">
              Maximum loop iterations before stopping automatically.
            </p>
          </div>
        )}

        {/* Show thoughts toggle */}
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-xs">Show reasoning blocks</Label>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Reveal &lt;thinking&gt; blocks as collapsible cards
            </p>
          </div>
          <Switch
            checked={config.showThoughts}
            onCheckedChange={(v) => onChange({ showThoughts: v })}
            className="scale-75 origin-right"
          />
        </div>

        {/* Auto ask human */}
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-xs">Enable ask_human tool</Label>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              AI can pause to ask you questions mid-loop
            </p>
          </div>
          <Switch
            checked={config.autoAskHuman}
            onCheckedChange={(v) => onChange({ autoAskHuman: v })}
            className="scale-75 origin-right"
          />
        </div>
      </div>

      {/* System prompt preview */}
      {config.mode !== "none" && (
        <div className="border-t px-3 py-2 bg-muted/5">
          <p className="text-[10px] text-muted-foreground font-medium mb-1">
            System prompt addition preview:
          </p>
          <div className="text-[10px] text-muted-foreground font-mono bg-muted rounded p-2 max-h-24 overflow-y-auto whitespace-pre-wrap">
            {AGENTIC_PROMPTS[config.mode]}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Exported system prompt additions ─────────────────────────────────────────

export const AGENTIC_PROMPTS: Record<AgenticMode, string> = {
  none: "",

  react: `You are running in **ReAct (Reason + Act) mode**.

Solve every problem by alternating between:
- **Thought**: Reason about the current state and what you need to find out
- **Action**: Call a tool, or use \`ask_human\` to get clarification from the user
- **Observation**: Process the result and plan your next move

Keep cycling Thought → Action → Observation until you can give a complete, confident answer.
Use \`ask_human\` whenever you need the user's preference, a decision, or information only they can provide.`,

  plan_execute: `You are running in **Plan-Execute mode**.

Begin EVERY response by writing a numbered action plan:

PLAN:
1. [First concrete step]
2. [Second step]
3. [Continue…]

Then execute each step in order. Mark steps as complete with ✅ as you finish them.
Use available tools to carry out each step. Call \`ask_human\` if any step requires user input or a decision before you can proceed.`,

  chain_of_thought: `Think through every problem step by step before answering.

Wrap ALL your reasoning in <thinking>…</thinking> tags:

<thinking>
[Your complete step-by-step reasoning, considering multiple angles, checking your work]
</thinking>

Then give your final, concise answer after the thinking block. Be thorough in your reasoning — identify assumptions, work through edge cases, verify your logic.`,

  tree_of_thought: `Explore this problem using **Tree of Thought** reasoning.

Structure your response as:

[Path A]: [Brief description and key steps of approach A]
[Path B]: [Brief description and key steps of approach B]
[Path C]: [Brief description and key steps of approach C]

[Evaluation]: Compare the paths — analyze pros, cons, and likelihood of success for each
[Selected Path]: Which path you choose and why
[Solution]: Full execution of the selected path, using tools as needed

Use <thinking>…</thinking> blocks to show your evaluation process.`,
};
