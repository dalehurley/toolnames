import type { APIRoute } from "astro";
import {
  toolUrls,
  categoryUrls,
  unitConverterUrls,
  hashGeneratorUrls,
} from "@/data/toolUrls";

const BASE_URL = "https://toolnames.com";

interface SitemapEntry {
  url: string;
  lastmod: string;
  changefreq: string;
  priority: number;
}

function buildEntries(): SitemapEntry[] {
  const lastmod = new Date().toISOString().split("T")[0];
  const entries: SitemapEntry[] = [];

  // Homepage
  entries.push({ url: BASE_URL, lastmod, changefreq: "weekly", priority: 1.0 });

  // Category pages
  for (const path of categoryUrls) {
    entries.push({ url: `${BASE_URL}${path}`, lastmod, changefreq: "weekly", priority: 0.8 });
  }

  // Individual tool pages
  for (const path of toolUrls) {
    entries.push({ url: `${BASE_URL}${path}`, lastmod, changefreq: "monthly", priority: 0.7 });
  }

  // Unit converter sub-routes
  for (const path of unitConverterUrls) {
    entries.push({ url: `${BASE_URL}${path}`, lastmod, changefreq: "monthly", priority: 0.6 });
  }

  // Hash generator sub-routes
  for (const path of hashGeneratorUrls) {
    entries.push({ url: `${BASE_URL}${path}`, lastmod, changefreq: "monthly", priority: 0.6 });
  }

  // HTML sitemap page
  entries.push({ url: `${BASE_URL}/sitemap`, lastmod, changefreq: "weekly", priority: 0.5 });

  return entries;
}

function renderXML(entries: SitemapEntry[]): string {
  const urls = entries
    .map(
      (e) =>
        `  <url>\n` +
        `    <loc>${e.url}</loc>\n` +
        `    <lastmod>${e.lastmod}</lastmod>\n` +
        `    <changefreq>${e.changefreq}</changefreq>\n` +
        `    <priority>${e.priority.toFixed(1)}</priority>\n` +
        `  </url>`
    )
    .join("\n");

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls +
    `\n</urlset>`
  );
}

export const GET: APIRoute = () => {
  const xml = renderXML(buildEntries());
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
};
