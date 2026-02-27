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

/**
 * Count words in markdown content (strips markdown syntax first)
 */
export const countWords = (content: string): number => {
  const plain = content
    .replace(/```[\s\S]+?```/g, '') // Remove code blocks
    .replace(/`([^`]+)`/g, '$1') // Inline code: keep text
    .replace(/#+\s+/g, '') // Remove heading markers
    .replace(/[*_~]+/g, '') // Remove emphasis markers
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links: keep text
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '') // Remove images
    .replace(/^>\s+/gm, '') // Remove blockquote markers
    .replace(/^[-*+]\s+/gm, '') // Remove list markers
    .replace(/^\d+\.\s+/gm, '') // Remove numbered list markers
    .trim();

  if (!plain) return 0;
  return plain.split(/\s+/).filter(w => w.length > 0).length;
};

/**
 * Estimate reading time in minutes given word count (assumes 200 wpm)
 */
export const estimateReadingTime = (wordCount: number): number => {
  return Math.max(1, Math.ceil(wordCount / 200));
};
