import { useState, useMemo } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PROVIDERS, TAG_LABELS, ModelTag } from "@/providers/ai";
import { useAIPlaygroundStore } from "@/store/aiPlayground";
import { ChevronDown, Search } from "lucide-react";

export function ModelSelector() {
  const { settings, updateSettings, cachedModels, getActiveConversation } = useAIPlaygroundStore();
  const [providerOpen, setProviderOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [modelSearch, setModelSearch] = useState("");

  const currentProvider = PROVIDERS.find((p) => p.id === settings.selectedProviderId);

  // Merge hardcoded + cached models
  const availableModels = useMemo(() => {
    const cached = cachedModels[settings.selectedProviderId] || [];
    const hardcoded = currentProvider?.hardcodedModels || [];
    const allIds = new Set([...hardcoded.map((m) => m.id), ...cached.map((m) => m.id)]);
    return Array.from(allIds).map((id) => {
      const hc = hardcoded.find((m) => m.id === id);
      const cc = cached.find((m) => m.id === id);
      return hc || cc || { id, name: id, tags: [] };
    });
  }, [currentProvider, cachedModels, settings.selectedProviderId]);

  const filteredModels = useMemo(() => {
    if (!modelSearch) return availableModels;
    const q = modelSearch.toLowerCase();
    return availableModels.filter(
      (m) => m.id.toLowerCase().includes(q) || m.name.toLowerCase().includes(q)
    );
  }, [availableModels, modelSearch]);

  const currentModel = availableModels.find((m) => m.id === settings.selectedModelId);

  // Context window usage estimation
  const contextWindow = currentModel?.contextWindow ?? 0;
  const conversation = getActiveConversation();
  const usedTokens = useMemo(() => {
    if (!conversation) return 0;
    return conversation.messages.reduce((acc, m) => {
      const text = typeof m.content === "string" ? m.content : JSON.stringify(m.content);
      return acc + Math.ceil(text.length / 4);
    }, 0);
  }, [conversation]);

  const contextPct = contextWindow > 0 ? Math.min(100, (usedTokens / contextWindow) * 100) : 0;

  const selectProvider = (providerId: string) => {
    const provider = PROVIDERS.find((p) => p.id === providerId);
    if (!provider) return;
    const firstModel = provider.hardcodedModels[0];
    updateSettings({ selectedProviderId: providerId, selectedModelId: firstModel?.id || "" });
    setProviderOpen(false);
  };

  const selectModel = (modelId: string) => {
    updateSettings({ selectedModelId: modelId });
    setModelOpen(false);
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        {/* Provider selector */}
        <DropdownMenu open={providerOpen} onOpenChange={setProviderOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1 text-xs h-8">
              <span>{currentProvider?.logoChar}</span>
              <span className="hidden sm:inline">{currentProvider?.name}</span>
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52">
            <DropdownMenuLabel className="text-xs text-muted-foreground">Select Provider</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {PROVIDERS.map((p) => (
              <DropdownMenuItem key={p.id} onClick={() => selectProvider(p.id)} className="text-sm">
                <span className="mr-2 text-base">{p.logoChar}</span>
                {p.name}
                {p.id === settings.selectedProviderId && (
                  <span className="ml-auto text-primary">✓</span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Model selector */}
        <DropdownMenu
          open={modelOpen}
          onOpenChange={(o) => {
            setModelOpen(o);
            if (!o) setModelSearch("");
          }}
        >
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1 text-xs h-8 max-w-[200px]">
              <span className="truncate">
                {currentModel?.name || settings.selectedModelId || "Select model"}
              </span>
              <ChevronDown className="w-3 h-3 flex-shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-72 p-0">
            <div className="p-2 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                <Input
                  placeholder="Search models..."
                  value={modelSearch}
                  onChange={(e) => setModelSearch(e.target.value)}
                  className="pl-7 h-7 text-xs"
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {filteredModels.map((model) => (
                <DropdownMenuItem
                  key={model.id}
                  onClick={() => selectModel(model.id)}
                  className="flex-col items-start gap-0.5 py-2"
                >
                  <div className="flex items-center w-full">
                    <span className="text-sm flex-1 truncate">{model.name || model.id}</span>
                    {model.id === settings.selectedModelId && (
                      <span className="text-primary flex-shrink-0">✓</span>
                    )}
                  </div>
                  {model.tags && model.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {model.tags.slice(0, 4).map((tag: ModelTag) => (
                        <Badge key={tag} variant="outline" className="text-[10px] px-1 py-0 h-4">
                          {TAG_LABELS[tag]?.split(" ")[0]} {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {model.note && (
                    <span className="text-xs text-muted-foreground italic">{model.note}</span>
                  )}
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Context window progress bar */}
      {contextWindow > 0 && usedTokens > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5 cursor-default pl-0.5">
              <Progress
                value={contextPct}
                className={`h-1 w-28 ${
                  contextPct > 85
                    ? "[&>div]:bg-red-500"
                    : contextPct > 65
                    ? "[&>div]:bg-yellow-500"
                    : ""
                }`}
              />
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                ~{usedTokens.toLocaleString()}&thinsp;/&thinsp;{(contextWindow / 1000).toFixed(0)}k ctx
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            ~{contextPct.toFixed(1)}% of {contextWindow.toLocaleString()}-token context window used
            {contextPct > 85 && " — approaching limit!"}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
