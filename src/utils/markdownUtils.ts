/**
 * Extract tags from markdown content using #tag syntax
 */
export const extractTags = (content: string): string[] => {
  const tagRegex = /#([a-zA-Z0-9]+)/g;
  const matches = content.match(tagRegex) || [];
  return [...new Set(matches.map(tag => tag.substring(1).toLowerCase()))];
};

/**
 * Extract a title from the first heading in markdown content
 */
export const extractTitle = (content: string): string | null => {
  // Look for the first heading (any level)
  const headingRegex = /^#+\s+(.+)$/m;
  const match = content.match(headingRegex);
  
  if (match && match[1]) {
    return match[1].trim();
  }
  
  return null;
};

/**
 * Create a snippet from markdown content
 */
export const createSnippet = (content: string, maxLength: number = 100): string => {
  // Remove markdown formatting
  let plainText = content
    .replace(/#+\s+(.+)/g, '$1') // Remove headings
    .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.+?)\*/g, '$1') // Remove italic
    .replace(/~~(.+?)~~/g, '$1') // Remove strikethrough
    .replace(/`(.+?)`/g, '$1') // Remove inline code
    .replace(/```[\s\S]+?```/g, '') // Remove code blocks
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links but keep text
    .replace(/!\[.+?\]\(.+?\)/g, '[Image]') // Replace images with [Image]
    .replace(/^\s*[-*+]\s+/gm, '') // Remove list markers
    .replace(/^\s*\d+\.\s+/gm, '') // Remove numbered list markers
    .replace(/(\n|\r\n){2,}/g, '\n'); // Replace multiple line breaks with single
  
  // Trim and limit length
  plainText = plainText.trim();
  if (plainText.length <= maxLength) {
    return plainText;
  }
  
  return plainText.substring(0, maxLength) + '...';
}; 