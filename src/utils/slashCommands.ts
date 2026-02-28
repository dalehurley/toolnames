/**
 * Slash command runner — lightweight local utilities that execute instantly in
 * the chat without calling any AI API. Type / to trigger autocomplete.
 */

export interface SlashCommand {
  command: string;
  aliases?: string[];
  description: string;
  argHint?: string; // shown as placeholder after the command name
  hasArgs: boolean;
}

export const SLASH_COMMANDS: SlashCommand[] = [
  { command: "/uuid",       hasArgs: false, description: "Generate a random UUID v4" },
  { command: "/date",       hasArgs: false, description: "Current date (long format)" },
  { command: "/time",       hasArgs: false, description: "Current local time" },
  { command: "/datetime",   hasArgs: false, description: "Full date + time" },
  { command: "/timestamp",  hasArgs: false, description: "Unix timestamp in milliseconds" },
  { command: "/flip",       hasArgs: false, description: "Flip a coin (heads or tails)" },
  { command: "/roll",       hasArgs: true,  argHint: "NdS e.g. 2d6", description: "Roll dice — e.g. /roll 2d6" },
  { command: "/random",     hasArgs: true,  argHint: "min max",       description: "Random integer — e.g. /random 1 100" },
  { command: "/upper",      hasArgs: true,  argHint: "text",          description: "Convert text to UPPERCASE" },
  { command: "/lower",      hasArgs: true,  argHint: "text",          description: "Convert text to lowercase" },
  { command: "/slug",       hasArgs: true,  argHint: "My Page Title", description: "Convert to URL-friendly slug" },
  { command: "/wordcount",  hasArgs: true,  argHint: "your text…",    description: "Count words and characters" },
  { command: "/base64",     hasArgs: true,  argHint: "text to encode",description: "Encode text to base64" },
  { command: "/decode",     hasArgs: true,  argHint: "base64string",  description: "Decode a base64 string" },
  { command: "/reverse",    hasArgs: true,  argHint: "text",          description: "Reverse a string" },
  { command: "/repeat",     hasArgs: true,  argHint: "N text",        description: "Repeat text N times — e.g. /repeat 3 ha" },
  { command: "/help",       hasArgs: false, description: "List all slash commands" },
];

/** Returns the human-readable result string, or null if the command is unknown. */
export function executeSlashCommand(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("/")) return null;

  const spaceIdx = trimmed.indexOf(" ");
  const cmd = (spaceIdx === -1 ? trimmed : trimmed.slice(0, spaceIdx)).toLowerCase();
  const args = spaceIdx === -1 ? "" : trimmed.slice(spaceIdx + 1).trim();

  switch (cmd) {
    case "/uuid":
      return `🔑 **UUID:** \`${crypto.randomUUID()}\``;

    case "/date":
      return `📅 **Date:** ${new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })}`;

    case "/time":
      return `🕐 **Time:** ${new Date().toLocaleTimeString()}`;

    case "/datetime":
      return `🗓️ **Date & time:** ${new Date().toLocaleString()}`;

    case "/timestamp":
      return `⏱️ **Unix timestamp (ms):** \`${Date.now()}\``;

    case "/flip":
      return `🪙 **Coin flip:** **${Math.random() < 0.5 ? "Heads 🟡" : "Tails 🔵"}**`;

    case "/roll": {
      const m = args.match(/^(\d+)?d(\d+)$/i);
      if (!m) {
        // Default: d6
        return `🎲 **d6 roll:** **${Math.ceil(Math.random() * 6)}**  *(usage: /roll 2d6)*`;
      }
      const count = Math.min(parseInt(m[1] ?? "1"), 20);
      const sides = Math.min(parseInt(m[2]), 10000);
      const rolls = Array.from({ length: count }, () => Math.ceil(Math.random() * sides));
      const total = rolls.reduce((a, b) => a + b, 0);
      return `🎲 **${count}d${sides}:** ${rolls.join(" + ")} = **${total}**`;
    }

    case "/random": {
      const parts = args.split(/\s+/).map(Number).filter(Number.isFinite);
      const lo = parts.length >= 2 ? Math.min(parts[0], parts[1]) : 0;
      const hi = parts.length >= 2 ? Math.max(parts[0], parts[1]) : (parts[0] ?? 100);
      const result = Math.floor(Math.random() * (hi - lo + 1)) + lo;
      return `🎲 **Random (${lo}–${hi}):** **${result}**`;
    }

    case "/upper":
      if (!args) return `⬆️ Usage: \`/upper <text>\``;
      return `⬆️ **UPPERCASE:**\n\`${args.toUpperCase()}\``;

    case "/lower":
      if (!args) return `⬇️ Usage: \`/lower <text>\``;
      return `⬇️ **lowercase:**\n\`${args.toLowerCase()}\``;

    case "/slug":
      if (!args) return `🔗 Usage: \`/slug <text>\``;
      return `🔗 **Slug:**\n\`${args
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")}\``;

    case "/wordcount":
      if (!args) return `📝 Usage: \`/wordcount <text>\``;
      return `📝 **Word count:** **${args.trim().split(/\s+/).filter(Boolean).length}** words · **${args.length}** characters`;

    case "/base64":
      if (!args) return `🔒 Usage: \`/base64 <text>\``;
      try {
        return `🔒 **Base64 encoded:**\n\`${btoa(unescape(encodeURIComponent(args)))}\``;
      } catch {
        return "❌ Encoding failed — text must be valid UTF-8.";
      }

    case "/decode":
      if (!args) return `🔓 Usage: \`/decode <base64>\``;
      try {
        return `🔓 **Decoded:**\n\`${decodeURIComponent(escape(atob(args.trim())))}\``;
      } catch {
        return "❌ Not valid base64.";
      }

    case "/reverse":
      if (!args) return `↩️ Usage: \`/reverse <text>\``;
      return `↩️ **Reversed:**\n\`${[...args].reverse().join("")}\``;

    case "/repeat": {
      const firstSpace = args.indexOf(" ");
      if (firstSpace === -1) return `🔁 Usage: \`/repeat <N> <text>\``;
      const n = Math.min(Math.max(parseInt(args.slice(0, firstSpace)) || 1, 1), 50);
      const what = args.slice(firstSpace + 1);
      return `🔁 **Repeated ${n}×:**\n${Array(n).fill(what).join(" ")}`;
    }

    case "/help":
      return (
        "**Slash commands** — run instantly without calling the AI:\n\n" +
        SLASH_COMMANDS.filter((c) => c.command !== "/help")
          .map((c) => `\`${c.command}${c.argHint ? " " + c.argHint : ""}\` — ${c.description}`)
          .join("\n")
      );

    default:
      return null; // Not recognised — let the AI handle it
  }
}
