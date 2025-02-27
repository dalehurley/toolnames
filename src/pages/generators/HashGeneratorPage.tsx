import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { HashGenerator } from "@/components/tools/generators/HashGenerator";

interface HashGeneratorPageProps {
  algorithm?: string;
}

export const HashGeneratorPage = ({
  algorithm: propAlgorithm,
}: HashGeneratorPageProps = {}) => {
  // Extract the algorithm parameter from the URL
  const { algorithm: paramAlgorithm } = useParams<{ algorithm?: string }>();

  // Use prop value if available, otherwise use URL parameter
  const algorithm = propAlgorithm || paramAlgorithm;

  // SEO title and description based on the algorithm
  useEffect(() => {
    let pageTitle =
      "Hash Generator - Secure Cryptographic Hash Tool | ToolNames";
    let metaDescription =
      "Generate secure cryptographic hashes from text using various algorithms with our free hash generator tool.";

    if (algorithm) {
      const algorithmMap: Record<
        string,
        { title: string; description: string }
      > = {
        sha1: {
          title: "SHA-1 Hash Generator - Create SHA-1 Hashes | ToolNames",
          description:
            "Generate secure SHA-1 cryptographic hashes from text with our free online SHA-1 hash generator tool. 160-bit hash, use with caution.",
        },
        sha256: {
          title: "SHA-256 Hash Generator - Create SHA-256 Hashes | ToolNames",
          description:
            "Generate secure SHA-256 cryptographic hashes from text with our free online SHA-256 hash generator tool. 256-bit hash, widely used and recommended.",
        },
        sha384: {
          title: "SHA-384 Hash Generator - Create SHA-384 Hashes | ToolNames",
          description:
            "Generate secure SHA-384 cryptographic hashes from text with our free online SHA-384 hash generator tool. 384-bit hash, stronger than SHA-256.",
        },
        sha512: {
          title: "SHA-512 Hash Generator - Create SHA-512 Hashes | ToolNames",
          description:
            "Generate secure SHA-512 cryptographic hashes from text with our free online SHA-512 hash generator tool. 512-bit hash, most secure.",
        },
      };

      if (algorithmMap[algorithm]) {
        pageTitle = algorithmMap[algorithm].title;
        metaDescription = algorithmMap[algorithm].description;
      }
    }

    document.title = pageTitle;

    // Update meta description
    const metaDescriptionTag = document.querySelector(
      'meta[name="description"]'
    );
    if (metaDescriptionTag) {
      metaDescriptionTag.setAttribute("content", metaDescription);
    } else {
      const newMetaTag = document.createElement("meta");
      newMetaTag.name = "description";
      newMetaTag.content = metaDescription;
      document.head.appendChild(newMetaTag);
    }
  }, [algorithm]);

  console.log("HashGeneratorPage algorithm:", algorithm);
  return <HashGenerator initialAlgorithm={algorithm} />;
};

export default HashGeneratorPage;
