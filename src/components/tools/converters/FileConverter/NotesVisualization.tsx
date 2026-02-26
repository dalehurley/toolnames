import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

// Extend the Note interface to include D3 simulation properties
interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  tags: string[];
  isPinned: boolean;
  contentLength?: number;
  wordCount?: number;
  age?: number;
  timeSinceUpdate?: number;
  preview?: string;
  // D3 force simulation properties
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  index?: number;
  vx?: number;
  vy?: number;
}

interface NotesVisualizationProps {
  data: unknown;
}

export const NotesVisualization: React.FC<NotesVisualizationProps> = ({
  data,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Parse data if it's a string
    let notes: Note[] = [];
    try {
      if (typeof data === "string") {
        notes = JSON.parse(data) as Note[];
      } else if (Array.isArray(data)) {
        notes = data as Note[];
      } else {
        return;
      }

      if (!Array.isArray(notes) || notes.length === 0) return;

      // Clear previous visualization
      if (svgRef.current) {
        d3.select(svgRef.current).selectAll("*").remove();
      }

      // Create the interactive notebook visualization
      createNotebookVisualization(notes);
    } catch (error) {
      console.error("Error processing notes data:", error);
    }
  }, [data]);

  const createNotebookVisualization = (notes: Note[]) => {
    if (!svgRef.current) return;

    // Setup dimensions
    const width = 800;
    const height = 500;
    const margin = { top: 40, right: 30, bottom: 50, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto;");

    // Create tooltip
    const tooltip = d3
      .select(tooltipRef.current)
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background-color", "white")
      .style("border", "1px solid #ddd")
      .style("border-radius", "5px")
      .style("padding", "10px")
      .style("box-shadow", "0 4px 8px rgba(0,0,0,0.1)")
      .style("pointer-events", "none")
      .style("z-index", "10");

    // Add title and subtitle
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", 24)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .text("Interactive Notes Visualization");

    // Create a group for the visualization
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Prepare data: add computed properties
    const processedNotes: Note[] = notes.map((note) => ({
      ...note,
      contentLength: note.content.length,
      wordCount: note.content.split(/\s+/).filter((word) => word.length > 0)
        .length,
      age: Math.floor((Date.now() - note.createdAt) / (1000 * 60 * 60 * 24)), // days
      timeSinceUpdate: Math.floor(
        (Date.now() - note.updatedAt) / (1000 * 60 * 60 * 24)
      ), // days
      preview:
        note.content.substring(0, 50) + (note.content.length > 50 ? "..." : ""),
    }));

    // Calculate time ranges for color scale
    const timeExtent = d3.extent(processedNotes, (d) => d.createdAt) as [
      number,
      number
    ];
    const colorScale = d3
      .scaleSequential()
      .domain(timeExtent)
      .interpolator(d3.interpolateViridis);

    // Create a simulation for the force-directed layout
    const simulation = d3
      .forceSimulation(processedNotes as d3.SimulationNodeDatum[])
      .force("charge", d3.forceManyBody().strength(50))
      .force("center", d3.forceCenter(innerWidth / 2, innerHeight / 2))
      .force(
        "collision",
        d3.forceCollide().radius((d) => {
          const note = d as Note;
          return Math.sqrt((note.contentLength || 10) * 1.2) + 20;
        })
      )
      .force("x", d3.forceX(innerWidth / 2).strength(0.05))
      .force("y", d3.forceY(innerHeight / 2).strength(0.05));

    // Create the note cards
    const cards = g
      .selectAll(".note-card")
      .data(processedNotes)
      .enter()
      .append("g")
      .attr("class", "note-card")
      .style("cursor", "pointer")
      .on("mouseover", function (_event, d: Note) {
        d3.select(this)
          .select("rect")
          .transition()
          .duration(300)
          .attr("stroke", "#000")
          .attr("stroke-width", 2);

        // Show tooltip
        tooltip.style("visibility", "visible").html(`
            <div style="font-weight: bold; margin-bottom: 5px;">${
              d.title || "Untitled Note"
            }</div>
            <div style="font-size: 12px; margin-bottom: 5px; color: #666;">
              Created: ${new Date(d.createdAt).toLocaleDateString()}
            </div>
            <div style="font-size: 12px; margin-bottom: 8px;">
              ${d.wordCount} words · ${d.contentLength} characters
            </div>
            <div style="font-size: 13px; border-top: 1px solid #eee; padding-top: 5px;">
              ${d.preview}
            </div>
          `);
      })
      .on("mousemove", function (event) {
        tooltip
          .style("top", `${event.pageY - 10}px`)
          .style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", function () {
        d3.select(this)
          .select("rect")
          .transition()
          .duration(300)
          .attr("stroke", "#ddd")
          .attr("stroke-width", 1);

        tooltip.style("visibility", "hidden");
      })
      .call(
        d3
          .drag<SVGGElement, Note>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    // Add rectangles for cards
    cards
      .append("rect")
      .attr("width", (d) =>
        Math.max(80, Math.min(Math.sqrt(d.contentLength || 10) * 5 + 50, 200))
      )
      .attr("height", (d) =>
        Math.max(60, Math.min(Math.sqrt(d.contentLength || 10) * 3 + 40, 150))
      )
      .attr("rx", 8)
      .attr("ry", 8)
      .attr("fill", (d) => colorScale(d.createdAt))
      .attr("opacity", 0.85)
      .attr("stroke", "#ddd")
      .attr("stroke-width", 1);

    // Add pin indicator for pinned notes
    cards
      .filter((d) => d.isPinned)
      .append("circle")
      .attr(
        "cx",
        (d) =>
          Math.max(
            80,
            Math.min(Math.sqrt(d.contentLength || 10) * 5 + 50, 200)
          ) - 10
      )
      .attr("cy", 10)
      .attr("r", 5)
      .attr("fill", "#ef4444");

    // Add title text
    cards
      .append("text")
      .attr("x", 10)
      .attr("y", 20)
      .attr("fill", "white")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .text(
        (d) =>
          (d.title || "Untitled Note").substring(0, 20) +
          ((d.title || "Untitled Note").length > 20 ? "..." : "")
      );

    // Add preview text
    cards
      .append("text")
      .attr("x", 10)
      .attr("y", 40)
      .attr("fill", "white")
      .style("font-size", "10px")
      .text(
        (d) => d.content.substring(0, 30) + (d.content.length > 30 ? "..." : "")
      );

    // Add creation date
    cards
      .append("text")
      .attr("x", 10)
      .attr(
        "y",
        (d) =>
          Math.max(
            60,
            Math.min(Math.sqrt(d.contentLength || 10) * 3 + 40, 150)
          ) - 10
      )
      .attr("fill", "rgba(255, 255, 255, 0.8)")
      .style("font-size", "8px")
      .text((d) => new Date(d.createdAt).toLocaleDateString());

    // Add legend for the color scale
    const legendWidth = 200;
    const legendHeight = 20;

    const legend = svg
      .append("g")
      .attr(
        "transform",
        `translate(${width - margin.right - legendWidth}, ${height - 30})`
      );

    // Create a linear gradient for the legend
    const defs = svg.append("defs");
    const linearGradient = defs
      .append("linearGradient")
      .attr("id", "notes-color-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");

    // Add color stops
    const colorStops = [0, 0.25, 0.5, 0.75, 1];
    colorStops.forEach((stop) => {
      const date = new Date(
        timeExtent[0] + (timeExtent[1] - timeExtent[0]) * stop
      );
      linearGradient
        .append("stop")
        .attr("offset", `${stop * 100}%`)
        .attr("stop-color", colorScale(date.getTime()));
    });

    // Add the rectangle with the gradient
    legend
      .append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#notes-color-gradient)");

    // Add labels
    legend
      .append("text")
      .attr("x", 0)
      .attr("y", legendHeight + 15)
      .style("font-size", "12px")
      .text("Older Notes");

    legend
      .append("text")
      .attr("x", legendWidth)
      .attr("y", legendHeight + 15)
      .attr("text-anchor", "end")
      .style("font-size", "12px")
      .text("Newer Notes");

    // Instructions text
    svg
      .append("text")
      .attr("x", margin.left)
      .attr("y", height - 10)
      .style("font-size", "12px")
      .style("fill", "#666")
      .text(
        "Drag notes to rearrange • Hover for details • Size represents content length"
      );

    // Update the positions on each tick of the simulation
    simulation.on("tick", () => {
      cards.attr("transform", (d) => `translate(${d.x || 0},${d.y || 0})`);
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">
          Interactive Notebook Visualization
        </CardTitle>
        <CardDescription>
          Drag the note cards to rearrange them. Hover over a card to see more
          details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <svg ref={svgRef} className="w-full overflow-visible" />
          <div ref={tooltipRef} className="absolute top-0 left-0" />
        </div>
      </CardContent>
    </Card>
  );
};
