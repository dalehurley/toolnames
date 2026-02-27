import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, X, BookOpen, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Prompt {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: string;
  tags: string[];
}

const PROMPT_LIBRARY: Prompt[] = [
  {
    id: "1",
    title: "Senior Code Reviewer",
    description: "Review code for bugs, performance, and best practices",
    prompt:
      "You are a senior software engineer. Review the following code for: (1) bugs and edge cases, (2) performance issues, (3) security vulnerabilities, (4) readability and maintainability. Provide specific, actionable feedback with code examples where helpful.",
    category: "Coding",
    tags: ["review", "quality"],
  },
  {
    id: "2",
    title: "Explain Like I'm 5",
    description: "Explain complex topics in simple terms",
    prompt:
      "Explain the following concept as if I'm 5 years old, using simple analogies and avoiding technical jargon. Then provide a slightly more technical explanation for someone with basic knowledge.",
    category: "Learning",
    tags: ["explain", "simple"],
  },
  {
    id: "3",
    title: "Socratic Teacher",
    description: "Guide learning through questions, not answers",
    prompt:
      "You are a Socratic teacher. Instead of giving direct answers, guide me to the solution through thoughtful questions. Help me discover the answer myself. If I'm completely stuck, provide hints rather than full solutions.",
    category: "Learning",
    tags: ["teaching", "questions"],
  },
  {
    id: "4",
    title: "Technical Documentation Writer",
    description: "Write clear, structured technical documentation",
    prompt:
      "You are a technical writer. Write clear, concise documentation for the following. Include: overview, prerequisites, step-by-step instructions, code examples, common pitfalls, and a troubleshooting section. Use markdown formatting.",
    category: "Writing",
    tags: ["docs", "technical"],
  },
  {
    id: "5",
    title: "Devil's Advocate",
    description: "Challenge your ideas and find weaknesses",
    prompt:
      "Play devil's advocate on the following idea or argument. Find the strongest possible counterarguments, identify potential weaknesses, consider failure modes, and point out assumptions that might not hold. Be thorough but fair.",
    category: "Analysis",
    tags: ["critical", "debate"],
  },
  {
    id: "6",
    title: "SQL Query Optimizer",
    description: "Analyze and optimize SQL queries",
    prompt:
      "You are a database performance expert. Analyze the following SQL query for: (1) correctness, (2) performance optimizations (indexes, joins, subqueries), (3) potential issues with large datasets. Provide an optimized version with explanations.",
    category: "Coding",
    tags: ["sql", "database", "performance"],
  },
  {
    id: "7",
    title: "System Design Interviewer",
    description: "Practice system design interview questions",
    prompt:
      "You are a system design interviewer at a top tech company. Guide me through designing a scalable system. Ask clarifying questions, probe my assumptions, discuss trade-offs, and provide feedback on my design decisions. Start with a high-level design and dive into specific components.",
    category: "Interview Prep",
    tags: ["system-design", "interview"],
  },
  {
    id: "8",
    title: "Bug Detective",
    description: "Methodically diagnose and fix bugs",
    prompt:
      "You are a debugging expert. Methodically analyze the following bug: (1) reproduce and understand the symptoms, (2) form hypotheses about root causes, (3) suggest diagnostic steps, (4) propose fixes with explanation. Think step by step.",
    category: "Coding",
    tags: ["debug", "troubleshoot"],
  },
  {
    id: "9",
    title: "Concise Summarizer",
    description: "Summarize long content into key points",
    prompt:
      "Summarize the following content. Provide: (1) a one-sentence TL;DR, (2) 3-5 key bullet points, (3) any important caveats or nuances. Be concise and prioritize the most important information.",
    category: "Writing",
    tags: ["summary", "tldr"],
  },
  {
    id: "10",
    title: "API Design Reviewer",
    description: "Review REST API design for best practices",
    prompt:
      "You are an API design expert. Review the following API design for: (1) RESTful best practices, (2) naming conventions, (3) error handling, (4) versioning, (5) security considerations. Suggest improvements with examples.",
    category: "Coding",
    tags: ["api", "rest", "design"],
  },
  {
    id: "11",
    title: "Regex Generator",
    description: "Generate and explain regular expressions",
    prompt:
      "Generate a regular expression for the following pattern. Provide: (1) the regex itself, (2) a step-by-step explanation of each part, (3) test cases that match and don't match, (4) any edge cases to be aware of.",
    category: "Coding",
    tags: ["regex", "patterns"],
  },
  {
    id: "12",
    title: "Email Tone Polisher",
    description: "Rewrite emails to be professional and clear",
    prompt:
      "Rewrite the following email to be professional, clear, and appropriately concise. Maintain the core message but improve tone, structure, and clarity. Provide two versions: one formal and one more conversational.",
    category: "Writing",
    tags: ["email", "professional"],
  },
  {
    id: "13",
    title: "Data Structure Advisor",
    description: "Choose the right data structure for your problem",
    prompt:
      "Given the following problem or use case, recommend the most appropriate data structure(s). Explain the trade-offs between options, time/space complexity for key operations, and provide a brief implementation example.",
    category: "Coding",
    tags: ["data-structures", "algorithms"],
  },
  {
    id: "14",
    title: "PRD Writer",
    description: "Write a product requirements document",
    prompt:
      "Write a Product Requirements Document (PRD) for the following feature or product. Include: executive summary, problem statement, goals and non-goals, user stories, functional requirements, success metrics, and open questions.",
    category: "Product",
    tags: ["prd", "product", "requirements"],
  },
  {
    id: "15",
    title: "Test Case Generator",
    description: "Generate comprehensive test cases",
    prompt:
      "Generate comprehensive test cases for the following function or feature. Include: happy path tests, edge cases, error cases, boundary conditions, and performance considerations. Use the AAA (Arrange-Act-Assert) pattern.",
    category: "Coding",
    tags: ["testing", "qa"],
  },
  {
    id: "16",
    title: "Interview Question Crafter",
    description: "Generate behavioral interview questions",
    prompt:
      "Generate 10 behavioral interview questions for the following role or skill set. For each question, include: the competency being assessed, what a strong answer looks like, and follow-up probing questions.",
    category: "Interview Prep",
    tags: ["interview", "hiring", "behavioral"],
  },
  {
    id: "17",
    title: "Architecture Decision Record",
    description: "Document technical architecture decisions",
    prompt:
      "Write an Architecture Decision Record (ADR) for the following technical decision. Include: title, status, context, decision, consequences (positive and negative), and alternatives considered.",
    category: "Coding",
    tags: ["architecture", "adr", "documentation"],
  },
  {
    id: "18",
    title: "Creative Brainstormer",
    description: "Generate creative ideas without judgment",
    prompt:
      "Generate 20 creative ideas for the following challenge or problem. Think divergently — include wild, unconventional ideas alongside practical ones. Don't filter ideas by feasibility. Then identify the 3 most promising and explain why.",
    category: "Creative",
    tags: ["brainstorm", "ideas", "creative"],
  },
];

const CATEGORIES = ["All", ...Array.from(new Set(PROMPT_LIBRARY.map((p) => p.category)))];

interface PromptLibraryProps {
  onUse: (prompt: string) => void;
  onClose: () => void;
}

export function PromptLibrary({ onUse, onClose }: PromptLibraryProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return PROMPT_LIBRARY.filter((p) => {
      const matchesCat = category === "All" || p.category === category;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.includes(q));
      return matchesCat && matchesSearch;
    });
  }, [search, category]);

  const handleCopy = async (prompt: Prompt) => {
    await navigator.clipboard.writeText(prompt.prompt);
    setCopiedId(prompt.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full border-l bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/20">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Prompt Library</span>
          <Badge variant="outline" className="text-[10px] px-1.5 h-4">
            {filtered.length}
          </Badge>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Search */}
      <div className="px-3 pt-2 pb-1.5 border-b space-y-1.5">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          <Input
            placeholder="Search prompts…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-6 h-7 text-xs"
          />
          {search && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setSearch("")}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Category chips */}
        <div className="flex gap-1 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "text-[10px] px-2 py-0.5 rounded-full border transition-colors",
                category === cat
                  ? "bg-primary text-primary-foreground border-primary"
                  : "hover:bg-muted border-transparent"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Prompt list */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1.5">
          {filtered.map((prompt) => (
            <div
              key={prompt.id}
              className="group rounded-lg border p-2.5 hover:border-primary/40 hover:bg-muted/30 transition-colors cursor-default"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-xs font-medium truncate">{prompt.title}</span>
                    <Badge variant="outline" className="text-[9px] px-1 h-3.5 flex-shrink-0">
                      {prompt.category}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2">
                    {prompt.description}
                  </p>
                  <div className="flex gap-1 mt-1.5 flex-wrap">
                    {prompt.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] px-1.5 py-0 rounded bg-muted text-muted-foreground"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="default"
                  className="h-6 text-[10px] px-2 flex-1"
                  onClick={() => onUse(prompt.prompt)}
                >
                  Use as System Prompt
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 text-[10px] px-2"
                  onClick={() => handleCopy(prompt)}
                  title="Copy to clipboard"
                >
                  {copiedId === prompt.id ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-6">No prompts match your search</p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
