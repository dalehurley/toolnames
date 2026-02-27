import React, { useEffect, useState } from "react";
import { useTools } from "@/contexts/ToolsContext";
import { availableTools } from "@/contexts/toolsData";
import { Link } from "react-router-dom";
import {
  Globe,
  Mic,
  MapPin,
  Clipboard,
  Clapperboard,
  Bell,
  ArrowRight,
  Shield,
  Zap,
  Search,
  Sparkles,
  Code2,
  Cpu,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const HTML5APIsPage: React.FC = () => {
  const { setFilterCategory } = useTools();
  const [searchQuery, setSearchQuery] = useState("");

  const html5Tools = availableTools
    .filter(
      (tool) =>
        tool.category === "html5-apis" &&
        (tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  useEffect(() => {
    setFilterCategory("all");
    document.title =
      "HTML5 API Tools - Browser-Based Demos & Utilities | ToolNames";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Explore 15+ interactive tools powered by modern HTML5 APIs: Web Audio, Geolocation, MediaRecorder, Canvas, Notifications, and more. All run locally in your browser."
      );
    }
  }, [setFilterCategory]);

  const apiHighlights = [
    {
      icon: Mic,
      label: "Web Audio API",
      color: "indigo",
      desc: "Analyze and generate audio waveforms",
    },
    {
      icon: MapPin,
      label: "Geolocation API",
      color: "emerald",
      desc: "Access your precise location",
    },
    {
      icon: Clipboard,
      label: "Clipboard API",
      color: "violet",
      desc: "Read and write clipboard contents",
    },
    {
      icon: Clapperboard,
      label: "MediaRecorder API",
      color: "rose",
      desc: "Record audio, video, and screen",
    },
    {
      icon: Bell,
      label: "Notifications API",
      color: "amber",
      desc: "Build and schedule browser notifications",
    },
    {
      icon: Globe,
      label: "PWA & Manifest",
      color: "cyan",
      desc: "Generate Progressive Web App configs",
    },
  ];

  return (
    <div className="space-y-12 pb-8">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-cyan-50 via-indigo-50 to-violet-100 dark:from-cyan-950/30 dark:via-indigo-950/20 dark:to-violet-950/30 rounded-xl overflow-hidden">
        <div
          className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-cyan-400/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-violet-400/20 to-transparent rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"
          aria-hidden="true"
        />

        <div className="container py-16 px-4 md:px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 text-sm font-medium mb-4">
                <Sparkles className="h-4 w-4 mr-2" />
                {html5Tools.length}+ HTML5 API Tools — Newly Added
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Modern Browser APIs, Explored
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Interact with cutting-edge HTML5 APIs directly in your browser.
                From audio analysis to device sensors, geolocation to PWA
                generators — all tools run locally with no server uploads.
              </p>

              {/* Search */}
              <div className="relative mb-8">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search HTML5 API tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-3 text-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-cyan-200 dark:border-cyan-800 focus:border-cyan-400 dark:focus:border-cyan-600 rounded-lg shadow-sm"
                />
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center text-sm bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <Shield className="h-4 w-4 mr-3 text-green-500 shrink-0" />
                  <span>100% Client-Side — No Data Uploaded</span>
                </div>
                <div className="flex items-center text-sm bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <Zap className="h-4 w-4 mr-3 text-yellow-500 shrink-0" />
                  <span>Real Browser API Demos</span>
                </div>
                <div className="flex items-center text-sm bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <Code2 className="h-4 w-4 mr-3 text-indigo-500 shrink-0" />
                  <span>Developer-Focused Utilities</span>
                </div>
                <div className="flex items-center text-sm bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <Cpu className="h-4 w-4 mr-3 text-cyan-500 shrink-0" />
                  <span>Works Offline After Load</span>
                </div>
              </div>
            </div>

            {/* API Highlights Grid */}
            <div className="grid grid-cols-2 gap-4">
              {apiHighlights.map(({ icon: Icon, label, color, desc }) => (
                <div
                  key={label}
                  className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-5 flex flex-col items-center text-center border border-${color}-200/50 dark:border-${color}-800/30 hover:shadow-md transition-all`}
                >
                  <div
                    className={`bg-${color}-100 dark:bg-${color}-900/30 rounded-full p-3 mb-3`}
                  >
                    <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{label}</h3>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Badges */}
      <section className="container">
        <div className="flex flex-wrap gap-2 mb-2">
          <Badge variant="secondary" className="text-sm">
            <Shield className="h-3 w-3 mr-1" />
            Privacy-First
          </Badge>
          <Badge variant="secondary" className="text-sm">
            <Cpu className="h-3 w-3 mr-1" />
            Real Browser APIs
          </Badge>
          <Badge variant="secondary" className="text-sm">
            <Zap className="h-3 w-3 mr-1" />
            No Installation Needed
          </Badge>
          <Badge
            variant="outline"
            className="text-sm border-cyan-300 text-cyan-600 dark:text-cyan-400"
          >
            Newly Added
          </Badge>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="container">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">
            {searchQuery
              ? `Results (${html5Tools.length})`
              : "All HTML5 API Tools"}
          </h2>
          <p className="text-muted-foreground">
            {searchQuery
              ? `Found ${html5Tools.length} tools matching "${searchQuery}"`
              : "Interactive demos powered by modern browser APIs. No plugins or extensions required."}
          </p>
        </div>

        {html5Tools.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">No tools found</h3>
            <p className="text-muted-foreground">
              Try different search terms.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {html5Tools.map((tool) => (
              <Link
                key={tool.id}
                to={tool.url}
                className="group block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200 hover:border-cyan-300 dark:hover:border-cyan-600"
                aria-label={`Open ${tool.title} tool`}
              >
                <div className="flex items-start space-x-4">
                  <div className="bg-cyan-100 dark:bg-cyan-900/30 rounded-lg p-3 group-hover:bg-cyan-200 dark:group-hover:bg-cyan-800/50 transition-colors shrink-0">
                    <tool.icon className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                      {tool.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {tool.description}
                    </p>
                    <div className="mt-3 flex items-center text-cyan-600 dark:text-cyan-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                      Try it now <ArrowRight className="h-4 w-4 ml-1" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Info Section */}
      <section className="bg-gray-50 dark:bg-gray-900/50 py-8 rounded-lg">
        <div className="container px-4 md:px-6">
          <h2 className="text-2xl font-bold mb-6">About HTML5 API Tools</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
              <h3 className="font-medium mb-3 flex items-center">
                <Globe className="h-5 w-5 mr-2 text-cyan-500" />
                What are HTML5 APIs?
              </h3>
              <p className="text-sm text-muted-foreground">
                HTML5 APIs are built-in browser interfaces that let web
                applications access device hardware, sensors, and platform
                features — like microphone, camera, GPS, and notifications —
                without any plugins.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
              <h3 className="font-medium mb-3 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-green-500" />
                Privacy & Permissions
              </h3>
              <p className="text-sm text-muted-foreground">
                Sensitive APIs like Geolocation and Microphone require explicit
                browser permission. All data accessed through these tools stays
                local — nothing is sent to any server.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
              <h3 className="font-medium mb-3 flex items-center">
                <Code2 className="h-5 w-5 mr-2 text-indigo-500" />
                For Developers
              </h3>
              <p className="text-sm text-muted-foreground">
                These tools are great for learning how browser APIs work,
                testing device capabilities, debugging, and prototyping
                features before integrating them into your own projects.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HTML5APIsPage;
