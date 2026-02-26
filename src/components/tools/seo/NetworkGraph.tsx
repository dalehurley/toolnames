import React, { useRef, useEffect } from "react";
import cytoscape from "cytoscape";
import coseBilkent from "cytoscape-cose-bilkent";

// Register the layout
cytoscape.use(coseBilkent);

// Update the layout options type
type CoseBilkentLayout = {
  name: string;
  animate?: boolean;
  animationDuration?: number;
  idealEdgeLength?: number;
  nodeRepulsion?: number;
  randomize?: boolean;
  nodeDimensionsIncludeLabels?: boolean;
};

interface PageNode {
  id: string;
  url: string;
  title: string;
  incomingLinks: number;
  outgoingLinks: number;
}

interface LinkEdge {
  source: string;
  target: string;
  label: string;
}

interface AnalysisResult {
  nodes: PageNode[];
  edges: LinkEdge[];
  stats: {
    totalPages: number;
    totalLinks: number;
    averageLinksPerPage: number;
    orphanedPages: PageNode[];
    mostLinkedPages: PageNode[];
    deadEndPages: PageNode[];
  };
}

interface NetworkGraphProps {
  result: AnalysisResult;
  showLabels: boolean;
  filterOrphaned: boolean;
  layoutType: string;
}

const NetworkGraph: React.FC<NetworkGraphProps> = ({
  result,
  showLabels,
  filterOrphaned,
  layoutType,
}) => {
  const graphRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);

  // Render the graph visualization using Cytoscape
  const renderGraph = (data: AnalysisResult) => {
    if (!graphRef.current) return;

    // Filter orphaned pages if option is enabled
    const filteredNodes = filterOrphaned
      ? data.nodes.filter((node) => !data.stats.orphanedPages.includes(node))
      : data.nodes;

    const filteredEdges = filterOrphaned
      ? data.edges.filter(
          (edge) =>
            filteredNodes.some((node) => node.id === edge.source) &&
            filteredNodes.some((node) => node.id === edge.target)
        )
      : data.edges;

    // Prepare data for Cytoscape
    const elements = [
      ...filteredNodes.map((node) => ({
        data: {
          id: node.id,
          label: showLabels ? node.title : "",
          url: node.url,
          inLinks: node.incomingLinks,
          outLinks: node.outgoingLinks,
        },
      })),
      ...filteredEdges.map((edge) => ({
        data: {
          id: `${edge.source}-${edge.target}`,
          source: edge.source,
          target: edge.target,
          label: showLabels ? edge.label : "",
        },
      })),
    ];

    // Update cytoscape initialization with typed layout options
    const layoutOptions: CoseBilkentLayout = {
      name: layoutType,
      animate: true,
      animationDuration: 1000,
      idealEdgeLength: 100,
      nodeRepulsion: 4500,
      randomize: false,
      nodeDimensionsIncludeLabels: true,
    };

    // Initialize Cytoscape
    cyRef.current = cytoscape({
      container: graphRef.current,
      elements,
      style: [
        {
          selector: "node",
          style: {
            "background-color": (ele: cytoscape.NodeSingular) =>
              ele.data("inLinks") > 3 ? "#ef4444" : "#3b82f6",
            label: "data(label)",
            "text-valign": "center",
            "text-halign": "center",
            color: "#ffffff",
            "font-size": "12px",
            width: (ele: cytoscape.NodeSingular) =>
              Math.max(30, ele.data("inLinks") * 5 + 20),
            height: (ele: cytoscape.NodeSingular) =>
              Math.max(30, ele.data("inLinks") * 5 + 20),
            "text-wrap": "wrap",
            "text-max-width": "80px",
          },
        },
        {
          selector: "edge",
          style: {
            width: 2,
            "line-color": "#64748b",
            "target-arrow-color": "#64748b",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
            label: showLabels ? "data(label)" : "",
            "font-size": "10px",
            color: "#475569",
          },
        },
        {
          selector: "node:selected",
          style: {
            "border-width": 3,
            "border-color": "#f59e0b",
          },
        },
      ],
      layout: layoutOptions,
    });

    // Add event handlers
    cyRef.current.on("tap", "node", (evt: cytoscape.EventObject) => {
      const node = evt.target;
      const url = node.data("url");
      console.log("Clicked node:", url);
    });

    cyRef.current.on("mouseover", "node", (evt: cytoscape.EventObject) => {
      const node = evt.target;
      node.style({
        "background-color": "#10b981",
      });
    });

    cyRef.current.on("mouseout", "node", (evt: cytoscape.EventObject) => {
      const node = evt.target;
      node.style({
        "background-color": node.data("inLinks") > 3 ? "#ef4444" : "#3b82f6",
      });
    });
  };

  // Re-render graph when props change
  useEffect(() => {
    if (result) {
      renderGraph(result);
    }

    // Cleanup
    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [result, showLabels, filterOrphaned, layoutType]);

  return <div ref={graphRef} className="h-96 w-full border rounded-lg" />;
};

export default NetworkGraph;
