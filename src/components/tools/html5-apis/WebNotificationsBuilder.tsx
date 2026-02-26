import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell, BellOff, Send, Clock, Trash2 } from "lucide-react";

interface ScheduledNotif { id: string; title: string; body: string; delay: number; timeoutId?: ReturnType<typeof setTimeout>; scheduledAt: Date; }

export const WebNotificationsBuilder = () => {
  const [permission, setPermission] = useState(Notification.permission);
  const [title, setTitle] = useState("Hello from ToolNames!");
  const [body, setBody] = useState("This is a test notification sent from your browser.");
  const [icon, setIcon] = useState("");
  const [silent, setSilent] = useState(false);
  const [requireInteraction, setRequireInteraction] = useState(false);
  const [delay, setDelay] = useState(0);
  const [scheduled, setScheduled] = useState<ScheduledNotif[]>([]);
  const [sent, setSent] = useState<{ title: string; ts: Date }[]>([]);
  const [badge, setBadge] = useState("");
  const [tag, setTag] = useState("");

  useEffect(() => { setPermission(Notification.permission); }, []);

  const requestPermission = async () => {
    const result = await Notification.requestPermission();
    setPermission(result);
  };

  const sendNotification = () => {
    if (permission !== "granted") return;
    const opts: NotificationOptions = {
      body,
      silent,
      requireInteraction,
      ...(icon && { icon }),
      ...(badge && { badge }),
      ...(tag && { tag }),
    };
    const doSend = () => {
      new Notification(title, opts);
      setSent(prev => [{ title, ts: new Date() }, ...prev.slice(0, 19)]);
    };

    if (delay > 0) {
      const id = `${Date.now()}`;
      const timeoutId = setTimeout(() => {
        doSend();
        setScheduled(prev => prev.filter(s => s.id !== id));
      }, delay * 1000);
      setScheduled(prev => [{ id, title, body, delay, timeoutId, scheduledAt: new Date() }, ...prev]);
    } else {
      doSend();
    }
  };

  const cancelScheduled = (id: string) => {
    setScheduled(prev => {
      const item = prev.find(s => s.id === id);
      if (item?.timeoutId) clearTimeout(item.timeoutId);
      return prev.filter(s => s.id !== id);
    });
  };

  const permColor = permission === "granted" ? "bg-green-500" : permission === "denied" ? "bg-red-500" : "bg-yellow-500";
  const permText = permission === "granted" ? "Granted" : permission === "denied" ? "Denied" : "Not requested";

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6 text-primary" />
          <div>
            <CardTitle className="text-2xl">Web Notifications Builder</CardTitle>
            <CardDescription>Build, preview, and schedule browser notifications using the Notifications API</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Permission */}
        <div className="flex items-center gap-3 p-3 border rounded-lg">
          <Badge className={`${permColor} text-white`}>{permText}</Badge>
          <span className="text-sm text-muted-foreground flex-1">
            {permission === "granted" ? "You can send notifications from this page." :
              permission === "denied" ? "Notifications are blocked. Change in browser settings." :
                "Permission is required to send notifications."}
          </span>
          {permission !== "granted" && permission !== "denied" && (
            <Button size="sm" onClick={requestPermission}>
              <Bell className="h-4 w-4 mr-2" />Request Permission
            </Button>
          )}
        </div>

        {/* Builder */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <Label>Title *</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Notification title" />
            </div>
            <div>
              <Label>Body</Label>
              <Textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Notification body text..." className="resize-none h-20" />
            </div>
            <div>
              <Label>Icon URL (optional)</Label>
              <Input value={icon} onChange={e => setIcon(e.target.value)} placeholder="https://example.com/icon.png" />
            </div>
            <div>
              <Label>Badge URL (optional)</Label>
              <Input value={badge} onChange={e => setBadge(e.target.value)} placeholder="https://example.com/badge.png" />
            </div>
            <div>
              <Label>Tag (groups notifications)</Label>
              <Input value={tag} onChange={e => setTag(e.target.value)} placeholder="my-notification-group" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="border rounded-lg p-4 space-y-3">
              <h3 className="font-medium text-sm">Options</h3>
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 cursor-pointer">
                  <BellOff className="h-4 w-4" />Silent (no sound)
                </Label>
                <Switch checked={silent} onCheckedChange={setSilent} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 cursor-pointer">
                  <Bell className="h-4 w-4" />Require interaction
                </Label>
                <Switch checked={requireInteraction} onCheckedChange={setRequireInteraction} />
              </div>
            </div>

            {/* Delay */}
            <div className="border rounded-lg p-4 space-y-3">
              <h3 className="font-medium text-sm flex items-center gap-2"><Clock className="h-4 w-4" />Schedule Delay</h3>
              <div className="flex items-center gap-2">
                <Input type="number" min={0} max={3600} value={delay}
                  onChange={e => setDelay(parseInt(e.target.value) || 0)} className="w-24" />
                <span className="text-sm text-muted-foreground">seconds</span>
              </div>
            </div>

            {/* Preview */}
            <div className="border rounded-lg p-4 bg-muted/30">
              <h3 className="font-medium text-sm mb-3">Preview</h3>
              <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-3 flex gap-3 items-start">
                {icon ? <img src={icon} alt="" className="h-8 w-8 rounded" /> : <Bell className="h-8 w-8 text-primary" />}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{title || "Notification title"}</div>
                  <div className="text-xs text-muted-foreground line-clamp-2">{body || "Notification body..."}</div>
                </div>
              </div>
            </div>

            <Button onClick={sendNotification} disabled={permission !== "granted" || !title} className="w-full">
              <Send className="h-4 w-4 mr-2" />
              {delay > 0 ? `Schedule (${delay}s)` : "Send Notification"}
            </Button>
          </div>
        </div>

        {/* Scheduled */}
        {scheduled.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Scheduled ({scheduled.length})</h3>
            {scheduled.map(s => (
              <div key={s.id} className="border rounded-lg p-2 flex items-center justify-between">
                <div>
                  <span className="font-medium text-sm">{s.title}</span>
                  <span className="text-xs text-muted-foreground ml-2">in {s.delay}s</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => cancelScheduled(s.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Sent history */}
        {sent.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Sent ({sent.length})</h3>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {sent.map((s, i) => (
                <div key={i} className="text-xs text-muted-foreground border rounded p-2 flex justify-between">
                  <span>"{s.title}"</span>
                  <span>{s.ts.toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-muted rounded-lg p-3 text-sm text-muted-foreground">
          <strong>Notifications API</strong> — Sends native browser notifications. Requires user permission. Notifications appear even when the tab is in the background.
        </div>
      </CardContent>
    </Card>
  );
};
