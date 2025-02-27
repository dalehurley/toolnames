import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Download,
  Gauge,
  Globe,
  Save,
  Trash2,
  Wifi,
  WifiOff,
  ShieldAlert,
  AlertTriangle,
  Info,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Define custom ScrollArea component if not available
const ScrollArea = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={className} style={{ overflowY: "auto" }}>
      {children}
    </div>
  );
};

// Add a type for iframe load errors
type IframeErrorType =
  | "x-frame-options"
  | "csp"
  | "unavailable"
  | "unknown"
  | null;

// Define network profile types
interface NetworkProfile {
  id: string;
  name: string;
  downloadSpeed: number; // in kbps
  uploadSpeed: number; // in kbps
  latency: number; // in ms
  packetLoss: number; // percentage
  region?: string;
}

// Predefined network profiles
const PREDEFINED_PROFILES: NetworkProfile[] = [
  {
    id: "2g",
    name: "Slow 2G",
    downloadSpeed: 50,
    uploadSpeed: 20,
    latency: 1000,
    packetLoss: 3,
  },
  {
    id: "3g",
    name: "Good 3G",
    downloadSpeed: 1500,
    uploadSpeed: 750,
    latency: 200,
    packetLoss: 1,
  },
  {
    id: "4g",
    name: "4G LTE",
    downloadSpeed: 12000,
    uploadSpeed: 6000,
    latency: 50,
    packetLoss: 0.1,
  },
  {
    id: "dsl",
    name: "DSL",
    downloadSpeed: 2000,
    uploadSpeed: 1000,
    latency: 30,
    packetLoss: 0.5,
  },
  {
    id: "fiber",
    name: "Fiber",
    downloadSpeed: 100000,
    uploadSpeed: 50000,
    latency: 5,
    packetLoss: 0,
  },
];

// Regional network profiles
const REGIONAL_PROFILES: NetworkProfile[] = [
  {
    id: "rural-us",
    name: "Rural US",
    downloadSpeed: 5000,
    uploadSpeed: 1000,
    latency: 100,
    packetLoss: 1,
    region: "United States (Rural)",
  },
  {
    id: "india-mobile",
    name: "India Mobile",
    downloadSpeed: 7000,
    uploadSpeed: 2000,
    latency: 150,
    packetLoss: 2,
    region: "India",
  },
  {
    id: "eu-avg",
    name: "EU Average",
    downloadSpeed: 20000,
    uploadSpeed: 10000,
    latency: 25,
    packetLoss: 0.2,
    region: "Europe",
  },
  {
    id: "sea-mobile",
    name: "SEA Mobile",
    downloadSpeed: 8000,
    uploadSpeed: 3000,
    latency: 120,
    packetLoss: 1.5,
    region: "Southeast Asia",
  },
];

// Network request interface for timeline
interface NetworkRequest {
  id: string;
  url: string;
  method: string;
  startTime: number;
  endTime?: number;
  size?: number;
  status?: number;
  latencyApplied: number;
}

export const NetworkLatencySimulator = () => {
  const [isSimulationActive, setIsSimulationActive] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<NetworkProfile>(
    PREDEFINED_PROFILES[2]
  ); // Default to 4G
  const [customProfile, setCustomProfile] = useState<NetworkProfile>({
    id: "custom",
    name: "Custom Profile",
    downloadSpeed: 5000,
    uploadSpeed: 2000,
    latency: 100,
    packetLoss: 0.5,
  });
  const [savedProfiles, setSavedProfiles] = useState<NetworkProfile[]>([]);
  const [activeTab, setActiveTab] = useState("predefined");
  const [urlToTest, setUrlToTest] = useState("https://example.com");
  const [isRecording, setIsRecording] = useState(false);
  const [networkRequests, setNetworkRequests] = useState<NetworkRequest[]>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const serviceWorkerActive = useRef<boolean>(false);
  const [showUnsupportedAlert, setShowUnsupportedAlert] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Add new state for iframe error handling
  const [iframeError, setIframeError] = useState<IframeErrorType>(null);
  const [isIframeLoading, setIsIframeLoading] = useState(false);

  // Check if Service Workers are supported
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      setShowUnsupportedAlert(true);
    } else {
      // Register service worker
      registerServiceWorker();
    }

    // Check for IndexedDB support and load saved profiles
    if ("indexedDB" in window) {
      loadSavedProfiles();
    }

    return () => {
      // Clean up when component unmounts
      if (isSimulationActive) {
        toggleSimulation(false);
      }
    };
  }, []);

  // Handle iframe load events
  useEffect(() => {
    const iframe = iframeRef.current;

    if (!iframe) return;

    const handleLoad = () => {
      setIsIframeLoading(false);

      // Try to access iframe content to check if it loaded properly
      try {
        // This will throw an error if the iframe is blocked by X-Frame-Options
        const iframeDocument =
          iframe.contentDocument || iframe.contentWindow?.document;

        if (!iframeDocument) {
          setIframeError("unknown");
        } else {
          // Successfully loaded
          setIframeError(null);
        }
      } catch (error) {
        // Security error - likely X-Frame-Options or CSP
        setIframeError("x-frame-options");
        console.error("Iframe access error:", error);
      }
    };

    const handleError = () => {
      setIsIframeLoading(false);
      setIframeError("unavailable");
    };

    iframe.addEventListener("load", handleLoad);
    iframe.addEventListener("error", handleError);

    return () => {
      iframe.removeEventListener("load", handleLoad);
      iframe.removeEventListener("error", handleError);
    };
  }, []);

  // Register service worker for network interception
  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register(
        "/network-simulator-sw.js"
      );
      console.log("Service Worker registered:", registration);

      // Set up communication with service worker
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data.type === "REQUEST_COMPLETED") {
          // Update the network request in our timeline
          setNetworkRequests((prev) =>
            prev.map((req) => {
              if (req.id === event.data.requestId) {
                return {
                  ...req,
                  endTime: event.data.endTime,
                  status: event.data.status,
                  size: event.data.size,
                };
              }
              return req;
            })
          );
        } else if (event.data.type === "REQUEST_STARTED") {
          // Add new request to timeline
          const newRequest: NetworkRequest = {
            id: event.data.requestId,
            url: event.data.url,
            method: event.data.method,
            startTime: event.data.startTime,
            latencyApplied: event.data.latencyApplied,
          };
          setNetworkRequests((prev) => [...prev, newRequest]);
        }
      });

      serviceWorkerActive.current = true;
    } catch (error) {
      console.error("Service Worker registration failed:", error);
      setShowUnsupportedAlert(true);
    }
  };

  // Toggle network simulation
  const toggleSimulation = (active: boolean) => {
    if (active && !serviceWorkerActive.current) {
      setShowUnsupportedAlert(true);
      return;
    }

    // Send message to service worker to start/stop simulation
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: active ? "START_SIMULATION" : "STOP_SIMULATION",
        profile: active ? selectedProfile : null,
      });
      setIsSimulationActive(active);

      // Clear network requests when stopping simulation
      if (!active) {
        setNetworkRequests([]);
        setIsRecording(false);
      }
    }
  };

  // Load website in iframe - UPDATED
  const loadWebsite = () => {
    if (iframeRef.current && urlToTest) {
      // Reset network requests and error state
      setNetworkRequests([]);
      setIframeError(null);
      setIsIframeLoading(true);

      // Load URL in iframe
      iframeRef.current.src = urlToTest;
    }
  };

  // Create a helper function for displaying the appropriate error message
  const getIframeErrorMessage = () => {
    switch (iframeError) {
      case "x-frame-options":
        return (
          <Alert variant="destructive" className="my-2">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>X-Frame-Options Restriction</AlertTitle>
            <AlertDescription>
              <p>
                This website cannot be loaded in an iframe because it has set
                <code className="mx-1 px-1 py-0.5 bg-destructive/10 rounded">
                  X-Frame-Options: SAMEORIGIN
                </code>
                which is a security measure to prevent clickjacking attacks.
              </p>
              <div className="mt-2">
                <h4 className="font-medium">Alternative approaches:</h4>
                <ul className="list-disc pl-5 mt-1 text-sm">
                  <li>Use browser DevTools Network throttling instead</li>
                  <li>
                    Test your own applications that don't have this restriction
                  </li>
                  <li>
                    Use a proxy server that strips these headers (not
                    implemented in this tool)
                  </li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        );
      case "csp":
        return (
          <Alert variant="destructive" className="my-2">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Content Security Policy Restriction</AlertTitle>
            <AlertDescription>
              This website cannot be loaded in an iframe due to Content Security
              Policy restrictions.
            </AlertDescription>
          </Alert>
        );
      case "unavailable":
        return (
          <Alert variant="destructive" className="my-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Website Unavailable</AlertTitle>
            <AlertDescription>
              Unable to load the website. Please check if the URL is correct and
              the website is accessible.
            </AlertDescription>
          </Alert>
        );
      case "unknown":
        return (
          <Alert variant="destructive" className="my-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Unknown Error</AlertTitle>
            <AlertDescription>
              An unknown error occurred while loading the website.
            </AlertDescription>
          </Alert>
        );
      default:
        return null;
    }
  };

  // Save custom profile to IndexedDB
  const saveCustomProfile = () => {
    if (!newProfileName.trim()) {
      alert("Please enter a profile name");
      return;
    }

    const profileToSave: NetworkProfile = {
      ...customProfile,
      id: `custom-${Date.now()}`,
      name: newProfileName,
    };

    // Save to IndexedDB
    const request = indexedDB.open("NetworkSimulatorDB", 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("profiles")) {
        db.createObjectStore("profiles", { keyPath: "id" });
      }
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction(["profiles"], "readwrite");
      const store = transaction.objectStore("profiles");
      store.add(profileToSave);

      // Update local state
      setSavedProfiles((prev) => [...prev, profileToSave]);
      setShowSaveDialog(false);
      setNewProfileName("");
    };

    request.onerror = () => {
      alert("Failed to save profile");
    };
  };

  // Load saved profiles from IndexedDB
  const loadSavedProfiles = () => {
    const request = indexedDB.open("NetworkSimulatorDB", 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("profiles")) {
        db.createObjectStore("profiles", { keyPath: "id" });
      }
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction(["profiles"], "readonly");
      const store = transaction.objectStore("profiles");
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = () => {
        setSavedProfiles(getAllRequest.result || []);
      };
    };
  };

  // Delete a saved profile
  const deleteProfile = (profileId: string) => {
    const request = indexedDB.open("NetworkSimulatorDB", 1);

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction(["profiles"], "readwrite");
      const store = transaction.objectStore("profiles");
      store.delete(profileId);

      // Update local state
      setSavedProfiles((prev) =>
        prev.filter((profile) => profile.id !== profileId)
      );
    };
  };

  // Export HAR file
  const exportHAR = () => {
    if (networkRequests.length === 0) {
      alert("No network requests to export");
      return;
    }

    // Create HAR format
    const har = {
      log: {
        version: "1.2",
        creator: {
          name: "Network Latency Simulator",
          version: "1.0",
        },
        pages: [
          {
            startedDateTime: new Date(
              networkRequests[0].startTime
            ).toISOString(),
            id: "page_1",
            title: urlToTest,
            pageTimings: {
              onContentLoad: -1,
              onLoad: -1,
            },
          },
        ],
        entries: networkRequests.map((req) => ({
          startedDateTime: new Date(req.startTime).toISOString(),
          time: req.endTime ? req.endTime - req.startTime : 0,
          request: {
            method: req.method,
            url: req.url,
            httpVersion: "HTTP/1.1",
            headers: [],
            queryString: [],
            cookies: [],
            headersSize: -1,
            bodySize: -1,
          },
          response: {
            status: req.status || 0,
            statusText: req.status ? `${req.status}` : "",
            httpVersion: "HTTP/1.1",
            headers: [],
            cookies: [],
            content: {
              size: req.size || 0,
              mimeType: "",
            },
            redirectURL: "",
            headersSize: -1,
            bodySize: req.size || 0,
          },
          cache: {},
          timings: {
            blocked: 0,
            dns: -1,
            connect: -1,
            send: 0,
            wait: req.latencyApplied,
            receive: req.endTime
              ? req.endTime - req.startTime - req.latencyApplied
              : 0,
            ssl: -1,
          },
          serverIPAddress: "",
          connection: "",
        })),
      },
    };

    // Create and download file
    const blob = new Blob([JSON.stringify(har, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `network-simulation-${new Date()
      .toISOString()
      .slice(0, 19)}.har`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Get relative time for display
  const getRelativeTime = (time: number) => {
    const firstRequestTime =
      networkRequests.length > 0 ? networkRequests[0].startTime : 0;
    return ((time - firstRequestTime) / 1000).toFixed(2) + "s";
  };

  // Select a profile to use
  const selectProfile = (profile: NetworkProfile) => {
    setSelectedProfile(profile);
    if (isSimulationActive) {
      // Update active simulation with new profile
      toggleSimulation(false);
      setTimeout(() => toggleSimulation(true), 100);
    }
  };

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">
              Network Latency Simulator
            </CardTitle>
            <CardDescription>
              Simulate network conditions for testing web applications
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <Switch
                checked={isSimulationActive}
                onCheckedChange={(checked) => toggleSimulation(checked)}
                disabled={showUnsupportedAlert}
              />
              <Label>
                {isSimulationActive ? (
                  <span className="flex items-center text-green-600">
                    <Wifi className="h-4 w-4 mr-1" /> Simulation Active
                  </span>
                ) : (
                  <span className="flex items-center text-gray-500">
                    <WifiOff className="h-4 w-4 mr-1" /> Simulation Off
                  </span>
                )}
              </Label>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {showUnsupportedAlert && (
          <Alert variant="destructive">
            <Activity className="h-4 w-4" />
            <AlertTitle>Browser Compatibility Issue</AlertTitle>
            <AlertDescription>
              Your browser doesn't fully support Service Workers or other
              features needed for network simulation. Please use a modern
              browser like Chrome, Firefox, or Edge.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column - Network Profiles */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Network Profiles</h3>

            <Tabs onValueChange={setActiveTab} value={activeTab}>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="predefined">Predefined</TabsTrigger>
                <TabsTrigger value="regional">Regional</TabsTrigger>
                <TabsTrigger value="custom">Custom</TabsTrigger>
              </TabsList>

              <TabsContent value="predefined" className="mt-0">
                <div className="space-y-2">
                  {PREDEFINED_PROFILES.map((profile) => (
                    <div
                      key={profile.id}
                      className={`p-3 border rounded-md cursor-pointer flex justify-between items-center ${
                        selectedProfile.id === profile.id
                          ? "border-primary bg-primary/5"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => selectProfile(profile)}
                    >
                      <div>
                        <div className="font-medium">{profile.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {profile.downloadSpeed / 1000}↓/
                          {profile.uploadSpeed / 1000}↑ Mbps, {profile.latency}
                          ms
                        </div>
                      </div>
                      <Gauge className="h-5 w-5 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="regional" className="mt-0">
                <div className="space-y-2">
                  {REGIONAL_PROFILES.map((profile) => (
                    <div
                      key={profile.id}
                      className={`p-3 border rounded-md cursor-pointer flex justify-between items-center ${
                        selectedProfile.id === profile.id
                          ? "border-primary bg-primary/5"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => selectProfile(profile)}
                    >
                      <div>
                        <div className="font-medium flex items-center">
                          {profile.name}
                          <Badge variant="outline" className="ml-2 text-xs">
                            <Globe className="h-3 w-3 mr-1" />
                            {profile.region}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {profile.downloadSpeed / 1000}↓/
                          {profile.uploadSpeed / 1000}↑ Mbps, {profile.latency}
                          ms
                        </div>
                      </div>
                      <Gauge className="h-5 w-5 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="custom" className="mt-0">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="downloadSpeed">Download Speed (kbps)</Label>
                    <div className="flex space-x-2 items-center">
                      <Slider
                        id="downloadSpeed"
                        min={50}
                        max={100000}
                        step={50}
                        value={[customProfile.downloadSpeed]}
                        onValueChange={(value) =>
                          setCustomProfile({
                            ...customProfile,
                            downloadSpeed: value[0],
                          })
                        }
                      />
                      <span className="w-16 text-right">
                        {(customProfile.downloadSpeed / 1000).toFixed(1)} Mbps
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="uploadSpeed">Upload Speed (kbps)</Label>
                    <div className="flex space-x-2 items-center">
                      <Slider
                        id="uploadSpeed"
                        min={10}
                        max={50000}
                        step={10}
                        value={[customProfile.uploadSpeed]}
                        onValueChange={(value) =>
                          setCustomProfile({
                            ...customProfile,
                            uploadSpeed: value[0],
                          })
                        }
                      />
                      <span className="w-16 text-right">
                        {(customProfile.uploadSpeed / 1000).toFixed(1)} Mbps
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="latency">Latency (ms)</Label>
                    <div className="flex space-x-2 items-center">
                      <Slider
                        id="latency"
                        min={0}
                        max={2000}
                        step={5}
                        value={[customProfile.latency]}
                        onValueChange={(value) =>
                          setCustomProfile({
                            ...customProfile,
                            latency: value[0],
                          })
                        }
                      />
                      <span className="w-16 text-right">
                        {customProfile.latency} ms
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="packetLoss">Packet Loss (%)</Label>
                    <div className="flex space-x-2 items-center">
                      <Slider
                        id="packetLoss"
                        min={0}
                        max={10}
                        step={0.1}
                        value={[customProfile.packetLoss]}
                        onValueChange={(value) =>
                          setCustomProfile({
                            ...customProfile,
                            packetLoss: value[0],
                          })
                        }
                      />
                      <span className="w-16 text-right">
                        {customProfile.packetLoss.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between mt-4">
                    <Button
                      variant="outline"
                      onClick={() => selectProfile(customProfile)}
                    >
                      Apply Custom Settings
                    </Button>
                    <Dialog
                      open={showSaveDialog}
                      onOpenChange={setShowSaveDialog}
                    >
                      <DialogTrigger asChild>
                        <Button variant="default">
                          <Save className="h-4 w-4 mr-2" />
                          Save Profile
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Save Network Profile</DialogTitle>
                          <DialogDescription>
                            Enter a name for this network profile. It will be
                            saved for future use.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-2 py-4">
                          <Label htmlFor="profileName">Profile Name</Label>
                          <Input
                            id="profileName"
                            value={newProfileName}
                            onChange={(e) => setNewProfileName(e.target.value)}
                            placeholder="e.g., My Home Network"
                          />
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setShowSaveDialog(false)}
                          >
                            Cancel
                          </Button>
                          <Button onClick={saveCustomProfile}>
                            Save Profile
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {savedProfiles.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium mb-2">
                        Saved Profiles
                      </h4>
                      <div className="space-y-2">
                        {savedProfiles.map((profile) => (
                          <div
                            key={profile.id}
                            className={`p-3 border rounded-md flex justify-between items-center ${
                              selectedProfile.id === profile.id
                                ? "border-primary bg-primary/5"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            <div
                              className="cursor-pointer flex-grow"
                              onClick={() => selectProfile(profile)}
                            >
                              <div className="font-medium">{profile.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {profile.downloadSpeed / 1000}↓/
                                {profile.uploadSpeed / 1000}↑ Mbps,{" "}
                                {profile.latency}ms
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteProfile(profile.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right column - Website Testing - UPDATED WITH ERROR HANDLING */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Test Website</h3>

            <div className="space-y-2">
              <div className="flex space-x-2">
                <div className="flex-grow">
                  <Label htmlFor="url" className="sr-only">
                    URL to Test
                  </Label>
                  <Input
                    id="url"
                    value={urlToTest}
                    onChange={(e) => setUrlToTest(e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
                <Button
                  onClick={loadWebsite}
                  disabled={!urlToTest || isIframeLoading}
                >
                  {isIframeLoading ? "Loading..." : "Load"}
                </Button>
              </div>
            </div>

            {iframeError && getIframeErrorMessage()}

            <div className="border rounded-md h-[300px] overflow-hidden relative">
              {isIframeLoading && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Loading website...
                    </p>
                  </div>
                </div>
              )}
              {!iframeError && !isSimulationActive && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center p-4 text-center">
                  <div className="max-w-md">
                    <Info className="h-6 w-6 text-primary mx-auto mb-2" />
                    <h3 className="text-sm font-medium">
                      Activate Simulation First
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Toggle simulation on at the top of the page before loading
                      a website to ensure proper network interception.
                    </p>
                  </div>
                </div>
              )}
              <iframe
                ref={iframeRef}
                className="w-full h-full border-0"
                title="Website preview"
                sandbox="allow-same-origin allow-scripts"
              />
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={isRecording}
                  onCheckedChange={(checked) => setIsRecording(checked)}
                  disabled={!isSimulationActive}
                />
                <Label>Record Network Activity</Label>
              </div>
              <Button
                variant="outline"
                onClick={exportHAR}
                disabled={networkRequests.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export HAR
              </Button>
            </div>
          </div>
        </div>

        {/* Network Request Timeline */}
        <div className="mt-6">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="timeline">
              <AccordionTrigger>
                <div className="flex items-center">
                  <Activity className="h-4 w-4 mr-2" />
                  Network Request Timeline
                  {networkRequests.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {networkRequests.length}
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ScrollArea className="h-[300px] w-full rounded-md border">
                  {networkRequests.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      No network requests recorded. Activate simulation and load
                      a website to begin.
                    </div>
                  ) : (
                    <div className="space-y-2 p-3">
                      {networkRequests.map((req) => (
                        <div
                          key={req.id}
                          className="border rounded-md p-3 text-sm"
                        >
                          <div className="flex justify-between">
                            <div className="font-medium truncate max-w-[300px]">
                              {req.url.split("/").pop() || req.url}
                            </div>
                            <Badge
                              variant={
                                req.status
                                  ? req.status < 400
                                    ? "secondary"
                                    : "destructive"
                                  : "secondary"
                              }
                            >
                              {req.method} {req.status || "Pending"}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground truncate mt-1">
                            {req.url}
                          </div>
                          <div className="flex justify-between items-center mt-2 text-xs">
                            <div className="flex items-center space-x-2">
                              <span>
                                Started: {getRelativeTime(req.startTime)}
                              </span>
                              {req.endTime && (
                                <span>
                                  Duration:{" "}
                                  {(
                                    (req.endTime - req.startTime) /
                                    1000
                                  ).toFixed(2)}
                                  s
                                </span>
                              )}
                            </div>
                            <div>
                              <Badge
                                variant="outline"
                                className="text-amber-600 border-amber-200 bg-amber-50"
                              >
                                +{req.latencyApplied}ms latency
                              </Badge>
                            </div>
                          </div>

                          {/* Visual timeline bar */}
                          {req.endTime && (
                            <div className="mt-2 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    ((req.endTime - req.startTime) / 2000) * 100
                                  )}%`,
                                }}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </CardContent>
    </Card>
  );
};
