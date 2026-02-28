/**
 * Client-side tool definitions for AI tool calling.
 * Each tool has an OpenAI-compatible schema and a client-side executor.
 */

// Using mathjs for calculations & unit conversions
// Using qrcode for QR generation (dynamically imported to keep bundle lean)
import { requestHumanInput } from "@/utils/humanInput";

export type ToolResultType =
  | "calculator"
  | "qrcode"
  | "unit_converter"
  | "json_formatter"
  | "password_generator"
  | "color_palette"
  | "image_generation"
  | "text_hash"
  | "regex_tester"
  | "base64"
  | "ask_human";

export interface ClientToolResult {
  type: ToolResultType;
  data: Record<string, unknown>;
  text: string; // textual summary returned to AI
}

export interface ClientTool {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
  execute: (args: Record<string, unknown>) => Promise<ClientToolResult>;
  icon: string;
  category: "math" | "text" | "generate" | "format" | "security" | "interact";
}

// ──────────────────────────────────────────────────────────────────────────────
// Tool implementations
// ──────────────────────────────────────────────────────────────────────────────

async function evalCalculator(args: Record<string, unknown>): Promise<ClientToolResult> {
  const expression = String(args.expression || "");
  try {
    // Dynamic import mathjs to avoid bloating bundle
    const { evaluate } = await import("mathjs");
    const result = evaluate(expression);
    const formatted = typeof result === "number" ? result.toString() : String(result);
    return {
      type: "calculator",
      data: { expression, result: formatted, raw: result },
      text: `${expression} = ${formatted}`,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Calculation error";
    return { type: "calculator", data: { expression, error: msg }, text: `Error: ${msg}` };
  }
}

async function evalUnitConverter(args: Record<string, unknown>): Promise<ClientToolResult> {
  const value = Number(args.value);
  const fromUnit = String(args.from_unit || "");
  const toUnit = String(args.to_unit || "");
  try {
    const { unit } = await import("mathjs");
    const result = unit(value, fromUnit).toNumber(toUnit);
    const formatted = parseFloat(result.toFixed(8)).toString();
    return {
      type: "unit_converter",
      data: { value, fromUnit, toUnit, result: formatted },
      text: `${value} ${fromUnit} = ${formatted} ${toUnit}`,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Conversion error";
    return { type: "unit_converter", data: { value, fromUnit, toUnit, error: msg }, text: `Error: ${msg}` };
  }
}

async function generateQRCode(args: Record<string, unknown>): Promise<ClientToolResult> {
  const text = String(args.text || "");
  const errorLevel = (args.error_correction_level as "L" | "M" | "Q" | "H") || "M";
  try {
    const QRCode = (await import("qrcode")).default;
    const dataURL = await QRCode.toDataURL(text, { errorCorrectionLevel: errorLevel, width: 256, margin: 2 });
    return {
      type: "qrcode",
      data: { text, dataURL, errorLevel },
      text: `QR code generated for: "${text.slice(0, 80)}"`,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "QR generation failed";
    return { type: "qrcode", data: { text, error: msg }, text: `Error: ${msg}` };
  }
}

function formatJSON(args: Record<string, unknown>): ClientToolResult {
  const raw = String(args.json || "");
  const indent = Number(args.indent ?? 2);
  try {
    const parsed = JSON.parse(raw);
    const formatted = JSON.stringify(parsed, null, indent);
    const keys = Array.isArray(parsed) ? parsed.length + " items" : Object.keys(parsed).length + " keys";
    return {
      type: "json_formatter",
      data: { formatted, valid: true, summary: keys, raw },
      text: `Valid JSON (${keys})\n\`\`\`json\n${formatted}\n\`\`\``,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid JSON";
    return { type: "json_formatter", data: { raw, error: msg, valid: false }, text: `Invalid JSON: ${msg}` };
  }
}

function generatePassword(args: Record<string, unknown>): ClientToolResult {
  const length = Math.min(128, Math.max(4, Number(args.length ?? 16)));
  const useUpper = args.uppercase !== false;
  const useLower = args.lowercase !== false;
  const useNumbers = args.numbers !== false;
  const useSymbols = args.symbols === true;

  let chars = "";
  if (useUpper) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (useLower) chars += "abcdefghijklmnopqrstuvwxyz";
  if (useNumbers) chars += "0123456789";
  if (useSymbols) chars += "!@#$%^&*()-_=+[]{}|;:,.<>?";
  if (!chars) chars = "abcdefghijklmnopqrstuvwxyz";

  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  const password = Array.from(array, (x) => chars[x % chars.length]).join("");

  // Calculate rough entropy
  const entropy = Math.floor(length * Math.log2(chars.length));

  return {
    type: "password_generator",
    data: { password, length, entropy, uppercase: useUpper, lowercase: useLower, numbers: useNumbers, symbols: useSymbols },
    text: `Password: ${password}\nEntropy: ~${entropy} bits`,
  };
}

function generateColorPalette(args: Record<string, unknown>): ClientToolResult {
  const baseHex = String(args.base_color || "#3b82f6").replace(/[^#a-f0-9]/gi, "");
  const count = Math.min(10, Math.max(2, Number(args.count ?? 5)));
  const scheme = String(args.scheme || "analogous");

  // Parse hex to HSL
  function hexToHSL(hex: string): [number, number, number] {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
      h /= 6;
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  }

  function hslToHex(h: number, s: number, l: number): string {
    s /= 100; l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }

  const fullHex = baseHex.startsWith("#") && baseHex.length === 7 ? baseHex : "#3b82f6";
  const [h, s, l] = hexToHSL(fullHex);

  const colors: string[] = [];
  if (scheme === "monochromatic") {
    for (let i = 0; i < count; i++) {
      const newL = Math.max(10, Math.min(90, l - 30 + (60 / (count - 1)) * i));
      colors.push(hslToHex(h, s, newL));
    }
  } else if (scheme === "complementary") {
    colors.push(fullHex);
    colors.push(hslToHex((h + 180) % 360, s, l));
    for (let i = 2; i < count; i++) {
      colors.push(hslToHex((h + (180 * i) / count) % 360, s, l));
    }
  } else {
    // analogous (default)
    const spread = 30;
    for (let i = 0; i < count; i++) {
      const newH = (h - spread + (2 * spread / (count - 1)) * i + 360) % 360;
      colors.push(hslToHex(newH, s, l));
    }
  }

  return {
    type: "color_palette",
    data: { colors, baseColor: fullHex, scheme, count },
    text: `Color palette (${scheme}): ${colors.join(", ")}`,
  };
}

function testRegex(args: Record<string, unknown>): ClientToolResult {
  const pattern = String(args.pattern || "");
  const flags = String(args.flags || "g");
  const text = String(args.text || "");
  try {
    // Validate the pattern first (throws if invalid)
    new RegExp(pattern, flags);
    const matches: { match: string; index: number; groups?: Record<string, string> }[] = [];
    let m: RegExpExecArray | null;
    const safeRegex = new RegExp(pattern, flags.includes("g") ? flags : flags + "g");
    while ((m = safeRegex.exec(text)) !== null) {
      matches.push({ match: m[0], index: m.index, groups: m.groups as Record<string, string> | undefined });
      if (!flags.includes("g")) break;
    }
    return {
      type: "regex_tester",
      data: { pattern, flags, text, matches, count: matches.length, valid: true },
      text: `Found ${matches.length} match${matches.length !== 1 ? "es" : ""} for /${pattern}/${flags}`,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid regex";
    return { type: "regex_tester", data: { pattern, flags, text, error: msg, valid: false }, text: `Invalid regex: ${msg}` };
  }
}

function base64Encode(args: Record<string, unknown>): ClientToolResult {
  const operation = String(args.operation || "encode");
  const input = String(args.input || "");
  try {
    const output = operation === "decode" ? atob(input) : btoa(unescape(encodeURIComponent(input)));
    return {
      type: "base64",
      data: { operation, input, output },
      text: `Base64 ${operation}: ${output.slice(0, 100)}${output.length > 100 ? "…" : ""}`,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Base64 error";
    return { type: "base64", data: { operation, input, error: msg }, text: `Error: ${msg}` };
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Tool registry
// ──────────────────────────────────────────────────────────────────────────────

export const CLIENT_TOOLS: ClientTool[] = [
  {
    name: "calculator",
    description: "Evaluate a mathematical expression. Supports arithmetic, algebra, trigonometry, logarithms, unit conversions, and more. Use this when the user asks to calculate something.",
    parameters: {
      type: "object",
      properties: {
        expression: {
          type: "string",
          description: "The mathematical expression to evaluate, e.g. '2 * (3 + 4)' or 'sin(pi/4)'",
        },
      },
      required: ["expression"],
    },
    execute: evalCalculator,
    icon: "🧮",
    category: "math",
  },
  {
    name: "unit_converter",
    description: "Convert a value from one unit to another. Supports length, weight, temperature, volume, speed, and many more unit types.",
    parameters: {
      type: "object",
      properties: {
        value: { type: "number", description: "The numeric value to convert" },
        from_unit: { type: "string", description: "Source unit (e.g. 'km', 'kg', 'celsius', 'mph')" },
        to_unit: { type: "string", description: "Target unit (e.g. 'm', 'lb', 'fahrenheit', 'kph')" },
      },
      required: ["value", "from_unit", "to_unit"],
    },
    execute: evalUnitConverter,
    icon: "🔄",
    category: "math",
  },
  {
    name: "generate_qr_code",
    description: "Generate a QR code for any text or URL. Returns an image the user can scan.",
    parameters: {
      type: "object",
      properties: {
        text: { type: "string", description: "The text or URL to encode in the QR code" },
        error_correction_level: {
          type: "string",
          enum: ["L", "M", "Q", "H"],
          description: "Error correction level: L=7%, M=15%, Q=25%, H=30%. Default: M",
        },
      },
      required: ["text"],
    },
    execute: generateQRCode,
    icon: "📱",
    category: "generate",
  },
  {
    name: "format_json",
    description: "Format, validate, and pretty-print a JSON string. Also reports if the JSON is valid and how many keys/items it contains.",
    parameters: {
      type: "object",
      properties: {
        json: { type: "string", description: "The JSON string to format and validate" },
        indent: { type: "number", description: "Number of spaces for indentation (default: 2)" },
      },
      required: ["json"],
    },
    execute: async (args) => Promise.resolve(formatJSON(args)),
    icon: "📋",
    category: "format",
  },
  {
    name: "generate_password",
    description: "Generate a cryptographically secure random password with configurable options.",
    parameters: {
      type: "object",
      properties: {
        length: { type: "number", description: "Password length (default: 16)" },
        uppercase: { type: "boolean", description: "Include uppercase letters (default: true)" },
        lowercase: { type: "boolean", description: "Include lowercase letters (default: true)" },
        numbers: { type: "boolean", description: "Include numbers (default: true)" },
        symbols: { type: "boolean", description: "Include special symbols (default: false)" },
      },
    },
    execute: async (args) => Promise.resolve(generatePassword(args)),
    icon: "🔑",
    category: "security",
  },
  {
    name: "generate_color_palette",
    description: "Generate a color palette based on a base color. Returns hex codes for the palette.",
    parameters: {
      type: "object",
      properties: {
        base_color: { type: "string", description: "Base color as hex code (e.g. '#3b82f6')" },
        count: { type: "number", description: "Number of colors in the palette (2-10, default: 5)" },
        scheme: {
          type: "string",
          enum: ["analogous", "complementary", "monochromatic"],
          description: "Color scheme type (default: analogous)",
        },
      },
    },
    execute: async (args) => Promise.resolve(generateColorPalette(args)),
    icon: "🎨",
    category: "generate",
  },
  {
    name: "test_regex",
    description: "Test a regular expression against text. Returns all matches with their positions.",
    parameters: {
      type: "object",
      properties: {
        pattern: { type: "string", description: "The regex pattern (without delimiters)" },
        flags: { type: "string", description: "Regex flags (e.g. 'gi' for global case-insensitive)" },
        text: { type: "string", description: "The text to test against" },
      },
      required: ["pattern", "text"],
    },
    execute: async (args) => Promise.resolve(testRegex(args)),
    icon: "🔍",
    category: "text",
  },
  {
    name: "base64",
    description: "Encode or decode a string using Base64.",
    parameters: {
      type: "object",
      properties: {
        operation: { type: "string", enum: ["encode", "decode"], description: "Whether to encode or decode" },
        input: { type: "string", description: "The string to encode or decode" },
      },
      required: ["operation", "input"],
    },
    execute: async (args) => Promise.resolve(base64Encode(args)),
    icon: "🔢",
    category: "text",
  },
];

// ── ask_human — special tool that pauses the agent loop for user input ────────

async function askHuman(args: Record<string, unknown>): Promise<ClientToolResult> {
  const question = String(args.question || "What would you like me to do?");
  const inputType = (String(args.input_type || "text")) as "text" | "select" | "radio" | "checkbox";
  const options = Array.isArray(args.options) ? args.options.map(String) : undefined;
  const placeholder = args.placeholder ? String(args.placeholder) : undefined;

  const fields = [
    {
      key: "answer",
      type: inputType,
      label: question,
      options,
      placeholder,
      required: true,
    },
  ];

  const answer = await requestHumanInput(question, fields);
  const value = answer["answer"];
  const text = Array.isArray(value) ? value.join(", ") : String(value || "");

  return {
    type: "ask_human",
    data: { question, answer: text, input_type: inputType },
    text: `User responded: ${text}`,
  };
}

CLIENT_TOOLS.push({
  name: "ask_human",
  description:
    "Pause the agent loop and ask the human user a question. Use this when you need clarification, a user decision, or information only the human can provide. " +
    "For open-ended answers use input_type 'text'. For a single choice from a list use 'radio'. For a dropdown use 'select'. For multiple selections use 'checkbox'. " +
    "Always prefer asking one clear question at a time.",
  parameters: {
    type: "object",
    properties: {
      question: {
        type: "string",
        description: "The question or prompt shown to the user as the card title",
      },
      input_type: {
        type: "string",
        enum: ["text", "select", "radio", "checkbox"],
        description: "Type of input: text (free input), radio (pick one), select (dropdown pick one), checkbox (pick many)",
      },
      options: {
        type: "array",
        items: { type: "string" },
        description: "List of options for select/radio/checkbox input types",
      },
      placeholder: {
        type: "string",
        description: "Placeholder text for text input type",
      },
    },
    required: ["question", "input_type"],
  },
  execute: askHuman,
  icon: "🙋",
  category: "interact",
});

export const TOOL_BY_NAME = Object.fromEntries(CLIENT_TOOLS.map((t) => [t.name, t]));

/** Convert client tools to OpenAI tool definitions */
export function toOpenAITools(tools: ClientTool[]): object[] {
  return tools.map((t) => ({
    type: "function",
    function: {
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    },
  }));
}
