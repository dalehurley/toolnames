export interface AttachedFile {
  id: string;
  name: string;
  type: "image" | "text" | "pdf" | "audio" | "unknown";
  mimeType: string;
  content?: string; // text content or base64
  base64?: string; // for images
  size: number;
}

export async function readFile(file: File): Promise<AttachedFile> {
  const id = Math.random().toString(36).slice(2);
  const mimeType = file.type;

  // Determine type
  let type: AttachedFile["type"] = "unknown";
  if (mimeType.startsWith("image/")) type = "image";
  else if (mimeType === "application/pdf") type = "pdf";
  else if (mimeType.startsWith("audio/") || mimeType.startsWith("video/")) type = "audio";
  else if (
    mimeType.startsWith("text/") ||
    [
      "application/json",
      "application/javascript",
      "application/typescript",
      "application/xml",
    ].includes(mimeType) ||
    /\.(js|ts|tsx|jsx|py|md|csv|txt|yaml|yml|html|css|rs|go|java|cpp|c|sh|bash|sql)$/.test(
      file.name
    )
  ) {
    type = "text";
  }

  const base: Omit<AttachedFile, "content" | "base64"> = {
    id,
    name: file.name,
    type,
    mimeType,
    size: file.size,
  };

  if (type === "image") {
    const base64 = await readAsBase64(file);
    return { ...base, base64, content: undefined };
  } else if (type === "text") {
    const content = await readAsText(file);
    return { ...base, content };
  } else if (type === "pdf") {
    // Simple text extraction placeholder - in practice you'd use pdf.js
    const content = `[PDF: ${file.name}] — PDF text extraction not available in this browser session. Please paste text content manually.`;
    return { ...base, content };
  } else if (type === "audio") {
    return {
      ...base,
      content: `[Audio file: ${file.name}] — Attach an OpenAI key to transcribe via Whisper.`,
    };
  }

  return { ...base, content: `[File: ${file.name}]` };
}

function readAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

function readAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the data URL prefix to get pure base64
      resolve(result.split(",")[1] || result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function buildMessageContent(
  text: string,
  attachments: AttachedFile[]
): string | Array<{ type: string; text?: string; image_url?: { url: string } }> {
  if (attachments.length === 0) return text;

  const parts: Array<{ type: string; text?: string; image_url?: { url: string } }> = [];

  // Add text part
  if (text) parts.push({ type: "text", text });

  // Add attachments
  for (const att of attachments) {
    if (att.type === "image" && att.base64) {
      parts.push({
        type: "image_url",
        image_url: { url: `data:${att.mimeType};base64,${att.base64}` },
      });
    } else if (att.content) {
      // Inject file content as text
      const label = att.type === "text" ? att.name : att.name;
      parts.push({
        type: "text",
        text: `\n\n--- Attached: ${label} ---\n${att.content}\n--- End of ${label} ---`,
      });
    }
  }

  if (parts.length === 1 && parts[0].type === "text") {
    return parts[0].text || text;
  }

  return parts;
}
