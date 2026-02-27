import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, Plus, Trash2, Navigation, Copy, Check } from "lucide-react";

interface Location {
  id: string;
  label: string;
  lat: number;
  lng: number;
  accuracy?: number;
  altitude?: number | null;
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function dmsString(deg: number, isLat: boolean) {
  const dir = isLat ? (deg >= 0 ? "N" : "S") : deg >= 0 ? "E" : "W";
  const abs = Math.abs(deg);
  const d = Math.floor(abs);
  const m = Math.floor((abs - d) * 60);
  const s = ((abs - d - m / 60) * 3600).toFixed(2);
  return `${d}°${m}'${s}"${dir}`;
}

export const GeolocationTool = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [label, setLabel] = useState("My Location");
  const [copied, setCopied] = useState("");
  const watchIdRef = useRef<number | null>(null);
  const [watching, setWatching] = useState(false);

  const getLocation = (watch = false) => {
    if (!navigator.geolocation) { setError("Geolocation is not supported by your browser."); return; }
    setLoading(true);
    setError("");
    const opts: PositionOptions = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };

    const onSuccess = (pos: GeolocationPosition) => {
      const { latitude, longitude, accuracy, altitude } = pos.coords;
      const newLoc: Location = {
        id: `${Date.now()}`,
        label: label || `Point ${locations.length + 1}`,
        lat: latitude,
        lng: longitude,
        accuracy,
        altitude,
      };
      setLocations(prev => [...prev, newLoc]);
      setLabel("");
      setLoading(false);
    };

    const onError = (err: GeolocationPositionError) => {
      setError(err.message);
      setLoading(false);
    };

    if (watch) {
      watchIdRef.current = navigator.geolocation.watchPosition(onSuccess, onError, opts);
      setWatching(true);
    } else {
      navigator.geolocation.getCurrentPosition(onSuccess, onError, opts);
    }
  };

  const stopWatch = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setWatching(false);
  };

  const removeLocation = (id: string) => setLocations(prev => prev.filter(l => l.id !== id));

  const copyCoords = (loc: Location) => {
    navigator.clipboard.writeText(`${loc.lat.toFixed(6)}, ${loc.lng.toFixed(6)}`);
    setCopied(loc.id);
    setTimeout(() => setCopied(""), 2000);
  };

  const totalDistance = () => {
    let dist = 0;
    for (let i = 1; i < locations.length; i++) {
      dist += haversine(locations[i - 1].lat, locations[i - 1].lng, locations[i].lat, locations[i].lng);
    }
    return dist;
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <MapPin className="h-6 w-6 text-primary" />
          <div>
            <CardTitle className="text-2xl">Geolocation & Distance Calculator</CardTitle>
            <CardDescription>Get GPS coordinates and calculate distances using the Geolocation API</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex gap-2">
          <Input value={label} onChange={e => setLabel(e.target.value)} placeholder="Point label..." className="flex-1" />
          <Button onClick={() => getLocation(false)} disabled={loading}>
            <MapPin className="h-4 w-4 mr-2" />{loading ? "Locating..." : "Add Point"}
          </Button>
          {!watching ? (
            <Button variant="outline" onClick={() => getLocation(true)} title="Watch position live">
              <Navigation className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="destructive" onClick={stopWatch} title="Stop watching">
              <Navigation className="h-4 w-4" />
            </Button>
          )}
        </div>
        {watching && <Badge className="bg-green-500 text-white animate-pulse">● Live tracking</Badge>}
        {error && <div className="text-sm text-red-500 bg-red-50 rounded p-2">{error}</div>}

        {/* Locations list */}
        {locations.length > 0 && (
          <div className="space-y-3">
            {locations.map((loc, i) => (
              <div key={loc.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium flex items-center gap-2">
                    <Badge variant="outline">{i + 1}</Badge>
                    {loc.label}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => copyCoords(loc)}>
                      {copied === loc.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => removeLocation(loc.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Lat:</span> {loc.lat.toFixed(6)}° ({dmsString(loc.lat, true)})</div>
                  <div><span className="text-muted-foreground">Lng:</span> {loc.lng.toFixed(6)}° ({dmsString(loc.lng, false)})</div>
                  {loc.accuracy && <div><span className="text-muted-foreground">Accuracy:</span> ±{loc.accuracy.toFixed(0)}m</div>}
                  {loc.altitude != null && <div><span className="text-muted-foreground">Altitude:</span> {loc.altitude?.toFixed(1)}m</div>}
                </div>
                {i > 0 && (
                  <div className="text-sm text-muted-foreground border-t pt-1">
                    Distance from previous point:{" "}
                    <span className="font-medium text-primary">
                      {haversine(locations[i - 1].lat, locations[i - 1].lng, loc.lat, loc.lng).toFixed(3)} km
                    </span>
                  </div>
                )}
              </div>
            ))}

            {locations.length >= 2 && (
              <div className="border-2 border-primary/30 rounded-lg p-4 text-center">
                <div className="text-sm text-muted-foreground">Total Route Distance</div>
                <div className="text-3xl font-bold text-primary">{totalDistance().toFixed(3)} km</div>
                <div className="text-sm text-muted-foreground">{(totalDistance() * 0.621371).toFixed(3)} miles</div>
              </div>
            )}

            <Button variant="outline" size="sm" onClick={() => setLocations([])}>
              <Trash2 className="h-4 w-4 mr-2" />Clear All
            </Button>
          </div>
        )}

        {locations.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Click "Add Point" to capture your current GPS location.</p>
            <p className="text-xs mt-1">Add multiple points to calculate distances between them.</p>
          </div>
        )}

        <div className="bg-muted rounded-lg p-3 text-sm text-muted-foreground">
          <strong>Geolocation API</strong> — Uses your device's GPS/network location. All calculations (Haversine formula) happen locally. No data is sent to any server.
        </div>
      </CardContent>
    </Card>
  );
};
