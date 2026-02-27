import { useMemo } from "react";

export type ArtifactType =
  | "html"
  | "react"
  | "svg"
  | "mermaid"
  | "python"
  | "csv"
  | "json"
  | null;

export interface Artifact {
  type: ArtifactType;
  code: string;
  language: string;
  title?: string;
}

const ARTIFACT_FENCE_TYPES: Record<string, ArtifactType> = {
  html: "html",
  jsx: "react",
  tsx: "react",
  svg: "svg",
  mermaid: "mermaid",
  python: "python",
  csv: "csv",
  json: "json",
};

export function detectArtifact(content: string): Artifact | null {
  if (!content) return null;

  // Check for explicit artifact tags first
  const tagMatch = content.match(
    /<artifact\s+type="([^"]+)"(?:\s+title="([^"]+)")?[^>]*>([\s\S]*?)<\/artifact>/
  );
  if (tagMatch) {
    const type = tagMatch[1] as ArtifactType;
    return {
      type,
      code: tagMatch[3].trim(),
      language: tagMatch[1],
      title: tagMatch[2],
    };
  }

  // Check for fenced code blocks in priority order
  const fenceRegex = /```(\w+)\n([\s\S]*?)```/g;
  let match;
  let bestArtifact: Artifact | null = null;

  while ((match = fenceRegex.exec(content)) !== null) {
    const lang = match[1].toLowerCase();
    const code = match[2].trim();
    const artifactType = ARTIFACT_FENCE_TYPES[lang];

    if (artifactType) {
      // Prioritize HTML > React > SVG > others
      const priority: Record<string, number> = {
        react: 10,
        html: 9,
        svg: 8,
        mermaid: 7,
        python: 6,
        csv: 5,
        json: 4,
      };

      if (
        !bestArtifact ||
        (priority[artifactType] || 0) > (priority[bestArtifact.type || ""] || 0)
      ) {
        bestArtifact = { type: artifactType, code, language: lang };
      }
    }
  }

  return bestArtifact;
}

export function useArtifact(content: string) {
  return useMemo(() => detectArtifact(content), [content]);
}
