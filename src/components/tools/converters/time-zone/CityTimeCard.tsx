import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { formatInTimeZone, isBusinessHours } from "../../../../utils/timeZones";

interface CityTimeCardProps {
  city: string;
  timeZoneId: string;
  emoji?: string;
}

export const CityTimeCard = ({
  city,
  timeZoneId,
  emoji,
}: CityTimeCardProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const formattedTime = formatInTimeZone(currentTime, timeZoneId, "h:mm a");
  const formattedDate = formatInTimeZone(currentTime, timeZoneId, "EEE, MMM d");
  const businessHours = isBusinessHours(currentTime, timeZoneId);

  return (
    <Card
      className={`p-4 ${
        businessHours ? "border-green-500 dark:border-green-700" : ""
      }`}
    >
      <div className="flex items-center gap-2">
        <h4 className="font-medium">
          {emoji ? `${emoji} ` : ""}
          {city}
        </h4>
      </div>
      <p className="text-2xl font-semibold">{formattedTime}</p>
      <p className="text-sm text-muted-foreground">{formattedDate}</p>
      <div className="mt-2 text-xs">
        {businessHours ? (
          <span className="text-green-600 dark:text-green-400">
            Business Hours
          </span>
        ) : (
          <span className="text-muted-foreground">After Hours</span>
        )}
      </div>
    </Card>
  );
};
