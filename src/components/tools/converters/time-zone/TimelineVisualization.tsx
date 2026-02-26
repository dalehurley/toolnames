import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { formatInTimeZone, getTimeZoneById } from "@/utils/timeZones";

interface TimelineVisualizationProps {
  timeZones: string[];
}

export const TimelineVisualization = ({
  timeZones,
}: TimelineVisualizationProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Generate hours array (0-23)
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <Card className="p-4 w-full overflow-x-auto">
      <h3 className="text-lg font-semibold mb-4">Time Comparison</h3>

      <div className="min-w-[700px]">
        {/* Time scale at the top */}
        <div className="flex border-b">
          <div className="w-32 flex-shrink-0 font-semibold">Time Zone</div>
          <div className="flex-1 flex">
            {hours.map((hour) => (
              <div key={hour} className="flex-1 text-center text-xs py-1">
                {hour}:00
              </div>
            ))}
          </div>
        </div>

        {/* Time zone rows */}
        {timeZones.map((tzId) => {
          const tz = getTimeZoneById(tzId);
          if (!tz) return null;

          // Get current hour in this time zone
          const zonedHour = parseInt(formatInTimeZone(currentTime, tzId, "H"));

          return (
            <div key={tzId} className="flex border-b hover:bg-muted/50">
              <div className="w-32 flex-shrink-0 py-2 font-medium">
                {tz.emoji} {tz.name}
              </div>
              <div className="flex-1 flex">
                {hours.map((hour) => {
                  // Determine cell styling
                  const isCurrentHour = hour === zonedHour;
                  const isBusinessHour = hour >= 9 && hour < 17;
                  const isDayHour = hour >= 7 && hour < 20;

                  return (
                    <div
                      key={hour}
                      className={`
                        flex-1 h-10 border-r relative
                        ${isCurrentHour ? "bg-blue-200 dark:bg-blue-800" : ""}
                        ${
                          isBusinessHour
                            ? "bg-green-100 dark:bg-green-900/30"
                            : ""
                        }
                        ${!isDayHour ? "bg-slate-100 dark:bg-slate-800/30" : ""}
                      `}
                    >
                      {isCurrentHour && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-5 w-5 rounded-full bg-blue-500 dark:bg-blue-300 animate-pulse" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded bg-blue-500 dark:bg-blue-300 mr-1"></div>
          <span>Current Time</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded bg-green-100 dark:bg-green-900/30 mr-1"></div>
          <span>Business Hours (9AM-5PM)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded bg-slate-100 dark:bg-slate-800/30 mr-1"></div>
          <span>Night Hours</span>
        </div>
      </div>
    </Card>
  );
};
