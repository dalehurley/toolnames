import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Trash2, Plus, RefreshCw, Download, Search, Copy, Check } from "lucide-react";

interface StorageEntry { key: string; value: string; size: number; }

function getEntries(storage: Storage): StorageEntry[] {
  const entries: StorageEntry[] = [];
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i)!;
    const value = storage.getItem(key) ?? "";
    entries.push({ key, value, size: new Blob([key + value]).size });
  }
  return entries.sort((a, b) => b.size - a.size);
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

const StorageTab = ({ storage, storageLabel }: { storage: Storage; storageLabel: string }) => {
  const [entries, setEntries] = useState<StorageEntry[]>([]);
  const [search, setSearch] = useState("");
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [copied, setCopied] = useState("");

  const refresh = () => setEntries(getEntries(storage));

  useEffect(() => { refresh(); }, []);

  const addEntry = () => {
    if (!newKey) return;
    storage.setItem(newKey, newValue);
    setNewKey(""); setNewValue(""); refresh();
  };

  const removeEntry = (key: string) => { storage.removeItem(key); refresh(); };
  const clearAll = () => { storage.clear(); refresh(); };

  const saveEdit = (key: string) => {
    storage.setItem(key, editValue);
    setEditing(null); refresh();
  };

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id); setTimeout(() => setCopied(""), 2000);
  };

  const exportJSON = () => {
    const obj: Record<string, string> = {};
    entries.forEach(e => { obj[e.key] = e.value; });
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `${storageLabel}-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = entries.filter(e =>
    e.key.toLowerCase().includes(search.toLowerCase()) || e.value.toLowerCase().includes(search.toLowerCase())
  );

  const totalSize = entries.reduce((s, e) => s + e.size, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2">
          <Badge variant="secondary">{entries.length} keys</Badge>
          <Badge variant="outline">{formatBytes(totalSize)} used</Badge>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={refresh}><RefreshCw className="h-3 w-3 mr-1" />Refresh</Button>
          <Button size="sm" variant="outline" onClick={exportJSON}><Download className="h-3 w-3 mr-1" />Export JSON</Button>
          <Button size="sm" variant="destructive" onClick={clearAll} disabled={entries.length === 0}><Trash2 className="h-3 w-3 mr-1" />Clear All</Button>
        </div>
      </div>

      {/* Add entry */}
      <div className="border rounded-lg p-3 space-y-2 bg-muted/30">
        <div className="text-sm font-medium">Add / Update Entry</div>
        <div className="flex gap-2">
          <Input value={newKey} onChange={e => setNewKey(e.target.value)} placeholder="Key" className="flex-1" />
          <Input value={newValue} onChange={e => setNewValue(e.target.value)} placeholder="Value" className="flex-1" />
          <Button size="sm" onClick={addEntry} disabled={!newKey}><Plus className="h-4 w-4" /></Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search keys/values..." className="pl-8" />
      </div>

      {/* Entries */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {filtered.length === 0 && (
          <div className="text-center py-6 text-muted-foreground text-sm">No entries found.</div>
        )}
        {filtered.map(entry => (
          <div key={entry.key} className="border rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="font-mono text-sm font-medium truncate flex-1">{entry.key}</div>
              <Badge variant="outline" className="text-xs">{formatBytes(entry.size)}</Badge>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => copy(entry.key + ": " + entry.value, entry.key)}>
                  {copied === entry.key ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { setEditing(entry.key); setEditValue(entry.value); }}>
                  ✏️
                </Button>
                <Button variant="ghost" size="sm" onClick={() => removeEntry(entry.key)}>
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            </div>
            {editing === entry.key ? (
              <div className="flex gap-2">
                <Textarea value={editValue} onChange={e => setEditValue(e.target.value)} className="font-mono text-xs flex-1 min-h-[60px]" />
                <div className="flex flex-col gap-1">
                  <Button size="sm" onClick={() => saveEdit(entry.key)}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="font-mono text-xs text-muted-foreground bg-muted rounded p-2 max-h-24 overflow-y-auto">
                {entry.value || <span className="italic">(empty string)</span>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const BrowserStorageInspector = () => {
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Database className="h-6 w-6 text-primary" />
          <div>
            <CardTitle className="text-2xl">Browser Storage Inspector</CardTitle>
            <CardDescription>View, edit, and manage localStorage & sessionStorage without DevTools</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="local">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="local">localStorage</TabsTrigger>
            <TabsTrigger value="session">sessionStorage</TabsTrigger>
          </TabsList>
          <TabsContent value="local" className="mt-4">
            <StorageTab storage={localStorage} storageLabel="localStorage" />
          </TabsContent>
          <TabsContent value="session" className="mt-4">
            <StorageTab storage={sessionStorage} storageLabel="sessionStorage" />
          </TabsContent>
        </Tabs>

        <div className="bg-muted rounded-lg p-3 text-sm text-muted-foreground mt-4">
          <strong>Web Storage API</strong> — View and manage your browser's localStorage and sessionStorage. All operations are local to this browser tab. The inspector shows all keys stored by any site you've visited (for localStorage) or this session.
        </div>
      </CardContent>
    </Card>
  );
};
