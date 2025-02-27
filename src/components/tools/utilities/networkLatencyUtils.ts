// Network Latency Simulator utilities and types

// Error type definitions
export type IframeErrorType =
  | "x-frame-options"
  | "csp"
  | "unavailable"
  | "unknown"
  | null;

// Network profile interface
export interface NetworkProfile {
  id: string;
  name: string;
  downloadSpeed: number; // in kbps
  uploadSpeed: number; // in kbps
  latency: number; // in ms
  packetLoss: number; // percentage
  region?: string;
}

// Network request interface
export interface NetworkRequest {
  id: string;
  url: string;
  method: string;
  startTime: number;
  endTime?: number;
  size?: number;
  status?: number;
  latencyApplied: number;
}

// Predefined network profiles
export const predefinedProfiles: NetworkProfile[] = [
  {
    id: "slow-2g",
    name: "Slow 2G",
    downloadSpeed: 250,
    uploadSpeed: 50,
    latency: 2000,
    packetLoss: 3,
  },
  {
    id: "2g",
    name: "2G",
    downloadSpeed: 450,
    uploadSpeed: 150,
    latency: 1000,
    packetLoss: 2,
  },
  {
    id: "3g",
    name: "3G",
    downloadSpeed: 1500,
    uploadSpeed: 750,
    latency: 400,
    packetLoss: 1,
  },
  {
    id: "4g-lte",
    name: "4G LTE",
    downloadSpeed: 4000,
    uploadSpeed: 3000,
    latency: 100,
    packetLoss: 0.5,
  },
  {
    id: "dsl",
    name: "DSL",
    downloadSpeed: 8000,
    uploadSpeed: 1500,
    latency: 50,
    packetLoss: 0.2,
  },
  {
    id: "fiber",
    name: "Fiber",
    downloadSpeed: 50000,
    uploadSpeed: 20000,
    latency: 5,
    packetLoss: 0,
  },
];

// Regional network profiles
export const regionalProfiles: NetworkProfile[] = [
  {
    id: "rural-us",
    name: "Rural US",
    downloadSpeed: 2000,
    uploadSpeed: 500,
    latency: 200,
    packetLoss: 1,
    region: "North America",
  },
  {
    id: "eu-average",
    name: "EU Average",
    downloadSpeed: 12000,
    uploadSpeed: 3000,
    latency: 60,
    packetLoss: 0.1,
    region: "Europe",
  },
  {
    id: "india-mobile",
    name: "India Mobile",
    downloadSpeed: 1800,
    uploadSpeed: 500,
    latency: 300,
    packetLoss: 2,
    region: "Asia",
  },
  {
    id: "australia-rural",
    name: "Australia Rural",
    downloadSpeed: 1500,
    uploadSpeed: 400,
    latency: 350,
    packetLoss: 1.5,
    region: "Oceania",
  },
];

// Helper functions
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const formatBandwidth = (kbps: number): string => {
  if (kbps < 1000) {
    return `${kbps} Kbps`;
  } else {
    return `${(kbps / 1000).toFixed(1)} Mbps`;
  }
}; 