export const GONKA_BASE_URL =
  process.env.GONKA_BASE_URL?.replace(/\/$/, "") ||
  "https://api.gonkarouter.io/v1";

export const MODEL_CONFIGS = [
  {
    env: "GONKA_MODEL_A",
    model: process.env.GONKA_MODEL_A || "MiniMaxAI/MiniMax-M2.7",
    displayName: "MiniMax M2.7",
    role: "Scam language and social-engineering specialist",
    focus:
      "Focus on urgency, impersonation, coercion, payment requests, credential theft, and persuasion tactics.",
  },
  {
    env: "GONKA_MODEL_B",
    model: process.env.GONKA_MODEL_B || "moonshotai/Kimi-K2.6",
    displayName: "Kimi K2.6",
    role: "Claim credibility and misinformation specialist",
    focus:
      "Focus on factual support, internal consistency, extraordinary claims, missing evidence, and uncertainty.",
  },
  {
    env: "GONKA_MODEL_C",
    model:
      process.env.GONKA_MODEL_C ||
      "deepseek-ai/DeepSeek-V4-Flash-0731",
    displayName: "DeepSeek V4 Flash",
    role: "URL, phishing, and user-safety specialist",
    focus:
      "Focus on suspicious domains, lookalike brands, unsafe calls to action, privacy risk, and the safest next step.",
  },
] as const;

export const ANALYSIS_LIMITS = {
  maxInputCharacters: 2_000,
  maxOutputTokensPerModel: 1_024,
  requestTimeoutMs: 95_000,
} as const;
