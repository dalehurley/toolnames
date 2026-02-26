import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import { Card } from "@/components/ui/card";
import {
  getTimeZoneById,
  getCoordinatesForTimeZone,
  TimeZone,
} from "../../../../utils/timeZones";

// Interface for the current times passed to the component
interface ConversionResult {
  timeZoneId: string;
  timeZone: TimeZone | undefined;
  localTime: Date;
  formattedTime: string;
  formattedDate: string;
  isBusinessHours: boolean;
}

// World map data
const geoUrl =
  "https://raw.githubusercontent.com/subyfly/topojson/refs/heads/master/world-countries.json";

interface MapVisualizationProps {
  sourceTimeZone: string;
  destinationTimeZones: string[];
  currentTimes: ConversionResult[];
}

export const MapVisualization = ({
  sourceTimeZone,
  destinationTimeZones,
}: MapVisualizationProps) => {
  const allTimeZones = [sourceTimeZone, ...destinationTimeZones];

  return (
    <Card className="p-2 h-full">
      <div className="h-64 md:h-80 w-full overflow-hidden">
        <ComposableMap projectionConfig={{ scale: 140 }}>
          <ZoomableGroup center={[0, 20]} zoom={1}>
            <Geographies geography={geoUrl}>
              {({ geographies }: { geographies: any[] }) =>
                geographies.map((geo: any) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#D6D6DA"
                    stroke="#FFFFFF"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: { outline: "none", fill: "#F5F5F5" },
                      pressed: { outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>

            {/* Add markers for selected time zones */}
            {allTimeZones.map((tzId) => {
              const coords = getCoordinatesForTimeZone(tzId);
              const isSource = tzId === sourceTimeZone;
              const tz = getTimeZoneById(tzId);
              return (
                <Marker key={tzId} coordinates={coords}>
                  <circle
                    r={isSource ? 6 : 4}
                    fill={isSource ? "#FF5533" : "#3F83F8"}
                    stroke="#FFFFFF"
                    strokeWidth={1.5}
                  />
                  <text
                    textAnchor="middle"
                    y={isSource ? -10 : -8}
                    style={{
                      fontFamily: "system-ui",
                      fontSize: isSource ? "10px" : "8px",
                      fontWeight: isSource ? "bold" : "normal",
                      fill: "#333",
                    }}
                  >
                    {tz?.name || tzId}
                  </text>
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>
      </div>
    </Card>
  );
};
