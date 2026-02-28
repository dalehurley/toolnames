import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { X, Zap, Search, ExternalLink, Plus, Trash2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { CustomSkill } from "@/store/aiPlayground";

export interface AgentSkill {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  systemPromptAddition: string;
  enabledTools?: string[];
  tags: string[];
  author?: string;
}

// Curated built-in skills — inspired by agentskills.io concepts
export const BUILTIN_SKILLS: AgentSkill[] = [
  {
    id: "coding-expert",
    name: "Coding Expert",
    description: "Optimizes the AI for software development. Provides clean, well-commented code with explanations, best practices, and error handling.",
    category: "Development",
    icon: "💻",
    tags: ["code", "programming", "dev"],
    systemPromptAddition: `You are an expert software engineer. When writing code:
- Always use clean, readable code with meaningful variable names
- Include brief inline comments for non-obvious logic
- Consider edge cases and add appropriate error handling
- Suggest tests when relevant
- When asked to fix bugs, explain what caused the issue and how the fix resolves it`,
    enabledTools: ["calculator", "format_json", "test_regex"],
  },
  {
    id: "data-analyst",
    name: "Data Analyst",
    description: "Specializes in data analysis, statistics, and visualization. Structures output as tables and charts when possible.",
    category: "Analytics",
    icon: "📊",
    tags: ["data", "statistics", "analysis"],
    systemPromptAddition: `You are a skilled data analyst. When analyzing data:
- Present findings as structured tables (markdown format) when possible
- Include summary statistics (mean, median, range, etc.) where relevant
- Suggest appropriate visualization types
- Highlight patterns, anomalies, and key insights
- Use precise numerical language`,
    enabledTools: ["calculator", "unit_converter", "format_json"],
  },
  {
    id: "email-writer",
    name: "Email Writer",
    description: "Drafts professional emails in the correct format. Outputs emails with To/Subject/Body ready to send via mailto.",
    category: "Productivity",
    icon: "✉️",
    tags: ["email", "writing", "business"],
    systemPromptAddition: `You are a professional email writer. When drafting emails:
- Always format them with clear headers: To: [recipient], Subject: [subject], then the body
- Match the tone to the context (formal for business, friendly for personal)
- Keep emails concise and action-oriented
- End with an appropriate sign-off
- Format any draft email exactly as:
To: [email address or name]
Subject: [subject line]
[blank line]
[email body]`,
  },
  {
    id: "calendar-assistant",
    name: "Calendar & Scheduling",
    description: "Helps plan meetings and events in a structured format that auto-detects as calendar invites.",
    category: "Productivity",
    icon: "📅",
    tags: ["calendar", "meetings", "scheduling"],
    systemPromptAddition: `You are a scheduling assistant. When planning meetings or events:
- Always format events with: Title:, Date:, Time:, Location:, Description:
- Suggest optimal meeting times based on context
- Draft agenda items when creating meeting invites
- Consider time zones when scheduling international meetings`,
  },
  {
    id: "creative-writer",
    name: "Creative Writer",
    description: "Enhances creative writing with vivid descriptions, engaging narratives, and strong prose.",
    category: "Creative",
    icon: "✍️",
    tags: ["writing", "creative", "story"],
    systemPromptAddition: `You are a creative writing assistant with a flair for compelling narratives. When writing:
- Use vivid, sensory descriptions that bring scenes to life
- Vary sentence structure for rhythm and flow
- Develop characters with depth and authenticity
- Show rather than tell
- Suggest improvements when asked to review writing`,
  },
  {
    id: "document-writer",
    name: "Document Writer",
    description: "Produces well-structured documents with proper headings, sections, and formatting — ready for Word export.",
    category: "Productivity",
    icon: "📄",
    tags: ["document", "writing", "report"],
    systemPromptAddition: `You are a professional document writer. When creating documents:
- Use clear hierarchical structure with ## headings and ### subheadings
- Include an executive summary or introduction
- Use bullet points for lists and **bold** for key terms
- End with a conclusion or next steps section
- Write in a clear, professional tone suitable for business audiences`,
  },
  {
    id: "sql-expert",
    name: "SQL & Database Expert",
    description: "Specializes in SQL queries, database design, and performance optimization.",
    category: "Development",
    icon: "🗃️",
    tags: ["sql", "database", "query"],
    systemPromptAddition: `You are a database expert specializing in SQL and database design. When helping with databases:
- Write clear, well-formatted SQL with meaningful aliases
- Explain query logic and any non-obvious clauses
- Consider performance implications and suggest indexes when relevant
- Use CTEs for complex queries to improve readability
- Point out potential SQL injection vulnerabilities in user-provided code`,
    enabledTools: ["format_json"],
  },
  {
    id: "security-analyst",
    name: "Security Analyst",
    description: "Reviews code and systems for vulnerabilities. Explains CVEs, security patterns, and safe coding practices.",
    category: "Security",
    icon: "🔐",
    tags: ["security", "vulnerabilities", "pen-test"],
    systemPromptAddition: `You are a cybersecurity expert. When reviewing code or systems:
- Identify potential security vulnerabilities (OWASP Top 10, etc.)
- Explain the risk level and potential impact of each issue
- Provide secure alternatives and fixes
- Reference relevant CVEs or security standards when applicable
- Avoid providing actual exploits — focus on defense and remediation`,
    enabledTools: ["generate_password", "base64", "test_regex"],
  },
  {
    id: "teacher",
    name: "Patient Teacher",
    description: "Explains complex topics from the ground up with examples, analogies, and step-by-step breakdowns.",
    category: "Education",
    icon: "🎓",
    tags: ["education", "teaching", "explain"],
    systemPromptAddition: `You are a patient and skilled teacher. When explaining concepts:
- Start with the basics and build up gradually
- Use relatable analogies and real-world examples
- Break complex topics into clear numbered steps
- Check for understanding by offering to dive deeper
- Avoid jargon unless you explain it first`,
  },
  {
    id: "devops-engineer",
    name: "DevOps Engineer",
    description: "Specializes in CI/CD, Docker, Kubernetes, cloud infrastructure, and deployment automation.",
    category: "Development",
    icon: "⚙️",
    tags: ["devops", "docker", "kubernetes", "cloud"],
    systemPromptAddition: `You are a DevOps engineer with expertise in cloud infrastructure and CI/CD pipelines. When helping:
- Provide complete, working configuration files (Dockerfile, docker-compose, GitHub Actions, etc.)
- Explain infrastructure decisions and trade-offs
- Consider security best practices (least privilege, secrets management)
- Suggest monitoring and observability solutions
- Include health checks and graceful shutdown handling`,
    enabledTools: ["calculator", "format_json"],
  },
  {
    id: "product-manager",
    name: "Product Manager",
    description: "Helps with PRDs, user stories, feature specs, and product strategy.",
    category: "Business",
    icon: "🗂️",
    tags: ["product", "strategy", "prd"],
    systemPromptAddition: `You are an experienced product manager. When helping with product work:
- Structure PRDs with: Overview, Problem Statement, Goals, Non-goals, User Stories, Acceptance Criteria, Success Metrics
- Write user stories in the format: "As a [user], I want to [action] so that [benefit]"
- Think about edge cases and failure modes
- Consider the impact on different user segments
- Be crisp and opinionated — good PMs make decisions`,
  },
  {
    id: "math-tutor",
    name: "Math Tutor",
    description: "Solves math problems step by step. Uses the calculator tool automatically for precise computation.",
    category: "Education",
    icon: "🔢",
    tags: ["math", "calculus", "algebra"],
    systemPromptAddition: `You are a math tutor who excels at clear step-by-step solutions. When solving math problems:
- Show every step clearly, explaining the reasoning
- Use the calculator tool for numerical computations
- Write equations in a readable format
- Point out common mistakes students make with this type of problem
- Verify your answers`,
    enabledTools: ["calculator", "unit_converter"],
  },
];

interface AgentSkillsPanelProps {
  enabledSkillIds: string[];
  onToggleSkill: (skillId: string, enabled: boolean) => void;
  onClose: () => void;
  customSkills: CustomSkill[];
  onSaveCustomSkill: (skill: Omit<CustomSkill, "id" | "createdAt">) => string;
  onDeleteCustomSkill: (id: string) => void;
}

const EMPTY_FORM = { name: "", description: "", icon: "⚡", systemPromptAddition: "" };

export function AgentSkillsPanel({
  enabledSkillIds,
  onToggleSkill,
  onClose,
  customSkills,
  onSaveCustomSkill,
  onDeleteCustomSkill,
}: AgentSkillsPanelProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"builtin" | "custom">("builtin");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);

  const categories = Array.from(new Set(BUILTIN_SKILLS.map((s) => s.category)));

  const filtered = BUILTIN_SKILLS.filter((skill) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      skill.name.toLowerCase().includes(q) ||
      skill.description.toLowerCase().includes(q) ||
      skill.tags.some((t) => t.includes(q));
    const matchesCategory = !activeCategory || skill.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSaveCustom = () => {
    if (!form.name.trim() || !form.systemPromptAddition.trim()) {
      toast.error("Name and system prompt are required.");
      return;
    }
    if (editingId) {
      // Edit: delete old, re-save with same id won't work with genId — replace via update
      onDeleteCustomSkill(editingId);
    }
    const id = onSaveCustomSkill({
      name: form.name.trim(),
      description: form.description.trim(),
      icon: form.icon || "⚡",
      systemPromptAddition: form.systemPromptAddition.trim(),
    });
    if (!editingId) {
      onToggleSkill(id, true);
    }
    toast.success(editingId ? "Skill updated" : "Skill created and enabled");
    setForm(EMPTY_FORM);
    setShowForm(false);
    setEditingId(null);
  };

  const startEdit = (skill: CustomSkill) => {
    setForm({
      name: skill.name,
      description: skill.description,
      icon: skill.icon,
      systemPromptAddition: skill.systemPromptAddition,
    });
    setEditingId(skill.id);
    setShowForm(true);
  };

  return (
    <div className="flex flex-col h-full border-l bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/20">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-violet-500" />
          <span className="text-sm font-medium">Agent Skills</span>
          {enabledSkillIds.length > 0 && (
            <Badge variant="default" className="text-[10px] px-1.5 h-4 bg-violet-500">
              {enabledSkillIds.length} active
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <a
            href="https://agentskills.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-0.5"
            title="Browse more at agentskills.io"
          >
            <ExternalLink className="w-3 h-3" />
            agentskills.io
          </a>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex border-b">
        <button
          className={cn(
            "flex-1 py-1.5 text-[11px] font-medium transition-colors",
            activeTab === "builtin"
              ? "border-b-2 border-violet-500 text-violet-600 dark:text-violet-400"
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setActiveTab("builtin")}
        >
          Built-in
        </button>
        <button
          className={cn(
            "flex-1 py-1.5 text-[11px] font-medium transition-colors flex items-center justify-center gap-1",
            activeTab === "custom"
              ? "border-b-2 border-violet-500 text-violet-600 dark:text-violet-400"
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setActiveTab("custom")}
        >
          My Skills
          {customSkills.length > 0 && (
            <Badge variant="outline" className="text-[9px] px-1 h-3.5">{customSkills.length}</Badge>
          )}
        </button>
      </div>

      {activeTab === "builtin" && (
        <>
          {/* Search */}
          <div className="px-3 py-2 border-b bg-muted/10">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
              <Input
                placeholder="Search skills…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-6 h-7 text-xs"
              />
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              <button
                className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full border transition-colors",
                  !activeCategory ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted border-border"
                )}
                onClick={() => setActiveCategory(null)}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full border transition-colors",
                    activeCategory === cat ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted border-border"
                  )}
                  onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="px-3 py-1.5 text-[10px] text-muted-foreground bg-violet-50/30 dark:bg-violet-950/20 border-b">
            Skills enhance the AI's system prompt and optionally enable client-side tools.
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2 space-y-2">
              {filtered.map((skill) => {
                const isEnabled = enabledSkillIds.includes(skill.id);
                return (
                  <div
                    key={skill.id}
                    className={cn(
                      "rounded-lg border p-3 transition-colors",
                      isEnabled
                        ? "border-violet-400/60 bg-violet-50/30 dark:bg-violet-950/20"
                        : "hover:bg-muted/20"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-lg flex-shrink-0">{skill.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium">{skill.name}</span>
                          <Switch
                            checked={isEnabled}
                            onCheckedChange={(v) => {
                              onToggleSkill(skill.id, v);
                              toast.success(v ? `✓ ${skill.name} enabled` : `${skill.name} disabled`);
                            }}
                            className="scale-75 origin-right flex-shrink-0"
                          />
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                          {skill.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          <Badge variant="outline" className="text-[9px] px-1.5 h-3.5">
                            {skill.category}
                          </Badge>
                          {skill.enabledTools?.map((t) => (
                            <Badge key={t} variant="secondary" className="text-[9px] px-1.5 h-3.5">
                              🔧 {t}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <p className="text-xs text-center text-muted-foreground py-8">No skills found</p>
              )}
            </div>
          </ScrollArea>
        </>
      )}

      {activeTab === "custom" && (
        <>
          {!showForm && (
            <div className="px-3 py-2 border-b bg-muted/10 flex items-center justify-between">
              <p className="text-[10px] text-muted-foreground">
                Create personal skills with custom system prompts.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="h-6 text-[10px] gap-1"
                onClick={() => { setForm(EMPTY_FORM); setEditingId(null); setShowForm(true); }}
              >
                <Plus className="w-3 h-3" /> New Skill
              </Button>
            </div>
          )}

          {showForm && (
            <div className="px-3 py-3 border-b bg-muted/5 space-y-2.5">
              <p className="text-[11px] font-medium">{editingId ? "Edit skill" : "New skill"}</p>
              <div className="flex gap-2">
                <div className="w-12">
                  <Label className="text-[10px]">Icon</Label>
                  <Input
                    value={form.icon}
                    onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                    className="h-8 text-center text-base px-1"
                    maxLength={2}
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-[10px]">Name *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Python Expert"
                    className="h-8 text-xs"
                  />
                </div>
              </div>
              <div>
                <Label className="text-[10px]">Description</Label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="What does this skill do?"
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-[10px]">System prompt addition *</Label>
                <Textarea
                  value={form.systemPromptAddition}
                  onChange={(e) => setForm((f) => ({ ...f, systemPromptAddition: e.target.value }))}
                  placeholder="You are an expert in… When asked to…"
                  className="text-xs min-h-[80px] resize-none"
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="h-7 text-xs flex-1" onClick={handleSaveCustom}>
                  {editingId ? "Update" : "Create"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM); }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <ScrollArea className="flex-1">
            <div className="p-2 space-y-2">
              {customSkills.length === 0 && !showForm && (
                <div className="py-12 text-center">
                  <p className="text-xs text-muted-foreground mb-2">No custom skills yet</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs gap-1"
                    onClick={() => { setForm(EMPTY_FORM); setEditingId(null); setShowForm(true); }}
                  >
                    <Plus className="w-3 h-3" /> Create your first skill
                  </Button>
                </div>
              )}
              {customSkills.map((skill) => {
                const isEnabled = enabledSkillIds.includes(skill.id);
                return (
                  <div
                    key={skill.id}
                    className={cn(
                      "rounded-lg border p-3 transition-colors",
                      isEnabled
                        ? "border-violet-400/60 bg-violet-50/30 dark:bg-violet-950/20"
                        : "hover:bg-muted/20"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-lg flex-shrink-0">{skill.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium flex-1">{skill.name}</span>
                          <button
                            className="text-muted-foreground hover:text-foreground"
                            onClick={() => startEdit(skill)}
                            title="Edit"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => {
                              onDeleteCustomSkill(skill.id);
                              toast.success("Skill deleted");
                            }}
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                          <Switch
                            checked={isEnabled}
                            onCheckedChange={(v) => {
                              onToggleSkill(skill.id, v);
                              toast.success(v ? `✓ ${skill.name} enabled` : `${skill.name} disabled`);
                            }}
                            className="scale-75 origin-right flex-shrink-0"
                          />
                        </div>
                        {skill.description && (
                          <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                            {skill.description}
                          </p>
                        )}
                        <Badge variant="outline" className="text-[9px] px-1.5 h-3.5 mt-1.5">
                          Custom
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </>
      )}

      {enabledSkillIds.length > 0 && (
        <div className="px-3 py-2 border-t bg-muted/10 text-[11px] text-muted-foreground">
          <span className="font-medium text-foreground">{enabledSkillIds.length} skill{enabledSkillIds.length !== 1 ? "s" : ""} active</span>
          {" — "}system prompt automatically adjusted for new messages.
        </div>
      )}
    </div>
  );
}
