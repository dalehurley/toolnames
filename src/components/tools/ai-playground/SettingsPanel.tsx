import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PROVIDERS } from "@/providers/ai";
import { useAIPlaygroundStore } from "@/store/aiPlayground";
import { useStream } from "@/hooks/useStream";
import { toast } from "sonner";
import { ExternalLink, Check, X, Loader2, Eye, EyeOff, Trash2 } from "lucide-react";

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

type KeyStatus = "idle" | "testing" | "valid" | "invalid";

export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const { getKey, setKey, sessionUsage } = useAIPlaygroundStore();
  const { testConnection, fetchModels, } = useStream();
  const setCachedModels = useAIPlaygroundStore((s) => s.setCachedModels);

  const [keyInputs, setKeyInputs] = useState<Record<string, string>>({});
  const [keyStatuses, setKeyStatuses] = useState<Record<string, KeyStatus>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  const getDisplayKey = (providerId: string) => {
    if (providerId in keyInputs) return keyInputs[providerId];
    return getKey(providerId);
  };

  const handleKeyChange = (providerId: string, value: string) => {
    setKeyInputs((prev) => ({ ...prev, [providerId]: value }));
    // Reset status on change
    setKeyStatuses((prev) => ({ ...prev, [providerId]: "idle" }));
  };

  const handleSave = useCallback(
    async (providerId: string) => {
      const key = keyInputs[providerId] ?? getKey(providerId);
      setKey(providerId, key);
      setKeyStatuses((prev) => ({ ...prev, [providerId]: "testing" }));

      const provider = PROVIDERS.find((p) => p.id === providerId);
      if (!provider?.requiresKey || !key) {
        setKeyStatuses((prev) => ({ ...prev, [providerId]: "idle" }));
        toast.success("Key saved");
        return;
      }

      try {
        const valid = await testConnection(providerId, key);
        setKeyStatuses((prev) => ({
          ...prev,
          [providerId]: valid ? "valid" : "invalid",
        }));
        if (valid) {
          toast.success(`${provider.name} connected!`);
          // Try fetching models
          const models = await fetchModels(providerId, key);
          if (models && models.length > 0) {
            setCachedModels(providerId, models);
          }
        } else {
          toast.error(`Invalid API key for ${provider.name}`);
        }
      } catch {
        setKeyStatuses((prev) => ({ ...prev, [providerId]: "invalid" }));
      }
    },
    [keyInputs, getKey, setKey, testConnection, fetchModels, setCachedModels]
  );

  const handleClear = (providerId: string) => {
    setKey(providerId, "");
    setKeyInputs((prev) => ({ ...prev, [providerId]: "" }));
    setKeyStatuses((prev) => ({ ...prev, [providerId]: "idle" }));
    toast.success("Key cleared");
  };

  const totalUsage = Object.values(sessionUsage).reduce((a, b) => a + b, 0);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings — AI Playground</DialogTitle>
        </DialogHeader>

        {/* Privacy banner */}
        <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3 text-sm text-green-800 dark:text-green-200">
          🔒 <strong>Your data stays local.</strong> API keys and conversations
          are stored only in your browser&apos;s localStorage. No data is sent to
          toolnames.com servers. You connect directly to AI providers using your
          own keys.
        </div>

        <Tabs defaultValue="openai">
          <TabsList className="flex-wrap h-auto gap-1">
            {PROVIDERS.map((provider) => {
              const savedKey = getKey(provider.id);
              const status = keyStatuses[provider.id];
              return (
                <TabsTrigger key={provider.id} value={provider.id} className="relative">
                  <span className="mr-1">{provider.logoChar}</span>
                  {provider.name}
                  {status === "valid" && (
                    <span className="ml-1 w-2 h-2 rounded-full bg-green-500 inline-block" />
                  )}
                  {status === "invalid" && (
                    <span className="ml-1 w-2 h-2 rounded-full bg-red-500 inline-block" />
                  )}
                  {status !== "valid" && status !== "invalid" && savedKey && (
                    <span className="ml-1 w-2 h-2 rounded-full bg-blue-400 inline-block" />
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {PROVIDERS.map((provider) => {
            const displayKey = getDisplayKey(provider.id);
            const status = keyStatuses[provider.id] || "idle";
            const isVisible = showKeys[provider.id];

            return (
              <TabsContent key={provider.id} value={provider.id} className="space-y-4 mt-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{provider.logoChar}</span>
                  <div>
                    <h3 className="font-semibold">{provider.name}</h3>
                    <a
                      href={provider.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                    >
                      Get API Key <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  {status === "valid" && <Badge className="bg-green-500 ml-auto">Connected</Badge>}
                  {status === "invalid" && <Badge className="bg-red-500 ml-auto">Invalid Key</Badge>}
                  {status === "testing" && (
                    <Badge className="ml-auto" variant="outline">
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Testing...
                    </Badge>
                  )}
                </div>

                {provider.requiresKey ? (
                  <div className="space-y-2">
                    <Label>{provider.keyLabel}</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          type={isVisible ? "text" : "password"}
                          placeholder="sk-..."
                          value={displayKey}
                          onChange={(e) => handleKeyChange(provider.id, e.target.value)}
                          className="pr-10 font-mono text-sm"
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() =>
                            setShowKeys((prev) => ({
                              ...prev,
                              [provider.id]: !prev[provider.id],
                            }))
                          }
                        >
                          {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <Button
                        onClick={() => handleSave(provider.id)}
                        disabled={status === "testing"}
                        size="sm"
                      >
                        {status === "testing" ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Test & Save"
                        )}
                      </Button>
                      {displayKey && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleClear(provider.id)}
                          title="Clear key"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Keys are stored locally using XOR obfuscation and never sent to our servers.
                    </p>

                    {status === "valid" && (
                      <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                        <Check className="w-4 h-4" /> Connection verified
                      </div>
                    )}
                    {status === "invalid" && (
                      <div className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                        <X className="w-4 h-4" /> Connection failed — check your key
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground bg-muted rounded p-3">
                    {provider.name} doesn&apos;t require an API key. Make sure Ollama is running locally
                    at {provider.baseURL}
                  </p>
                )}

                <div>
                  <h4 className="text-sm font-medium mb-2">Available Models</h4>
                  <div className="grid grid-cols-1 gap-1">
                    {provider.hardcodedModels.map((model) => (
                      <div
                        key={model.id}
                        className="flex items-center gap-2 text-xs p-2 bg-muted/50 rounded"
                      >
                        <code className="flex-1 text-muted-foreground">{model.id}</code>
                        <div className="flex gap-1 flex-wrap">
                          {model.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        {model.note && (
                          <span className="text-muted-foreground italic">{model.note}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Usage */}
                {sessionUsage[provider.id] !== undefined && (
                  <div className="text-xs text-muted-foreground border-t pt-2">
                    Session usage: ~{sessionUsage[provider.id].toLocaleString()} tokens
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>

        {totalUsage > 0 && (
          <div className="border-t pt-3 text-sm text-muted-foreground">
            Total session usage: ~{totalUsage.toLocaleString()} tokens across{" "}
            {Object.keys(sessionUsage).length} provider(s)
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
