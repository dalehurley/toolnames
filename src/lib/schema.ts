import type { Tool } from "@/contexts/toolsData";

export function buildCollectionSchema(
  title: string,
  description: string,
  url: string,
  tools: Tool[]
): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": title,
    "description": description,
    "url": url,
    "hasPart": tools.map((t) => ({
      "@type": "SoftwareApplication",
      "name": t.title,
      "url": `https://toolnames.com${t.url}`,
      "applicationCategory": "UtilityApplication",
      "operatingSystem": "Web Browser",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
    }))
  });
}
