export type ModelTag =
  | "reasoning"
  | "vision"
  | "long-context"
  | "fast"
  | "image-gen"
  | "web-search"
  | "code";

export interface ModelConfig {
  id: string;
  name: string;
  tags: ModelTag[];
  contextWindow?: number;
  note?: string;
}

export interface Provider {
  id: string;
  name: string;
  baseURL: string;
  requiresKey: boolean;
  extraHeaders?: Record<string, string>;
  hardcodedModels: ModelConfig[];
  supportsModelsEndpoint: boolean;
  logoChar: string;
  docsUrl: string;
  keyLabel: string;
}

export const PROVIDERS: Provider[] = [
  {
    id: "openai",
    name: "OpenAI",
    baseURL: "https://api.openai.com/v1",
    requiresKey: true,
    supportsModelsEndpoint: true,
    logoChar: "⊕",
    docsUrl: "https://platform.openai.com/api-keys",
    keyLabel: "OpenAI API Key",
    hardcodedModels: [
      { id: "gpt-4o", name: "GPT-4o", tags: ["vision"], contextWindow: 128000 },
      { id: "gpt-4o-mini", name: "GPT-4o Mini", tags: ["vision", "fast"], contextWindow: 128000 },
      { id: "gpt-4.1", name: "GPT-4.1", tags: ["vision"], contextWindow: 1000000, note: "Latest generation" },
      { id: "gpt-4.1-mini", name: "GPT-4.1 Mini", tags: ["vision", "fast"], contextWindow: 1000000 },
      { id: "gpt-4.1-nano", name: "GPT-4.1 Nano", tags: ["fast"], contextWindow: 1000000 },
      { id: "o1", name: "o1", tags: ["reasoning"], contextWindow: 200000 },
      { id: "o1-mini", name: "o1 Mini", tags: ["reasoning", "fast"], contextWindow: 128000 },
      { id: "o3", name: "o3", tags: ["reasoning"], contextWindow: 200000 },
      { id: "o3-mini", name: "o3 Mini", tags: ["reasoning", "fast"], contextWindow: 200000 },
      { id: "o4-mini", name: "o4 Mini", tags: ["reasoning", "fast"], contextWindow: 200000 },
      { id: "gpt-image-1", name: "GPT Image 1", tags: ["image-gen"], note: "Image generation" },
    ],
  },
  {
    id: "anthropic",
    name: "Anthropic",
    baseURL: "https://api.anthropic.com/v1",
    requiresKey: true,
    extraHeaders: { "anthropic-version": "2023-06-01" },
    supportsModelsEndpoint: false,
    logoChar: "◈",
    docsUrl: "https://console.anthropic.com/settings/keys",
    keyLabel: "Anthropic API Key",
    hardcodedModels: [
      { id: "claude-opus-4-5", name: "Claude Opus 4.5", tags: ["vision", "long-context"], contextWindow: 200000, note: "Most Capable" },
      { id: "claude-sonnet-4-5", name: "Claude Sonnet 4.5", tags: ["vision", "long-context"], contextWindow: 200000 },
      { id: "claude-haiku-4-5", name: "Claude Haiku 4.5", tags: ["vision", "fast"], contextWindow: 200000, note: "Fastest" },
    ],
  },
  {
    id: "gemini",
    name: "Google Gemini",
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    requiresKey: true,
    supportsModelsEndpoint: false,
    logoChar: "✦",
    docsUrl: "https://aistudio.google.com/app/apikey",
    keyLabel: "Google AI API Key",
    hardcodedModels: [
      { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", tags: ["vision", "fast"], contextWindow: 1000000, note: "Fast, multimodal, 1M context" },
      { id: "gemini-2.0-flash-lite", name: "Gemini 2.0 Flash Lite", tags: ["fast"], contextWindow: 1000000, note: "Cheapest Gemini" },
      { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", tags: ["reasoning", "vision", "long-context"], contextWindow: 2000000, note: "Most capable" },
    ],
  },
  {
    id: "mistral",
    name: "Mistral",
    baseURL: "https://api.mistral.ai/v1",
    requiresKey: true,
    supportsModelsEndpoint: true,
    logoChar: "≋",
    docsUrl: "https://console.mistral.ai/api-keys",
    keyLabel: "Mistral API Key",
    hardcodedModels: [
      { id: "mistral-large-latest", name: "Mistral Large", tags: ["vision"], contextWindow: 128000 },
      { id: "mistral-small-latest", name: "Mistral Small", tags: ["fast"], contextWindow: 128000 },
      { id: "codestral-latest", name: "Codestral", tags: ["code"], contextWindow: 256000, note: "Code specialist" },
      { id: "pixtral-large-latest", name: "Pixtral Large", tags: ["vision"], contextWindow: 128000, note: "Vision model" },
    ],
  },
  {
    id: "xai",
    name: "xAI (Grok)",
    baseURL: "https://api.x.ai/v1",
    requiresKey: true,
    supportsModelsEndpoint: true,
    logoChar: "𝕏",
    docsUrl: "https://console.x.ai/",
    keyLabel: "xAI API Key",
    hardcodedModels: [
      { id: "grok-3", name: "Grok 3", tags: ["web-search"], contextWindow: 131072 },
      { id: "grok-3-mini", name: "Grok 3 Mini", tags: ["fast", "reasoning"], contextWindow: 131072 },
      { id: "grok-2-vision", name: "Grok 2 Vision", tags: ["vision"], contextWindow: 32768, note: "Vision capable" },
    ],
  },
  {
    id: "groq",
    name: "Groq",
    baseURL: "https://api.groq.com/openai/v1",
    requiresKey: true,
    supportsModelsEndpoint: true,
    logoChar: "⚡",
    docsUrl: "https://console.groq.com/keys",
    keyLabel: "Groq API Key",
    hardcodedModels: [
      { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B", tags: ["fast"], contextWindow: 128000 },
      { id: "deepseek-r1-distill-llama-70b", name: "DeepSeek R1 Llama 70B", tags: ["reasoning", "fast"], contextWindow: 128000 },
      { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B", tags: ["fast"], contextWindow: 32768 },
    ],
  },
  {
    id: "cohere",
    name: "Cohere",
    baseURL: "https://api.cohere.com/compatibility/v1",
    requiresKey: true,
    supportsModelsEndpoint: false,
    logoChar: "◉",
    docsUrl: "https://dashboard.cohere.com/api-keys",
    keyLabel: "Cohere API Key",
    hardcodedModels: [
      { id: "command-r-plus", name: "Command R+", tags: ["long-context"], contextWindow: 128000 },
      { id: "command-r", name: "Command R", tags: ["fast"], contextWindow: 128000 },
      { id: "command", name: "Command", tags: [], contextWindow: 4096 },
    ],
  },
  {
    id: "together",
    name: "Together AI",
    baseURL: "https://api.together.xyz/v1",
    requiresKey: true,
    supportsModelsEndpoint: true,
    logoChar: "∞",
    docsUrl: "https://api.together.ai/settings/api-keys",
    keyLabel: "Together AI API Key",
    hardcodedModels: [
      { id: "meta-llama/Llama-3.3-70B-Instruct-Turbo", name: "Llama 3.3 70B Turbo", tags: ["fast"], contextWindow: 131072 },
      { id: "mistralai/Mixtral-8x7B-Instruct-v0.1", name: "Mixtral 8x7B", tags: [], contextWindow: 32768 },
      { id: "deepseek-ai/DeepSeek-R1", name: "DeepSeek R1", tags: ["reasoning"], contextWindow: 65536 },
    ],
  },
  {
    id: "perplexity",
    name: "Perplexity",
    baseURL: "https://api.perplexity.ai",
    requiresKey: true,
    supportsModelsEndpoint: false,
    logoChar: "⊛",
    docsUrl: "https://www.perplexity.ai/settings/api",
    keyLabel: "Perplexity API Key",
    hardcodedModels: [
      { id: "sonar", name: "Sonar", tags: ["web-search", "fast"], contextWindow: 127072 },
      { id: "sonar-pro", name: "Sonar Pro", tags: ["web-search"], contextWindow: 200000 },
      { id: "sonar-reasoning", name: "Sonar Reasoning", tags: ["web-search", "reasoning"], contextWindow: 127072 },
    ],
  },
  {
    id: "ollama",
    name: "Ollama (Local)",
    baseURL: "http://localhost:11434/v1",
    requiresKey: false,
    supportsModelsEndpoint: true,
    logoChar: "🦙",
    docsUrl: "https://ollama.com/",
    keyLabel: "No key needed",
    hardcodedModels: [
      { id: "llama3", name: "Llama 3", tags: ["fast"], contextWindow: 8192 },
      { id: "mistral", name: "Mistral 7B", tags: ["fast"], contextWindow: 32768 },
      { id: "codellama", name: "Code Llama", tags: ["code"], contextWindow: 16384 },
    ],
  },
];

export const PROVIDER_MAP: Record<string, Provider> = Object.fromEntries(
  PROVIDERS.map((p) => [p.id, p])
);

export const TAG_LABELS: Record<ModelTag, string> = {
  reasoning: "🧠 Reasoning",
  vision: "👁 Vision",
  "long-context": "📄 Long Context",
  fast: "⚡ Fast",
  "image-gen": "🎨 Image Gen",
  "web-search": "🌐 Web Search",
  code: "💻 Code",
};

// Models that don't support system prompts
export const NO_SYSTEM_PROMPT_MODELS = ["o1", "o1-mini"];

// Models that don't support streaming
export const NO_STREAMING_MODELS = ["o1"];
