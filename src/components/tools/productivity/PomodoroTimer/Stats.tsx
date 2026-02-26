import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Award } from "lucide-react";
import * as d3 from "d3";

interface StatsProps {
  completedSessions: number;
  resetStats: () => void;
}

// Data type for the visualization
interface DataPoint {
  date: Date;
  count: number;
}

export const Stats = ({ completedSessions, resetStats }: StatsProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  // Calculate estimated time (25 min per work session)
  const totalMinutes = completedSessions * 25;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  // Format time display
  const timeDisplay =
    hours > 0
      ? `${hours} hour${hours !== 1 ? "s" : ""} ${minutes} minute${
          minutes !== 1 ? "s" : ""
        }`
      : `${minutes} minute${minutes !== 1 ? "s" : ""}`;

  // Create the visualization using D3
  useEffect(() => {
    if (!svgRef.current || completedSessions === 0) return;

    // Clear previous visualization
    d3.select(svgRef.current).selectAll("*").remove();

    // Set up dimensions
    const width = svgRef.current.clientWidth;
    const height = 200;
    const padding = { top: 20, right: 20, bottom: 30, left: 40 };

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    // Generate some dummy data for visualization
    // In a real app, you'd use actual timestamps of completed sessions
    const today = new Date();
    const data: DataPoint[] = Array.from(
      { length: Math.min(completedSessions, 14) },
      (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (13 - i));
        return {
          date: date,
          count: Math.min(
            completedSessions - i,
            Math.floor(Math.random() * 8) + 1
          ),
        };
      }
    ).filter((d) => d.count > 0);

    // Create scales
    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.date.toISOString().slice(5, 10)))
      .range([padding.left, width - padding.right])
      .padding(0.2);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.count) || 1])
      .nice()
      .range([height - padding.bottom, padding.top]);

    // Draw axes
    svg
      .append("g")
      .attr("transform", `translate(0,${height - padding.bottom})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)");

    svg
      .append("g")
      .attr("transform", `translate(${padding.left},0)`)
      .call(
        d3
          .axisLeft(yScale)
          .ticks(5)
          .tickFormat((d) => d.toString())
      );

    // Add y-axis label
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", padding.left / 2)
      .attr("x", -(height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Sessions");

    // Draw bars
    data.forEach((d) => {
      const barX = xScale(d.date.toISOString().slice(5, 10)) || 0;
      const barY = yScale(d.count);
      const barWidth = xScale.bandwidth();
      const barHeight = height - padding.bottom - barY;

      // Create bar
      const bar = svg
        .append("rect")
        .attr("class", "bar")
        .attr("x", barX)
        .attr("y", barY)
        .attr("width", barWidth)
        .attr("height", barHeight)
        .attr("fill", "#ef4444")
        .attr("rx", 4)
        .attr("ry", 4);

      // Add mouse events
      bar.on("mouseover", () => {
        bar.attr("fill", "#b91c1c");

        // Add tooltip
        svg
          .append("text")
          .attr("class", "tooltip")
          .attr("x", barX + barWidth / 2)
          .attr("y", barY - 10)
          .text(`${d.count} session${d.count !== 1 ? "s" : ""}`)
          .style("font-size", "12px")
          .style("text-anchor", "middle");
      });

      bar.on("mouseout", () => {
        bar.attr("fill", "#ef4444");
        svg.selectAll(".tooltip").remove();
      });
    });
  }, [completedSessions]);

  // Show stats or empty state
  return (
    <Card className="border-none shadow-none">
      <CardContent className="p-0">
        <div className="flex flex-col space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-muted rounded-lg p-6 text-center">
              <h3 className="text-lg font-medium mb-2 flex items-center justify-center">
                <Award className="mr-2 h-5 w-5 text-yellow-500" />
                Completed Sessions
              </h3>
              <p className="text-4xl font-bold">{completedSessions}</p>
            </div>

            <div className="bg-muted rounded-lg p-6 text-center">
              <h3 className="text-lg font-medium mb-2">Focus Time</h3>
              <p className="text-3xl font-bold">{timeDisplay}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Great job staying focused!
              </p>
            </div>
          </div>

          {completedSessions > 0 ? (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Recent Progress</h3>
              <div className="w-full h-52 bg-card border rounded-md p-4">
                <svg ref={svgRef} width="100%" height="100%" />
              </div>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetStats}
                  className="flex items-center text-destructive hover:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Reset Stats
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-muted-foreground mb-2">
                Complete your first work session to see your stats
              </p>
              <p className="text-sm text-muted-foreground">
                Stats will appear here after you've completed at least one
                Pomodoro session
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
