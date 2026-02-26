import { useState, useMemo, useEffect } from "react";
import { parseISO } from "date-fns";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Save, Trash2, Star, Share2 } from "lucide-react";
import { CityTimeCard } from "./time-zone/CityTimeCard";
import { MapVisualization } from "./time-zone/MapVisualization";
import { TimelineVisualization } from "./time-zone/TimelineVisualization";
import {
  timeZoneData,
  majorCities,
  formatInTimeZone,
  isBusinessHours,
  getTimeZoneById,
  SavedTimeZoneGroup,
  TimeZone,
} from "@/utils/timeZones";

// Interface for conversion result
interface ConversionResult {
  timeZoneId: string;
  timeZone: TimeZone | undefined;
  localTime: Date;
  formattedTime: string;
  formattedDate: string;
  isBusinessHours: boolean;
}

export const TimeZoneConverter = () => {
  // Current date/time in ISO format
  const getCurrentISODateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // State variables
  const [sourceDateTime, setSourceDateTime] = useState<string>(
    getCurrentISODateTime()
  );
  const [sourceTimeZone, setSourceTimeZone] =
    useState<string>("America/New_York");
  const [destinationTimeZones, setDestinationTimeZones] = useState<string[]>([
    "Europe/London",
    "Asia/Tokyo",
  ]);
  const [newTimeZone, setNewTimeZone] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("converter");
  const [savedGroups, setSavedGroups] = useState<SavedTimeZoneGroup[]>([]);
  const [newGroupName, setNewGroupName] = useState<string>("");
  const [showSaveDialog, setShowSaveDialog] = useState<boolean>(false);

  // Load saved groups from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem("timeZoneGroups");
    if (savedData) {
      try {
        setSavedGroups(JSON.parse(savedData));
      } catch (e) {
        console.error("Error loading saved time zone groups", e);
      }
    }
  }, []);

  // Save groups to localStorage when they change
  useEffect(() => {
    localStorage.setItem("timeZoneGroups", JSON.stringify(savedGroups));
  }, [savedGroups]);

  // Calculate conversion results
  const conversionResults = useMemo<ConversionResult[]>(() => {
    if (!sourceDateTime) return [];

    // Parse the input date
    const date = parseISO(sourceDateTime);

    return destinationTimeZones.map((tzId) => {
      const tz = getTimeZoneById(tzId);
      return {
        timeZoneId: tzId,
        timeZone: tz,
        localTime: new Date(
          formatInTimeZone(date, tzId, "yyyy-MM-dd'T'HH:mm:ss")
        ),
        formattedTime: formatInTimeZone(date, tzId, "h:mm a"),
        formattedDate: formatInTimeZone(date, tzId, "EEEE, MMMM d, yyyy"),
        isBusinessHours: isBusinessHours(date, tzId),
      };
    });
  }, [sourceDateTime, destinationTimeZones]);

  // Handler functions
  const handleAddTimeZone = () => {
    if (newTimeZone && !destinationTimeZones.includes(newTimeZone)) {
      setDestinationTimeZones([...destinationTimeZones, newTimeZone]);
      setNewTimeZone("");
    }
  };

  const handleRemoveTimeZone = (tzId: string) => {
    setDestinationTimeZones(destinationTimeZones.filter((tz) => tz !== tzId));
  };

  const handleSaveGroup = () => {
    if (newGroupName.trim()) {
      const newGroup: SavedTimeZoneGroup = {
        id: Date.now().toString(),
        name: newGroupName.trim(),
        sourceTimeZone,
        destinationTimeZones: [...destinationTimeZones],
      };

      setSavedGroups([...savedGroups, newGroup]);
      setNewGroupName("");
      setShowSaveDialog(false);
    }
  };

  const handleLoadGroup = (group: SavedTimeZoneGroup) => {
    setSourceTimeZone(group.sourceTimeZone);
    setDestinationTimeZones([...group.destinationTimeZones]);
    setActiveTab("converter");
  };

  const handleDeleteGroup = (groupId: string) => {
    setSavedGroups(savedGroups.filter((group) => group.id !== groupId));
  };

  const handleShareLink = () => {
    const params = new URLSearchParams();
    params.append("src", sourceTimeZone);
    params.append("dt", sourceDateTime);
    destinationTimeZones.forEach((tz) => params.append("dst", tz));

    const url = `${window.location.origin}${
      window.location.pathname
    }?${params.toString()}`;

    // Copy to clipboard
    navigator.clipboard
      .writeText(url)
      .then(() => {
        alert("Share link copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy link", err);
      });
  };

  // Load from URL params on initial render
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.has("src")) {
      const src = params.get("src");
      if (src && timeZoneData.some((tz: TimeZone) => tz.id === src)) {
        setSourceTimeZone(src);
      }
    }

    if (params.has("dt")) {
      const dt = params.get("dt");
      if (dt) {
        try {
          // Validate date format
          parseISO(dt);
          setSourceDateTime(dt);
        } catch (e) {
          console.error("Invalid date format in URL", e);
        }
      }
    }

    if (params.has("dst")) {
      const destinations = params.getAll("dst");
      if (destinations.length > 0) {
        const validDestinations = destinations.filter((dst) =>
          timeZoneData.some((tz: TimeZone) => tz.id === dst)
        );
        if (validDestinations.length > 0) {
          setDestinationTimeZones(validDestinations);
        }
      }
    }
  }, []);

  return (
    <div className="container mx-auto p-4">
      <Tabs
        defaultValue="converter"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="converter">Time Zone Converter</TabsTrigger>
          <TabsTrigger value="worldclock">World Clock</TabsTrigger>
        </TabsList>

        <TabsContent value="converter">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {/* Source Time Input - Left Panel */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Source Time</h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="datetime">Date & Time</Label>
                  <Input
                    id="datetime"
                    type="datetime-local"
                    value={sourceDateTime}
                    onChange={(e) => setSourceDateTime(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label htmlFor="sourceTimeZone">Source Time Zone</Label>
                  <Select
                    value={sourceTimeZone}
                    onValueChange={setSourceTimeZone}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a time zone" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeZoneData.map((tz: TimeZone) => (
                        <SelectItem key={tz.id} value={tz.id}>
                          {tz.emoji} {tz.name} ({tz.offset})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 pt-4">
                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSaveDialog(true)}
                    >
                      <Save className="h-4 w-4 mr-2" /> Save
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleShareLink}
                    >
                      <Share2 className="h-4 w-4 mr-2" /> Share
                    </Button>
                  </div>

                  {savedGroups.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Saved Groups</h4>
                      <div className="space-y-2">
                        {savedGroups.map((group) => (
                          <div
                            key={group.id}
                            className="flex justify-between items-center p-2 border rounded-md text-sm"
                          >
                            <span>{group.name}</span>
                            <div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleLoadGroup(group)}
                              >
                                <Star className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteGroup(group.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Visualization - Middle Panel */}
            <Card className="md:row-span-2">
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4">Time Zone Map</h3>
                <MapVisualization
                  sourceTimeZone={sourceTimeZone}
                  destinationTimeZones={destinationTimeZones}
                  currentTimes={conversionResults}
                />
              </div>

              <div className="p-4 pt-0">
                <TimelineVisualization
                  timeZones={[sourceTimeZone, ...destinationTimeZones]}
                />
              </div>
            </Card>

            {/* Results - Right Panel */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Converted Times</h3>

              {/* Destination Time Zone Selector */}
              <div className="flex space-x-2 mb-4">
                <Select value={newTimeZone} onValueChange={setNewTimeZone}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Add time zone" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeZoneData
                      .filter(
                        (tz: TimeZone) => !destinationTimeZones.includes(tz.id)
                      )
                      .map((tz: TimeZone) => (
                        <SelectItem key={tz.id} value={tz.id}>
                          {tz.emoji} {tz.name} ({tz.offset})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleAddTimeZone} disabled={!newTimeZone}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Results List */}
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {conversionResults.map((result) => (
                  <Card
                    key={result.timeZoneId}
                    className={`p-3 ${
                      result.isBusinessHours
                        ? "border-green-500 dark:border-green-700"
                        : ""
                    }`}
                  >
                    <div className="flex justify-between">
                      <div>
                        <div className="flex items-center">
                          <h4 className="font-medium">
                            {result.timeZone?.emoji} {result.timeZone?.name}
                          </h4>
                          {result.isBusinessHours && (
                            <Badge
                              variant="outline"
                              className="ml-2 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800"
                            >
                              Business Hours
                            </Badge>
                          )}
                        </div>
                        <p className="text-2xl font-semibold">
                          {result.formattedTime}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {result.formattedDate}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveTimeZone(result.timeZoneId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}

                {conversionResults.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No destination time zones selected.
                    <br />
                    Add time zones using the selector above.
                  </div>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="worldclock">
          <div className="space-y-6 mt-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Current Time Around the World
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {majorCities.map((city) => (
                  <CityTimeCard
                    key={city.id}
                    city={city.name}
                    timeZoneId={city.timeZoneId}
                    emoji={getTimeZoneById(city.timeZoneId)?.emoji}
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">
                Global Time Comparison
              </h3>
              <TimelineVisualization
                timeZones={majorCities.map((c) => c.timeZoneId)}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Time Zone Group</DialogTitle>
            <DialogDescription>
              Create a name for this combination of time zones to easily access
              it later.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            <Label htmlFor="groupName">Group Name</Label>
            <Input
              id="groupName"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="e.g., Work Hours, Travel Planning"
              className="w-full"
            />
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveGroup} disabled={!newGroupName.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
