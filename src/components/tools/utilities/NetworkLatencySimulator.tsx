import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Toggle } from "@/components/ui/toggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea as UiScrollArea } from "@/components/ui/scroll-area";
import {
  Wifi,
  Activity,
  Download,
  AlertTriangle,
  Trash2,
  Globe,
  Info,
  Save,
} from "lucide-react";
import {
  NetworkProfile,
  NetworkRequest,
  IframeErrorType,
  predefinedProfiles,
  regionalProfiles,
  formatBytes,
  formatBandwidth,
} from "./networkLatencyUtils";

// Custom ScrollArea component for internal use
const ScrollArea = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <UiScrollArea className={className}>
      <div className="p-4">{children}</div>
    </UiScrollArea>
  );
};

export const NetworkLatencySimulator: React.FC = () => {
  const [isSimulationActive, setIsSimulationActive] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<NetworkProfile>(
    predefinedProfiles.find((p) => p.id === "4g-lte") || predefinedProfiles[0]
  );
  const [customProfile, setCustomProfile] = useState<NetworkProfile>({
    id: "custom",
    name: "Custom",
    downloadSpeed: 4000,
    uploadSpeed: 3000,
    latency: 100,
    packetLoss: 0.5,
  });
  const [savedProfiles, setSavedProfiles] = useState<NetworkProfile[]>([]);
  const [selectedTabId, setSelectedTabId] = useState("predefined");
  const [urlToTest, setUrlToTest] = useState("https://example.com");
  const [isLoadingWebsite, setIsLoadingWebsite] = useState(false);
  const [networkRequests, setNetworkRequests] = useState<NetworkRequest[]>([]);
  const [showUnsupportedAlert, setShowUnsupportedAlert] = useState(false);
  const [iframeError, setIframeError] = useState<IframeErrorType>(null);

  // Refs
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const serviceWorkerActive = useRef(false);

  // Effect to register service worker and load saved profiles
  useEffect(() => {
    // Check if service worker is supported
    if (!("serviceWorker" in navigator)) {
      setShowUnsupportedAlert(true);
      return;
    }

    // Register service worker
    registerServiceWorker();

    // Load saved profiles from IndexedDB
    loadSavedProfiles();

    // Cleanup when component unmounts
    return () => {
      if (serviceWorkerActive.current && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: "STOP_SIMULATION",
        });
      }
    };
  }, []);

  // Handle iframe loading and errors
  const handleLoad = () => {
    setIsLoadingWebsite(false);
    setIframeError(null);
  };

  const handleError = () => {
    setIsLoadingWebsite(false);

    // Try to determine the type of error
    // For X-Frame-Options errors, we can't directly detect them due to browser security,
    // but we can infer from the combination of onError firing and certain patterns
    try {
      // Check for X-Frame-Options or Content-Security-Policy errors
      if (iframeRef.current) {
        setIframeError("x-frame-options"); // Most common reason for iframe load failures
      }
    } catch (e) {
      // If we get a security error when trying to access iframe contents
      setIframeError("x-frame-options");
      console.error("Error loading website:", e);
    }
  };

  // Register service worker
  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register(
        "/network-simulator-sw.js"
      );

      console.log("Service Worker registered:", registration.scope);

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data.type === "REQUEST_COMPLETED") {
          // Update request in timeline
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
    }
  };

  // Load website in iframe
  const loadWebsite = () => {
    if (!urlToTest.trim()) return;

    // Reset state
    setIsLoadingWebsite(true);
    setIframeError(null);
    setNetworkRequests([]);

    // Ensure URL has protocol
    let url = urlToTest;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
      setUrlToTest(url);
    }
  };

  // Get error message based on iframe error type
  const getIframeErrorMessage = () => {
    switch (iframeError) {
      case "x-frame-options":
        return (
          <div className="space-y-2 text-sm">
            <div className="font-semibold text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              This website cannot be loaded in an iframe
            </div>
            <p>
              The website has implemented security headers (X-Frame-Options or
              Content-Security-Policy) that prevent it from being loaded in an
              iframe.
            </p>
            <p className="font-semibold mt-2">Why this happens:</p>
            <p>
              Many websites use this security measure to protect against
              clickjacking attacks. This is a common and recommended security
              practice.
            </p>
            <p className="font-semibold mt-2">Alternative approaches:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Use your browser's DevTools Network throttling to test this
                website
              </li>
              <li>
                Test with applications you control that don't have
                X-Frame-Options restrictions
              </li>
              <li>Try a simpler website like example.com or httpbin.org</li>
            </ul>
          </div>
        );
      case "unavailable":
        return (
          <div className="text-sm">
            <div className="font-semibold text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              Website unavailable
            </div>
            <p>
              The website could not be reached. Please check the URL and your
              internet connection.
            </p>
          </div>
        );
      case "unknown":
      default:
        return (
          <div className="text-sm">
            <div className="font-semibold text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              Error loading website
            </div>
            <p>
              An unknown error occurred while trying to load the website. This
              could be due to security restrictions or network issues.
            </p>
          </div>
        );
    }
  };

  // Save custom profile to IndexedDB
  const saveCustomProfile = () => {
    // Create a unique ID for the profile
    const profileId = `custom-${Date.now()}`;
    const profileToSave: NetworkProfile = {
      ...customProfile,
      id: profileId,
      name: customProfile.name || `Custom Profile ${savedProfiles.length + 1}`,
    };

    // Save to IndexedDB
    const openRequest = indexedDB.open("NetworkSimulatorDB", 1);

    openRequest.onupgradeneeded = () => {
      const db = openRequest.result;
      if (!db.objectStoreNames.contains("profiles")) {
        db.createObjectStore("profiles", { keyPath: "id" });
      }
    };

    openRequest.onsuccess = () => {
      const db = openRequest.result;
      const transaction = db.transaction("profiles", "readwrite");
      const store = transaction.objectStore("profiles");
      store.add(profileToSave);

      transaction.oncomplete = () => {
        // Update state with the new profile
        setSavedProfiles((prev) => [...prev, profileToSave]);

        // Switch to saved profiles tab
        setSelectedTabId("saved");

        // Select the newly saved profile
        setSelectedProfile(profileToSave);
      };
    };
  };

  // Load saved profiles from IndexedDB
  const loadSavedProfiles = () => {
    const openRequest = indexedDB.open("NetworkSimulatorDB", 1);

    openRequest.onupgradeneeded = () => {
      const db = openRequest.result;
      if (!db.objectStoreNames.contains("profiles")) {
        db.createObjectStore("profiles", { keyPath: "id" });
      }
    };

    openRequest.onsuccess = () => {
      const db = openRequest.result;
      const transaction = db.transaction("profiles", "readonly");
      const store = transaction.objectStore("profiles");
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = () => {
        setSavedProfiles(getAllRequest.result || []);
      };
    };
  };

  // Delete a saved profile
  const deleteProfile = (profileId: string) => {
    const openRequest = indexedDB.open("NetworkSimulatorDB", 1);

    openRequest.onsuccess = () => {
      const db = openRequest.result;
      const transaction = db.transaction("profiles", "readwrite");
      const store = transaction.objectStore("profiles");
      store.delete(profileId);

      transaction.oncomplete = () => {
        setSavedProfiles((prev) => prev.filter((p) => p.id !== profileId));

        // If the deleted profile was selected, switch to a default profile
        if (selectedProfile.id === profileId) {
          setSelectedProfile(predefinedProfiles[0]);
          setSelectedTabId("predefined");
        }
      };
    };
  };

  // Export network activity as HAR file
  const exportHAR = () => {
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
              Math.min(...networkRequests.map((r) => r.startTime))
            ).toISOString(),
            id: "page_1",
            title: urlToTest,
            pageTimings: {
              onContentLoad: -1,
              onLoad: -1,
            },
          },
        ],
        entries: networkRequests.map((request) => ({
          startedDateTime: new Date(request.startTime).toISOString(),
          time: request.endTime ? request.endTime - request.startTime : 0,
          request: {
            method: request.method,
            url: request.url,
            httpVersion: "HTTP/1.1",
            headers: [],
            queryString: [],
            cookies: [],
            headersSize: -1,
            bodySize: -1,
          },
          response: {
            status: request.status || 0,
            statusText: request.status ? `${request.status}` : "",
            httpVersion: "HTTP/1.1",
            headers: [],
            cookies: [],
            content: {
              size: request.size || 0,
              mimeType: "",
            },
            redirectURL: "",
            headersSize: -1,
            bodySize: request.size || 0,
          },
          cache: {},
          timings: {
            blocked: 0,
            dns: -1,
            connect: -1,
            send: 0,
            wait: request.latencyApplied,
            receive: request.endTime
              ? request.endTime - request.startTime - request.latencyApplied
              : 0,
            ssl: -1,
          },
          serverIPAddress: "",
          connection: "",
        })),
      },
    };

    // Create and download the HAR file
    const blob = new Blob([JSON.stringify(har, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `network-capture-${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/:/g, "-")}.har`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Calculate relative time for display
  const getRelativeTime = (time: number) => {
    const startTime = Math.min(...networkRequests.map((r) => r.startTime));
    return `${((time - startTime) / 1000).toFixed(2)}s`;
  };

  // Select a network profile
  const selectProfile = (profile: NetworkProfile) => {
    setSelectedProfile(profile);

    // If simulation is active, update it immediately
    if (isSimulationActive && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "START_SIMULATION",
        profile,
      });
    }
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Alerts for unsupported browsers */}
      {showUnsupportedAlert && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Browser compatibility issue</AlertTitle>
          <AlertDescription>
            Your browser doesn't support Service Workers, which are required for
            network simulation. Please use Chrome, Firefox, Edge, or Safari.
          </AlertDescription>
        </Alert>
      )}

      {/* Network Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" /> Network Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Simulation toggle */}
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">
                  Network Simulation: {isSimulationActive ? "Active" : "Off"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isSimulationActive
                    ? `Simulating ${selectedProfile.name} network conditions`
                    : "Click the button to start simulation"}
                </p>
              </div>
              <Toggle
                aria-label="Toggle network simulation"
                pressed={isSimulationActive}
                onPressedChange={toggleSimulation}
                size="lg"
              >
                <Activity className="h-5 w-5" />
              </Toggle>
            </div>

            {/* Profile selection tabs */}
            <Tabs
              value={selectedTabId}
              onValueChange={setSelectedTabId}
              className="space-y-4"
            >
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="predefined">Predefined</TabsTrigger>
                <TabsTrigger value="regional">Regional</TabsTrigger>
                <TabsTrigger value="saved">Saved / Custom</TabsTrigger>
              </TabsList>

              {/* Predefined profiles */}
              <TabsContent value="predefined" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {predefinedProfiles.map((profile) => (
                    <Button
                      key={profile.id}
                      variant={
                        selectedProfile.id === profile.id
                          ? "default"
                          : "outline"
                      }
                      className="justify-start"
                      onClick={() => selectProfile(profile)}
                    >
                      {profile.name}
                    </Button>
                  ))}
                </div>
              </TabsContent>

              {/* Regional profiles */}
              <TabsContent value="regional" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {regionalProfiles.map((profile) => (
                    <Button
                      key={profile.id}
                      variant={
                        selectedProfile.id === profile.id
                          ? "default"
                          : "outline"
                      }
                      className="justify-start"
                      onClick={() => selectProfile(profile)}
                    >
                      {profile.name}
                    </Button>
                  ))}
                </div>
              </TabsContent>

              {/* Saved and custom profiles */}
              <TabsContent value="saved" className="space-y-4">
                {savedProfiles.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Saved Profiles</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {savedProfiles.map((profile) => (
                        <div
                          key={profile.id}
                          className="flex items-center justify-between border rounded p-2"
                        >
                          <Button
                            variant={
                              selectedProfile.id === profile.id
                                ? "default"
                                : "ghost"
                            }
                            className="justify-start w-full mr-1"
                            onClick={() => selectProfile(profile)}
                          >
                            {profile.name}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteProfile(profile.id)}
                            title="Delete profile"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3 pt-4 border-t">
                  <h3 className="text-sm font-medium">Create Custom Profile</h3>

                  <div className="space-y-5">
                    <div className="space-y-1">
                      <Label htmlFor="profile-name">Profile Name</Label>
                      <Input
                        id="profile-name"
                        value={customProfile.name}
                        onChange={(e) =>
                          setCustomProfile({
                            ...customProfile,
                            name: e.target.value,
                          })
                        }
                        placeholder="My Custom Profile"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between mb-1">
                        <Label htmlFor="download-speed">
                          Download Speed (
                          {formatBandwidth(customProfile.downloadSpeed)})
                        </Label>
                      </div>
                      <Slider
                        id="download-speed"
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
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between mb-1">
                        <Label htmlFor="upload-speed">
                          Upload Speed (
                          {formatBandwidth(customProfile.uploadSpeed)})
                        </Label>
                      </div>
                      <Slider
                        id="upload-speed"
                        min={50}
                        max={50000}
                        step={50}
                        value={[customProfile.uploadSpeed]}
                        onValueChange={(value) =>
                          setCustomProfile({
                            ...customProfile,
                            uploadSpeed: value[0],
                          })
                        }
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between mb-1">
                        <Label htmlFor="latency">
                          Latency ({customProfile.latency} ms)
                        </Label>
                      </div>
                      <Slider
                        id="latency"
                        min={0}
                        max={3000}
                        step={5}
                        value={[customProfile.latency]}
                        onValueChange={(value) =>
                          setCustomProfile({
                            ...customProfile,
                            latency: value[0],
                          })
                        }
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between mb-1">
                        <Label htmlFor="packet-loss">
                          Packet Loss ({customProfile.packetLoss}%)
                        </Label>
                      </div>
                      <Slider
                        id="packet-loss"
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
                    </div>

                    <div className="flex justify-between">
                      <Button
                        variant="outline"
                        onClick={() => selectProfile(customProfile)}
                      >
                        Try Without Saving
                      </Button>
                      <Button onClick={saveCustomProfile}>
                        <Save className="h-4 w-4 mr-2" /> Save Profile
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Current profile details */}
            <div className="border rounded-lg p-4 space-y-3">
              <h3 className="text-sm font-medium">
                Selected Profile: {selectedProfile.name}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Download className="h-4 w-4 mr-1" /> Download
                  </div>
                  <div className="font-medium">
                    {formatBandwidth(selectedProfile.downloadSpeed)}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Download className="h-4 w-4 mr-1" /> Upload
                  </div>
                  <div className="font-medium">
                    {formatBandwidth(selectedProfile.uploadSpeed)}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Download className="h-4 w-4 mr-1" /> Latency
                  </div>
                  <div className="font-medium">
                    {selectedProfile.latency} ms
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Download className="h-4 w-4 mr-1" /> Packet Loss
                  </div>
                  <div className="font-medium">
                    {selectedProfile.packetLoss}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Website Testing Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" /> Test Website
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Enter URL (e.g., https://example.com)"
                  value={urlToTest}
                  onChange={(e) => setUrlToTest(e.target.value)}
                  disabled={isLoadingWebsite}
                />
              </div>
              <Button
                onClick={loadWebsite}
                disabled={isLoadingWebsite || !urlToTest.trim()}
              >
                Load Website
              </Button>
              {networkRequests.length > 0 && (
                <Button
                  variant="outline"
                  onClick={exportHAR}
                  title="Export as HAR file"
                >
                  <Download className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="border rounded-lg min-h-[200px] flex flex-col">
              {!isLoadingWebsite &&
                networkRequests.length === 0 &&
                !iframeError && (
                  <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                    <Info className="h-10 w-10 mb-2" />
                    <p className="text-center max-w-sm">
                      Enter a URL above and click "Load Website" to start
                      testing.
                      <br />
                      <br />
                      <span className="text-sm">
                        Note: Some websites may not load due to security
                        restrictions.
                      </span>
                    </p>
                  </div>
                )}

              {isLoadingWebsite && (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2 mx-auto"></div>
                    <p className="text-sm">Loading website...</p>
                  </div>
                </div>
              )}

              {iframeError && (
                <div className="p-4">{getIframeErrorMessage()}</div>
              )}

              {!isLoadingWebsite && !iframeError && (
                <iframe
                  ref={iframeRef}
                  src={urlToTest}
                  className="w-full h-[400px] border-none"
                  title="Website Test"
                  onLoad={handleLoad}
                  onError={handleError}
                />
              )}
            </div>

            {/* Network activity timeline */}
            {networkRequests.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Network Activity</h3>
                <ScrollArea className="h-[200px] border rounded-lg">
                  {networkRequests.map((request) => (
                    <div
                      key={request.id}
                      className="border-b last:border-b-0 py-2 flex items-start justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <Badge
                            variant="outline"
                            className="mr-2 font-mono text-xs"
                          >
                            {request.method}
                          </Badge>
                          <span className="text-sm truncate max-w-[400px]">
                            {new URL(request.url).pathname}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground space-x-3">
                          <span>
                            Start: {getRelativeTime(request.startTime)}
                          </span>
                          {request.endTime && (
                            <>
                              <span>
                                Duration:{" "}
                                {(
                                  (request.endTime - request.startTime) /
                                  1000
                                ).toFixed(2)}
                                s
                              </span>
                              <span>Status: {request.status || "pending"}</span>
                              {request.size && (
                                <span>Size: {formatBytes(request.size)}</span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      {!request.endTime && (
                        <Badge variant="secondary" className="animate-pulse">
                          Pending
                        </Badge>
                      )}
                    </div>
                  ))}
                </ScrollArea>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
