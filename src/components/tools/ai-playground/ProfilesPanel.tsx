import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useAIPlaygroundStore } from "@/store/aiPlayground";
import { PROVIDER_MAP } from "@/providers/ai";
import {
  User2,
  X,
  Plus,
  Trash2,
  Check,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface ProfilesPanelProps {
  onClose: () => void;
}

export function ProfilesPanel({ onClose }: ProfilesPanelProps) {
  const { profiles, settings, saveProfile, deleteProfile, applyProfile } =
    useAIPlaygroundStore();
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    const name = newName.trim();
    if (!name) {
      toast.error("Please enter a profile name");
      return;
    }
    setSaving(true);
    saveProfile({
      name,
      providerId: settings.selectedProviderId,
      modelId: settings.selectedModelId,
      systemPrompt: settings.systemPrompt,
      params: settings.params,
    });
    setNewName("");
    setSaving(false);
    toast.success(`Profile "${name}" saved`);
  };

  const handleApply = (id: string, name: string) => {
    applyProfile(id);
    toast.success(`Profile "${name}" applied`);
  };

  const handleDelete = (id: string, name: string) => {
    deleteProfile(id);
    toast.success(`Profile "${name}" deleted`);
  };

  return (
    <div className="flex flex-col h-full border-l bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/20">
        <div className="flex items-center gap-2">
          <User2 className="w-4 h-4 text-violet-500" />
          <span className="text-sm font-medium">Model Profiles</span>
          <Badge variant="outline" className="text-[10px] px-1.5 h-4">
            {profiles.length}
          </Badge>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Save current as profile */}
      <div className="px-3 py-2.5 border-b bg-muted/10 space-y-2">
        <p className="text-[11px] text-muted-foreground">
          Save current model, system prompt, and parameters as a named preset.
        </p>
        <div className="flex gap-2">
          <Input
            placeholder="Profile name…"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            className="h-7 text-xs flex-1"
          />
          <Button
            size="sm"
            className="h-7 px-3 text-xs gap-1"
            onClick={handleSave}
            disabled={saving || !newName.trim()}
          >
            <Plus className="w-3 h-3" />
            Save
          </Button>
        </div>
        {/* Current snapshot */}
        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary" className="text-[9px]">
            {PROVIDER_MAP[settings.selectedProviderId]?.name ?? settings.selectedProviderId}
          </Badge>
          <Badge variant="secondary" className="text-[9px]">
            {settings.selectedModelId}
          </Badge>
          <Badge variant="secondary" className="text-[9px]">
            temp {settings.params.temperature}
          </Badge>
          {settings.systemPrompt && (
            <Badge variant="secondary" className="text-[9px]">
              has system prompt
            </Badge>
          )}
        </div>
      </div>

      {/* Profile list */}
      <ScrollArea className="flex-1">
        {profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center gap-2">
            <Zap className="w-8 h-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No profiles yet</p>
            <p className="text-xs text-muted-foreground/70">
              Save your current configuration to quickly switch between setups.
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {profiles.map((profile) => {
              const provider = PROVIDER_MAP[profile.providerId];
              const isActive =
                settings.selectedProviderId === profile.providerId &&
                settings.selectedModelId === profile.modelId;

              return (
                <div
                  key={profile.id}
                  className={cn(
                    "group rounded-lg border p-3 transition-colors",
                    isActive
                      ? "border-violet-400/60 bg-violet-50/30 dark:bg-violet-950/20"
                      : "hover:border-violet-300/50 hover:bg-muted/20"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs font-medium truncate">{profile.name}</span>
                        {isActive && (
                          <Badge
                            variant="outline"
                            className="text-[9px] px-1 h-3.5 text-violet-600 border-violet-400"
                          >
                            active
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="secondary" className="text-[9px]">
                          {provider?.name ?? profile.providerId}
                        </Badge>
                        <Badge variant="secondary" className="text-[9px]">
                          {profile.modelId}
                        </Badge>
                        <Badge variant="secondary" className="text-[9px]">
                          t={profile.params.temperature}
                        </Badge>
                      </div>
                      {profile.systemPrompt && (
                        <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1 italic">
                          "{profile.systemPrompt.slice(0, 60)}…"
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Saved {formatDistanceToNow(profile.createdAt, { addSuffix: true })}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant={isActive ? "outline" : "default"}
                      className="h-6 text-[10px] px-2 gap-1 flex-1"
                      onClick={() => handleApply(profile.id, profile.name)}
                      disabled={isActive}
                    >
                      <Check className="w-3 h-3" />
                      {isActive ? "Current" : "Apply"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-[10px] px-2 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(profile.id, profile.name)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
