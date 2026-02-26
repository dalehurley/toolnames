import { availableTools } from "@/contexts/toolsData";

export interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export const generateSitemapEntries = (): SitemapEntry[] => {
  const baseUrl = window.location.origin;
  const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  
  const entries: SitemapEntry[] = [];

  // Homepage
  entries.push({
    url: baseUrl,
    lastmod: currentDate,
    changefreq: 'weekly',
    priority: 1.0
  });

  // Category pages
  const categories = [
    'calculators',
    'converters', 
    'generators',
    'utilities',
    'file-tools',
    'seo',
    'productivity',
    'design',
    'lottery'
  ];

  categories.forEach(category => {
    entries.push({
      url: `${baseUrl}/${category}`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: 0.8
    });
  });

  // Individual tool pages
  availableTools.forEach(tool => {
    entries.push({
      url: `${baseUrl}${tool.url}`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: 0.7
    });
  });

  // Unit converter sub-routes
  const unitConverterRoutes = generateUnitConverterRoutes();
  unitConverterRoutes.forEach(route => {
    entries.push({
      url: `${baseUrl}${route.url}`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: 0.6
    });
  });

  // Hash generator sub-routes
  const hashGeneratorRoutes = generateHashGeneratorRoutes();
  hashGeneratorRoutes.forEach(route => {
    entries.push({
      url: `${baseUrl}${route.url}`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: 0.6
    });
  });

  // Sitemap page
  entries.push({
    url: `${baseUrl}/sitemap`,
    lastmod: currentDate,
    changefreq: 'weekly',
    priority: 0.5
  });

  return entries;
};

const generateUnitConverterRoutes = () => {
  const conversions = [
    // Length converters
    { from: "millimeters", to: "centimeters", category: "length" },
    { from: "millimeters", to: "meters", category: "length" },
    { from: "millimeters", to: "kilometers", category: "length" },
    { from: "millimeters", to: "inches", category: "length" },
    { from: "millimeters", to: "feet", category: "length" },
    { from: "centimeters", to: "millimeters", category: "length" },
    { from: "centimeters", to: "meters", category: "length" },
    { from: "centimeters", to: "kilometers", category: "length" },
    { from: "centimeters", to: "inches", category: "length" },
    { from: "centimeters", to: "feet", category: "length" },
    { from: "meters", to: "millimeters", category: "length" },
    { from: "meters", to: "centimeters", category: "length" },
    { from: "meters", to: "kilometers", category: "length" },
    { from: "meters", to: "feet", category: "length" },
    { from: "meters", to: "miles", category: "length" },
    { from: "kilometers", to: "meters", category: "length" },
    { from: "kilometers", to: "miles", category: "length" },
    { from: "inches", to: "centimeters", category: "length" },
    { from: "inches", to: "millimeters", category: "length" },
    { from: "inches", to: "feet", category: "length" },
    { from: "feet", to: "inches", category: "length" },
    { from: "feet", to: "meters", category: "length" },
    { from: "miles", to: "kilometers", category: "length" },

    // Weight converters
    { from: "grams", to: "kilograms", category: "weight" },
    { from: "grams", to: "ounces", category: "weight" },
    { from: "grams", to: "pounds", category: "weight" },
    { from: "kilograms", to: "grams", category: "weight" },
    { from: "kilograms", to: "pounds", category: "weight" },
    { from: "kilograms", to: "stones", category: "weight" },
    { from: "ounces", to: "grams", category: "weight" },
    { from: "ounces", to: "pounds", category: "weight" },
    { from: "pounds", to: "kilograms", category: "weight" },
    { from: "pounds", to: "ounces", category: "weight" },
    { from: "pounds", to: "stones", category: "weight" },

    // Temperature converters
    { from: "celsius", to: "fahrenheit", category: "temperature" },
    { from: "celsius", to: "kelvin", category: "temperature" },
    { from: "fahrenheit", to: "celsius", category: "temperature" },
    { from: "fahrenheit", to: "kelvin", category: "temperature" },
    { from: "kelvin", to: "celsius", category: "temperature" },
    { from: "kelvin", to: "fahrenheit", category: "temperature" },

    // Volume converters
    { from: "milliliters", to: "liters", category: "volume" },
    { from: "milliliters", to: "gallons", category: "volume" },
    { from: "liters", to: "milliliters", category: "volume" },
    { from: "liters", to: "gallons", category: "volume" },
    { from: "liters", to: "cubic-meters", category: "volume" },
    { from: "gallons", to: "liters", category: "volume" },
    { from: "quarts", to: "liters", category: "volume" },
    { from: "cups", to: "milliliters", category: "volume" },

    // Area converters
    { from: "square-meters", to: "square-feet", category: "area" },
    { from: "square-feet", to: "square-meters", category: "area" },
    { from: "square-kilometers", to: "square-miles", category: "area" },
    { from: "acres", to: "hectares", category: "area" },
    { from: "hectares", to: "acres", category: "area" },

    // Time converters
    { from: "seconds", to: "minutes", category: "time" },
    { from: "minutes", to: "hours", category: "time" },
    { from: "hours", to: "days", category: "time" },
    { from: "days", to: "weeks", category: "time" },
    { from: "weeks", to: "months", category: "time" },
    { from: "months", to: "years", category: "time" },
  ];

  return conversions.map(({ from, to, category }) => ({
    url: `/converters/unit-converter/${category}/${from}-to-${to}`,
  }));
};

const generateHashGeneratorRoutes = () => {
  const hashAlgorithms = ["sha1", "sha256", "sha384", "sha512"];
  
  return hashAlgorithms.map(algorithm => ({
    url: `/generators/hash-generator/${algorithm}`,
  }));
};

export const generateXMLSitemap = (): string => {
  const entries = generateSitemapEntries();
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  entries.forEach(entry => {
    xml += '  <url>\n';
    xml += `    <loc>${entry.url}</loc>\n`;
    if (entry.lastmod) {
      xml += `    <lastmod>${entry.lastmod}</lastmod>\n`;
    }
    if (entry.changefreq) {
      xml += `    <changefreq>${entry.changefreq}</changefreq>\n`;
    }
    if (entry.priority) {
      xml += `    <priority>${entry.priority.toFixed(1)}</priority>\n`;
    }
    xml += '  </url>\n';
  });
  
  xml += '</urlset>';
  
  return xml;
};

// Function to download sitemap as XML file
export const downloadSitemapXML = () => {
  const xmlContent = generateXMLSitemap();
  const blob = new Blob([xmlContent], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = 'sitemap.xml';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}; 