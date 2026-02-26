import { useState, useEffect } from "react";

/**
 * Custom hook for detecting if a media query matches
 * @param query Media query string to check (e.g., "(max-width: 768px)")
 * @returns Boolean indicating if the media query matches
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    // Create listener for media query changes
    const handleMediaQueryChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Modern browsers
    mediaQuery.addEventListener("change", handleMediaQueryChange);

    // Clean up function
    return () => {
      mediaQuery.removeEventListener("change", handleMediaQueryChange);
    };
  }, [query]); // Re-run effect if query changes

  return matches;
};
