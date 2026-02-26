import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOData {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  structuredData?: object;
  noindex?: boolean;
}

export const useSEO = (seoData: SEOData) => {
  const location = useLocation();

  useEffect(() => {
    // Update document title
    document.title = seoData.title;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, property?: boolean) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let metaTag = document.querySelector(selector) as HTMLMetaElement;

      if (!metaTag) {
        metaTag = document.createElement('meta');
        if (property) {
          metaTag.setAttribute('property', name);
        } else {
          metaTag.setAttribute('name', name);
        }
        document.head.appendChild(metaTag);
      }

      metaTag.setAttribute('content', content);
    };

    // Update canonical link
    const updateCanonicalLink = (href: string) => {
      let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;

      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }

      canonicalLink.setAttribute('href', href);
    };

    // Basic meta tags
    updateMetaTag('description', seoData.description);
    
    if (seoData.keywords) {
      updateMetaTag('keywords', seoData.keywords);
    }

    // Robots meta tag
    if (seoData.noindex) {
      updateMetaTag('robots', 'noindex, nofollow');
    } else {
      updateMetaTag('robots', 'index, follow');
    }

    // Open Graph tags
    updateMetaTag('og:title', seoData.ogTitle || seoData.title, true);
    updateMetaTag('og:description', seoData.ogDescription || seoData.description, true);
    updateMetaTag('og:type', seoData.ogType || 'website', true);
    updateMetaTag('og:url', window.location.href, true);
    
    if (seoData.ogImage) {
      updateMetaTag('og:image', seoData.ogImage, true);
      updateMetaTag('og:image:alt', seoData.ogTitle || seoData.title, true);
    }

    // Twitter Card tags
    updateMetaTag('twitter:card', seoData.twitterCard || 'summary_large_image');
    updateMetaTag('twitter:title', seoData.twitterTitle || seoData.ogTitle || seoData.title);
    updateMetaTag('twitter:description', seoData.twitterDescription || seoData.ogDescription || seoData.description);
    
    if (seoData.twitterImage || seoData.ogImage) {
      updateMetaTag('twitter:image', seoData.twitterImage || seoData.ogImage || '');
    }

    // Canonical URL
    const canonicalUrl = seoData.canonical || window.location.href;
    updateCanonicalLink(canonicalUrl);

    // Structured Data (JSON-LD)
    if (seoData.structuredData) {
      // Remove existing structured data
      const existingScript = document.querySelector('script[type="application/ld+json"]');
      if (existingScript) {
        existingScript.remove();
      }

      // Add new structured data
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(seoData.structuredData);
      document.head.appendChild(script);
    }

    // Update viewport for mobile optimization
    let viewportMeta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.setAttribute('name', 'viewport');
      document.head.appendChild(viewportMeta);
    }
    viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0');

  }, [seoData, location.pathname]);
};

// Helper function to generate structured data for tools
export const generateToolStructuredData = (tool: {
  title: string;
  description: string;
  url: string;
  category: string;
}) => {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": tool.title,
    "description": tool.description,
    "url": `${window.location.origin}${tool.url}`,
    "applicationCategory": "Utility",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "creator": {
      "@type": "Organization",
      "name": "ToolNames",
      "url": window.location.origin
    },
    "publisher": {
      "@type": "Organization",
      "name": "ToolNames",
      "url": window.location.origin
    }
  };
};

// Helper function to generate breadcrumb structured data
export const generateBreadcrumbStructuredData = (breadcrumbs: Array<{ name: string; url: string }>) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": `${window.location.origin}${crumb.url}`
    }))
  };
};

// Helper function to generate FAQ structured data
export const generateFAQStructuredData = (faqs: Array<{ question: string; answer: string }>) => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}; 