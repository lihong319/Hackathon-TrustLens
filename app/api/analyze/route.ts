import { ANALYSIS_LIMITS, MODEL_CONFIGS } from "../../../lib/trustlens/config";
import { analyzeWithGonka } from "../../../lib/trustlens/gonka";
import { aggregateAnalyses } from "../../../lib/trustlens/trust-engine";
import type { AnalyzeError, InputMode } from "../../../lib/trustlens/types";

export const runtime = "edge";

function json(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function error(message: string, code: string, status: number) {
  return json({ error: message, code } satisfies AnalyzeError, status);
}

async function sha256(content: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(content),
  );
  return `0x${Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("")}`;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return error("Request body must be valid JSON.", "INVALID_JSON", 400);
  }

  if (!body || typeof body !== "object") {
    return error("Request body is required.", "INVALID_INPUT", 400);
  }

  const { content, mode } = body as { content?: unknown; mode?: unknown };
  if (mode !== "text" && mode !== "url") {
    return error("Mode must be either text or url.", "INVALID_MODE", 400);
  }
  if (typeof content !== "string" || !content.trim()) {
    return error("Content is required.", "EMPTY_CONTENT", 400);
  }

  const normalizedContent = content.trim();
  if (normalizedContent.length > ANALYSIS_LIMITS.maxInputCharacters) {
    return error(
      `Content must be ${ANALYSIS_LIMITS.maxInputCharacters.toLocaleString()} characters or fewer.`,
      "CONTENT_TOO_LONG",
      413,
    );
  }

  if (mode === "url") {
    try {
      const url = new URL(normalizedContent);
      if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error();
    } catch {
      return error(
        "Enter a complete http:// or https:// URL.",
        "INVALID_URL",
        400,
      );
    }
  }

  const apiKey = process.env.GONKA_API_KEY?.trim();
  if (!apiKey) {
    return error(
      "Gonka is not configured. Add GONKA_API_KEY to the server environment.",
      "GONKA_NOT_CONFIGURED",
      503,
    );
  }

  const contentHash = await sha256(normalizedContent);
  const settled = await Promise.allSettled(
    MODEL_CONFIGS.map((config) =>
      analyzeWithGonka(apiKey, config, mode as InputMode, normalizedContent),
    ),
  );
  const models = settled.flatMap((result) =>
    result.status === "fulfilled" ? [result.value] : [],
  );
  const failedModels = settled.flatMap((result, index) =>
    result.status === "rejected"
      ? [
          {
            model: MODEL_CONFIGS[index].model,
            displayName: MODEL_CONFIGS[index].displayName,
            message:
              result.reason instanceof Error
                ? result.reason.message
                : "Unknown model error.",
          },
        ]
      : [],
  );

  if (!models.length) {
    return error(
      `All three Gonka models failed: ${failedModels.map((item) => item.message).join(" ")}`,
      "GONKA_ANALYSIS_FAILED",
      502,
    );
  }

  const createdAt = new Date().toISOString();
  const verificationId = `tl_${contentHash.slice(2, 14)}_${Date.now().toString(36)}`;
  const analysis = aggregateAnalyses(models, failedModels, {
    verificationId,
    contentHash,
    createdAt,
  });
  const resultHash = await sha256(
    JSON.stringify({
      verificationId,
      contentHash,
      createdAt,
      trustScore: analysis.trustScore,
      riskLevel: analysis.riskLevel,
      modelResults: analysis.models.map((model) => ({
        model: model.model,
        requestId: model.requestId,
        trustScore: model.trustScore,
        verdict: model.verdict,
      })),
    }),
  );

  return json({ ...analysis, resultHash });
}
