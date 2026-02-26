import React, { useEffect, useState } from "react";
import { useTools } from "@/contexts/ToolsContext";
import { getCategoryName } from "@/contexts/toolsData";
import { ToolGrid } from "@/components/ToolGrid";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import {
  Clock,
  ListChecks,
  FileText,
  BrainCircuit,
  Calendar,
  Timer,
  CheckSquare,
  AlarmClock,
  Brain,
  Focus,
  TimerReset,
  PanelTop,
  Trello,
  Copy,
  Check,
  BookOpen,
  GanttChart,
  Book,
  Kanban,
  Search,
  Star,
  Zap,
  Shield,
  Sparkles,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// Define productivity techniques with their details
interface ProductivityTechnique {
  name: string;
  description: string;
  steps: string;
  category: "time" | "task" | "focus" | "planning";
  icon: React.ReactElement;
  color: string;
}

const productivityTechniques: ProductivityTechnique[] = [
  // Time Management Techniques
  {
    name: "Pomodoro Technique",
    description: "Work in focused intervals with short breaks in between.",
    steps:
      "1. Choose a task\n2. Set a 25-minute timer\n3. Work until the timer rings\n4. Take a 5-minute break\n5. After 4 cycles, take a longer 15-30 minute break",
    category: "time",
    icon: <Timer className="h-8 w-8" />,
    color: "text-red-500",
  },
  {
    name: "Time Blocking",
    description: "Assign specific time blocks for different types of tasks.",
    steps:
      "1. Identify your most important tasks\n2. Assign specific time blocks to each task\n3. Create buffer time between blocks\n4. Review and adjust your schedule as needed",
    category: "time",
    icon: <AlarmClock className="h-8 w-8" />,
    color: "text-blue-500",
  },
  {
    name: "52/17 Rule",
    description: "Work for 52 minutes, then take a 17-minute break.",
    steps:
      "1. Focus intensely for 52 minutes\n2. Take a complete break for 17 minutes\n3. Repeat throughout your workday",
    category: "time",
    icon: <TimerReset className="h-8 w-8" />,
    color: "text-amber-500",
  },

  // Task Management Techniques
  {
    name: "Eisenhower Matrix",
    description: "Prioritize tasks based on urgency and importance.",
    steps:
      "1. Divide tasks into four quadrants:\n   - Urgent & Important: Do first\n   - Important but Not Urgent: Schedule\n   - Urgent but Not Important: Delegate\n   - Neither Urgent nor Important: Eliminate",
    category: "task",
    icon: <PanelTop className="h-8 w-8" />,
    color: "text-green-500",
  },
  {
    name: "Kanban Method",
    description: "Visualize workflow with columns for task stages.",
    steps:
      "1. Create columns for To Do, In Progress, and Done\n2. Add tasks as cards in the appropriate columns\n3. Move cards across columns as tasks progress\n4. Limit work-in-progress to avoid overwhelm",
    category: "task",
    icon: <Trello className="h-8 w-8" />,
    color: "text-purple-500",
  },
  {
    name: "1-3-5 Rule",
    description:
      "Plan to accomplish 1 big thing, 3 medium things, and 5 small things each day.",
    steps:
      "1. Identify 1 big task that will take the most time and energy\n2. Select 3 medium-sized tasks\n3. Add 5 small, quick tasks\n4. Focus on completing all 9 tasks in order of priority",
    category: "task",
    icon: <ListChecks className="h-8 w-8" />,
    color: "text-indigo-500",
  },

  // Focus Techniques
  {
    name: "Deep Work",
    description:
      "Eliminate distractions to focus intensely on cognitively demanding tasks.",
    steps:
      "1. Schedule deep work sessions in advance\n2. Eliminate all possible distractions\n3. Work on a single, challenging task\n4. Start with 1-hour sessions and gradually increase duration",
    category: "focus",
    icon: <Focus className="h-8 w-8" />,
    color: "text-cyan-500",
  },
  {
    name: "Mindful Monotasking",
    description: "Focus on one task at a time with full attention.",
    steps:
      "1. Choose one task to focus on\n2. Close all unrelated tabs and apps\n3. Put your phone away or in Do Not Disturb mode\n4. Work on the chosen task with complete attention\n5. Take a short break before moving to the next task",
    category: "focus",
    icon: <Brain className="h-8 w-8" />,
    color: "text-fuchsia-500",
  },
  {
    name: "Two-Minute Rule",
    description: "If a task takes less than two minutes, do it immediately.",
    steps:
      "1. When you encounter a new task, estimate how long it will take\n2. If it takes less than two minutes, do it right away\n3. If it takes longer, schedule it or add it to your task list",
    category: "focus",
    icon: <CheckSquare className="h-8 w-8" />,
    color: "text-emerald-500",
  },

  // Planning Techniques
  {
    name: "Weekly Review",
    description: "Review your week and plan for the next one.",
    steps:
      "1. Review completed and pending tasks from the current week\n2. Clear your inboxes and notes\n3. Review your goals and projects\n4. Plan your tasks and priorities for the upcoming week",
    category: "planning",
    icon: <Calendar className="h-8 w-8" />,
    color: "text-orange-500",
  },
  {
    name: "Bullet Journaling",
    description:
      "Analog system for tracking the past, organizing the present, and planning for the future.",
    steps:
      "1. Set up an index, future log, monthly log, and daily log\n2. Use bullets for tasks, events, and notes\n3. Migrate unfinished tasks to future logs\n4. Create collections for projects and goals",
    category: "planning",
    icon: <Book className="h-8 w-8" />,
    color: "text-rose-500",
  },
  {
    name: "Agile Personal Kanban",
    description: "Apply agile principles to personal task management.",
    steps:
      "1. Create a Kanban board with columns for Backlog, This Week, Today, In Progress, and Done\n2. Move tasks through the workflow\n3. Review and reflect on your progress regularly\n4. Adapt your process based on what you learn",
    category: "planning",
    icon: <Kanban className="h-8 w-8" />,
    color: "text-violet-500",
  },
];

const ProductivityPage: React.FC = () => {
  const { setFilterCategory, filteredTools } = useTools();
  const category = "productivity";
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("time");
  const [activeToolTab, setActiveToolTab] = useState<string>("all");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copyMessage, setCopyMessage] = useState<string>("");
  const [showCopyMessage, setShowCopyMessage] = useState(false);

  // Filter tools based on search query
  const productivityTools = filteredTools.filter(
    (tool) =>
      tool.category === "productivity" &&
      (tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Set the filter category when the component mounts
  useEffect(() => {
    setFilterCategory(category);

    // Set the document title
    document.title = getCategoryTitle();
  }, [setFilterCategory]);

  // Generate SEO title based on category
  const getCategoryTitle = () => {
    const categoryName = getCategoryName(category);
    return `${categoryName} - Free Online ${categoryName} Tools | ToolNames`;
  };

  // Handle copying technique steps
  const handleCopyTechnique = (
    technique: ProductivityTechnique,
    index: number
  ) => {
    // Copy the technique steps to clipboard
    navigator.clipboard.writeText(technique.steps);

    // Set the copied index for visual feedback
    setCopiedIndex(index);

    // Set copy message with the copied technique
    setCopyMessage(`Copied: ${technique.name} steps`);

    // Show the copy message
    setShowCopyMessage(true);

    // Reset the copied state after a delay
    setTimeout(() => {
      setCopiedIndex(null);
      setShowCopyMessage(false);
    }, 2000);
  };

  // Filter tools by subcategory
  const timeTools = filteredTools.filter(
    (tool) =>
      tool.url.includes("timer") ||
      tool.url.includes("pomodoro") ||
      tool.url.includes("clock")
  );

  const taskTools = filteredTools.filter(
    (tool) =>
      tool.url.includes("todo") ||
      tool.url.includes("kanban") ||
      tool.url.includes("list")
  );

  const focusTools = filteredTools.filter(
    (tool) =>
      tool.url.includes("focus") ||
      tool.url.includes("distraction") ||
      tool.url.includes("blocker")
  );

  const planningTools = filteredTools.filter(
    (tool) =>
      tool.url.includes("planner") ||
      tool.url.includes("calendar") ||
      tool.url.includes("scheduler")
  );

  // Get techniques by category
  const getTechniquesByCategory = (category: string) => {
    return productivityTechniques.filter(
      (technique) => technique.category === category
    );
  };

  return (
    <div className="space-y-12 pb-8">
      {/* Hero Section - Enhanced with modern design */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-purple-950/30 rounded-xl overflow-hidden">
        {/* Background decorative elements */}
        <div
          className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-400/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"
          aria-hidden="true"
        ></div>
        <div
          className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-400/20 to-transparent rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"
          aria-hidden="true"
        ></div>

        <div className="container py-16 px-4 md:px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-4">
                <Sparkles className="h-4 w-4 mr-2" />
                {productivityTools.length}+ Productivity Tools
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Boost Your Productivity
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Free tools to help you stay organized, manage your time, and get
                more done. All running in your browser with your data stored
                locally for complete privacy.
              </p>

              {/* Search Bar */}
              <div className="relative mb-8">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search productivity tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-3 text-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-blue-200 dark:border-blue-800 focus:border-blue-400 dark:focus:border-blue-600 rounded-lg shadow-sm"
                />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 text-center border border-blue-200/50 dark:border-blue-800/50">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    3+
                  </div>
                  <div className="text-sm text-muted-foreground">Time</div>
                </div>
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 text-center border border-indigo-200/50 dark:border-indigo-800/50">
                  <div className="flex items-center justify-center mb-2">
                    <ListChecks className="h-5 w-5 text-indigo-500" />
                  </div>
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    2+
                  </div>
                  <div className="text-sm text-muted-foreground">Tasks</div>
                </div>
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 text-center border border-purple-200/50 dark:border-purple-800/50">
                  <div className="flex items-center justify-center mb-2">
                    <Target className="h-5 w-5 text-purple-500" />
                  </div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    1+
                  </div>
                  <div className="text-sm text-muted-foreground">Focus</div>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center text-sm bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <Shield className="h-4 w-4 mr-3 text-green-500" />
                  <span>Privacy-First Design</span>
                </div>
                <div className="flex items-center text-sm bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <Zap className="h-4 w-4 mr-3 text-yellow-500" />
                  <span>Instant Access</span>
                </div>
                <div className="flex items-center text-sm bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <Star className="h-4 w-4 mr-3 text-blue-500" />
                  <span>Research-Backed Methods</span>
                </div>
                <div className="flex items-center text-sm bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <BrainCircuit className="h-4 w-4 mr-3 text-purple-500" />
                  <span>Focus Enhancement</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {/* Featured Productivity Tools */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Popular Tools</h3>
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    >
                      Most Used
                    </Badge>
                  </div>
                  <div className="space-y-4">
                    <Link
                      to="/productivity/pomodoro-timer"
                      className="block group"
                    >
                      <div className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50 group-hover:shadow-md transition-all">
                        <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3 mr-4">
                          <Clock className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            Pomodoro Timer
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Structured time management sessions
                          </p>
                        </div>
                        <div className="text-blue-500 group-hover:translate-x-1 transition-transform">
                          →
                        </div>
                      </div>
                    </Link>

                    <Link
                      to="/productivity/kanban-board"
                      className="block group"
                    >
                      <div className="flex items-center p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg border border-indigo-200/50 dark:border-indigo-800/50 group-hover:shadow-md transition-all">
                        <div className="bg-indigo-100 dark:bg-indigo-900/30 rounded-lg p-3 mr-4">
                          <ListChecks className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            Kanban Board
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Visual task management system
                          </p>
                        </div>
                        <div className="text-indigo-500 group-hover:translate-x-1 transition-transform">
                          →
                        </div>
                      </div>
                    </Link>

                    <Link
                      to="/productivity/markdown-notes"
                      className="block group"
                    >
                      <div className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200/50 dark:border-purple-800/50 group-hover:shadow-md transition-all">
                        <div className="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-3 mr-4">
                          <FileText className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            Markdown Notes
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Organized note-taking system
                          </p>
                        </div>
                        <div className="text-purple-500 group-hover:translate-x-1 transition-transform">
                          →
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Quick Productivity Types */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Focus Areas</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                      <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-sm font-medium">Time</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg border border-indigo-200/50 dark:border-indigo-800/50">
                      <ListChecks className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                      <div className="text-sm font-medium">Tasks</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200/50 dark:border-purple-800/50">
                      <BrainCircuit className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-sm font-medium">Focus</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-lg border border-pink-200/50 dark:border-pink-800/50">
                      <Calendar className="h-8 w-8 text-pink-600 mx-auto mb-2" />
                      <div className="text-sm font-medium">Planning</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Productivity Categories Section */}
      <section className="container">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Productivity Categories</h2>
          <p className="text-muted-foreground">
            Browse productivity tools by focus area and methodology
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-3 mb-4">
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="font-medium mb-2">Time Management</h3>
            <p className="text-sm text-muted-foreground">
              Timers, schedules, time blocking
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 rounded-full p-3 mb-4">
              <ListChecks className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="font-medium mb-2">Task Organization</h3>
            <p className="text-sm text-muted-foreground">
              Kanban, lists, habits
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full p-3 mb-4">
              <BrainCircuit className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="font-medium mb-2">Focus Enhancement</h3>
            <p className="text-sm text-muted-foreground">
              Deep work, distraction blocking
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-full p-3 mb-4">
              <Calendar className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="font-medium mb-2">Planning & Notes</h3>
            <p className="text-sm text-muted-foreground">
              Calendars, notes, goal tracking
            </p>
          </div>
        </div>
      </section>

      {/* Tools Grid Section with Enhanced Search */}
      <section>
        <div className="container">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  {searchQuery
                    ? `Search Results (${productivityTools.length})`
                    : "Productivity Tools"}
                </h2>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? `Found ${productivityTools.length} productivity tools matching "${searchQuery}"`
                    : "All tools run directly in your browser with no server dependencies. Your data stays on your device for complete privacy."}
                </p>
              </div>
              {searchQuery && (
                <Button
                  variant="outline"
                  onClick={() => setSearchQuery("")}
                  className="ml-4"
                >
                  Clear Search
                </Button>
              )}
            </div>
          </div>

          {searchQuery ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {productivityTools.map((tool) => (
                <Link
                  key={tool.id}
                  to={tool.url}
                  className="group block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600"
                >
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors">
                      <tool.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {tool.title}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {tool.description}
                      </p>
                      <div className="mt-3 flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                        Try it now →
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <Tabs
              defaultValue="all"
              value={activeToolTab}
              onValueChange={setActiveToolTab}
              className="space-y-6"
            >
              <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-gray-100 data-[state=active]:dark:bg-gray-800"
                >
                  All Tools
                </TabsTrigger>
                <TabsTrigger
                  value="time"
                  className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:dark:bg-blue-900/30 data-[state=active]:dark:text-blue-300"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Time
                </TabsTrigger>
                <TabsTrigger
                  value="tasks"
                  className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700 data-[state=active]:dark:bg-green-900/30 data-[state=active]:dark:text-green-300"
                >
                  <ListChecks className="h-4 w-4 mr-2" />
                  Tasks
                </TabsTrigger>
                <TabsTrigger
                  value="focus"
                  className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 data-[state=active]:dark:bg-purple-900/30 data-[state=active]:dark:text-purple-300"
                >
                  <BrainCircuit className="h-4 w-4 mr-2" />
                  Focus
                </TabsTrigger>
                <TabsTrigger
                  value="planning"
                  className="data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700 data-[state=active]:dark:bg-amber-900/30 data-[state=active]:dark:text-amber-300"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Planning
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <ToolGrid />
              </TabsContent>

              <TabsContent value="time">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {timeTools.map((tool) => (
                    <Link
                      key={tool.id}
                      to={tool.url}
                      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-2">
                          {React.createElement(tool.icon as LucideIcon, {
                            className: "h-6 w-6 text-blue-600",
                          })}
                        </div>
                        <div>
                          <h3 className="font-medium">{tool.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {tool.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="tasks">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {taskTools.map((tool) => (
                    <Link
                      key={tool.id}
                      to={tool.url}
                      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-2">
                          {React.createElement(tool.icon as LucideIcon, {
                            className: "h-6 w-6 text-green-600",
                          })}
                        </div>
                        <div>
                          <h3 className="font-medium">{tool.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {tool.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="focus">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {focusTools.map((tool) => (
                    <Link
                      key={tool.id}
                      to={tool.url}
                      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full p-2">
                          {React.createElement(tool.icon as LucideIcon, {
                            className: "h-6 w-6 text-purple-600",
                          })}
                        </div>
                        <div>
                          <h3 className="font-medium">{tool.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {tool.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="planning">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {planningTools.map((tool) => (
                    <Link
                      key={tool.id}
                      to={tool.url}
                      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="bg-amber-100 dark:bg-amber-900/30 rounded-full p-2">
                          {React.createElement(tool.icon as LucideIcon, {
                            className: "h-6 w-6 text-amber-600",
                          })}
                        </div>
                        <div>
                          <h3 className="font-medium">{tool.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {tool.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}

          {searchQuery && productivityTools.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No productivity tools found
              </h3>
              <p className="text-muted-foreground">
                Try searching for different terms or browse our productivity
                categories.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Productivity Techniques Section - Preserved and Enhanced */}
      <section className="bg-gray-50 dark:bg-gray-900/50 py-8 rounded-lg">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Productivity Techniques</h2>
              <p className="text-muted-foreground">
                Research-backed methods to improve your productivity and focus
              </p>
            </div>

            {/* Copy message toast */}
            {showCopyMessage && (
              <div className="fixed bottom-4 right-4 bg-black/70 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-in slide-in-from-bottom">
                {copyMessage}
              </div>
            )}
          </div>

          <Tabs
            defaultValue="time"
            className="space-y-6"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <TabsTrigger
                value="time"
                className={cn(
                  "data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:dark:bg-blue-900/30 data-[state=active]:dark:text-blue-300"
                )}
              >
                <Clock className="h-4 w-4 mr-2" />
                Time Management
              </TabsTrigger>
              <TabsTrigger
                value="task"
                className={cn(
                  "data-[state=active]:bg-green-50 data-[state=active]:text-green-700 data-[state=active]:dark:bg-green-900/30 data-[state=active]:dark:text-green-300"
                )}
              >
                <ListChecks className="h-4 w-4 mr-2" />
                Task Management
              </TabsTrigger>
              <TabsTrigger
                value="focus"
                className={cn(
                  "data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 data-[state=active]:dark:bg-purple-900/30 data-[state=active]:dark:text-purple-300"
                )}
              >
                <BrainCircuit className="h-4 w-4 mr-2" />
                Focus Techniques
              </TabsTrigger>
              <TabsTrigger
                value="planning"
                className={cn(
                  "data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700 data-[state=active]:dark:bg-amber-900/30 data-[state=active]:dark:text-amber-300"
                )}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Planning Methods
              </TabsTrigger>
            </TabsList>

            {["time", "task", "focus", "planning"].map((tabValue) => (
              <TabsContent key={tabValue} value={tabValue}>
                <div className="grid md:grid-cols-3 gap-6">
                  {getTechniquesByCategory(tabValue).map((technique, index) => (
                    <div
                      key={technique.name}
                      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border relative group hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center mb-4">
                        <div
                          className={`rounded-full p-2 mr-3 ${
                            tabValue === "time"
                              ? "bg-blue-100 dark:bg-blue-900/30"
                              : tabValue === "task"
                              ? "bg-green-100 dark:bg-green-900/30"
                              : tabValue === "focus"
                              ? "bg-purple-100 dark:bg-purple-900/30"
                              : "bg-amber-100 dark:bg-amber-900/30"
                          }`}
                        >
                          {technique.icon}
                        </div>
                        <h3 className="font-medium text-lg">
                          {technique.name}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        {technique.description}
                      </p>
                      <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-md text-sm">
                        {technique.steps.split("\n").map((step, i) => (
                          <p key={i} className="mb-1 last:mb-0">
                            {step}
                          </p>
                        ))}
                      </div>

                      {/* Copy button */}
                      <button
                        onClick={() => handleCopyTechnique(technique, index)}
                        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                        aria-label="Copy technique steps"
                      >
                        {copiedIndex === index ? (
                          <Check className="h-5 w-5 text-green-500" />
                        ) : (
                          <Copy className="h-5 w-5 text-gray-500" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Resource Section - Preserved */}
      <section>
        <div className="container px-4 md:px-6">
          <h2 className="text-2xl font-bold mb-6">Productivity Resources</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
              <div className="flex items-center mb-4">
                <BookOpen className="h-6 w-6 mr-3 text-blue-500" />
                <h3 className="font-medium text-lg">Recommended Reading</h3>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="pb-3 border-b">
                  <span className="font-medium">Deep Work</span> by Cal Newport
                  <p className="text-muted-foreground mt-1">
                    Rules for focused success in a distracted world
                  </p>
                </li>
                <li className="pb-3 border-b">
                  <span className="font-medium">Atomic Habits</span> by James
                  Clear
                  <p className="text-muted-foreground mt-1">
                    Small changes that lead to remarkable results
                  </p>
                </li>
                <li className="pb-3 border-b">
                  <span className="font-medium">Getting Things Done</span> by
                  David Allen
                  <p className="text-muted-foreground mt-1">
                    The art of stress-free productivity
                  </p>
                </li>
                <li>
                  <span className="font-medium">The One Thing</span> by Gary
                  Keller
                  <p className="text-muted-foreground mt-1">
                    Focus on what matters most for extraordinary results
                  </p>
                </li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
              <div className="flex items-center mb-4">
                <GanttChart className="h-6 w-6 mr-3 text-green-500" />
                <h3 className="font-medium text-lg">Quick Productivity Tips</h3>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="pb-3 border-b flex">
                  <span className="font-bold text-blue-500 mr-2">01.</span>
                  <p>
                    Tackle your most important task first thing in the morning
                  </p>
                </li>
                <li className="pb-3 border-b flex">
                  <span className="font-bold text-blue-500 mr-2">02.</span>
                  <p>
                    Use the "touch it once" principle for emails and messages
                  </p>
                </li>
                <li className="pb-3 border-b flex">
                  <span className="font-bold text-blue-500 mr-2">03.</span>
                  <p>Schedule breaks between tasks to prevent burnout</p>
                </li>
                <li className="pb-3 border-b flex">
                  <span className="font-bold text-blue-500 mr-2">04.</span>
                  <p>
                    Batch similar tasks together to minimize context switching
                  </p>
                </li>
                <li className="flex">
                  <span className="font-bold text-blue-500 mr-2">05.</span>
                  <p>End each day by planning your priorities for tomorrow</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductivityPage;
