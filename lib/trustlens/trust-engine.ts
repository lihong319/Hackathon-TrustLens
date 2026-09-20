import type { AnalysisResult, ModelAnalysis, RiskLevel } from "./types";

function unique(items: string[], limit: number) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.toLocaleLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, limit);
}

function weightedTrustScore(models: ModelAnalysis[]) {
  const totalWeight = models.reduce(
    (sum, model) => sum + Math.max(model.confidence, 25),
    0,
  );
  return Math.round(
    models.reduce(
      (sum, model) =>
        sum + model.trustScore * Math.max(model.confidence, 25),
      0,
    ) / totalWeight,
  );
}

function riskLevel(
  score: number,
  models: ModelAnalysis[],
  suspicious: number,
  unverifiable: number,
): RiskLevel {
  const likelyScam = models.filter(
    (model) => model.verdict === "likely_scam" && model.confidence >= 55,
  ).length;
  const allModelsCompleted = models.length === 3;

  if (
    likelyScam >= 2 ||
    (allModelsCompleted && suspicious === 3 && score <= 25)
  ) {
    return "HIGH";
  }
  if (
    unverifiable >= Math.ceil(models.length / 2) ||
    (!allModelsCompleted && likelyScam < 2 && score >= 30 && score <= 65)
  ) {
    return "UNVERIFIABLE";
  }
  if (score < 70 || suspicious > 0) return "MEDIUM";
  return "LOW";
}

const EVIDENCE_GAP_PATTERN =
  /(cannot|can't|unable|unverified|unverifiable|no verifiable|no reliable|missing|incomplete|not provided|lack of|without).{0,100}(source|official|link|registration|contact|affiliation|evidence|detail|context|identity)/i;

function separateSignals(models: ModelAnalysis[]) {
  const warningSignals: string[] = [];
  const evidenceGaps = models.flatMap((model) => model.evidenceGaps);

  for (const signal of models.flatMap((model) => model.warningSignals)) {
    if (EVIDENCE_GAP_PATTERN.test(signal)) evidenceGaps.push(signal);
    else warningSignals.push(signal);
  }

  return {
    warningSignals: unique(warningSignals, 6),
    evidenceGaps: unique(evidenceGaps, 5),
  };
}

export function aggregateAnalyses(
  models: ModelAnalysis[],
  failedModels: AnalysisResult["failedModels"],
  metadata: Pick<AnalysisResult, "verificationId" | "contentHash" | "createdAt">,
): Omit<AnalysisResult, "resultHash"> {
  if (!models.length) throw new Error("All Gonka model requests failed.");

  const rawTrustScore = weightedTrustScore(models);
  const suspicious = models.filter((model) =>
    ["suspicious", "likely_scam"].includes(model.verdict),
  ).length;
  const unverifiable = models.filter(
    (model) => model.verdict === "unverifiable",
  ).length;
  const largestGroup = Math.max(
    suspicious,
    unverifiable,
    models.length - suspicious - unverifiable,
  );
  const agreementPercent = Math.round((largestGroup / models.length) * 100);
  const risk = riskLevel(rawTrustScore, models, suspicious, unverifiable);
  const trustScore =
    risk === "UNVERIFIABLE"
      ? Math.max(40, Math.min(60, rawTrustScore))
      : rawTrustScore;
  const signals = separateSignals(models);

  const assessment =
    risk === "HIGH"
      ? "Likely fraudulent or highly suspicious."
      : risk === "MEDIUM"
        ? "Use caution; important warning signs or evidence gaps remain."
        : risk === "UNVERIFIABLE"
          ? "There is not enough reliable evidence to verify this content."
          : "No strong scam indicators were found, but independent verification is still recommended.";

  const consensusSummary =
    failedModels.length > 0
      ? `${models.length} of 3 models completed; ${failedModels.map((failure) => failure.displayName).join(", ")} could not complete.`
      : suspicious === 3
        ? "All three models consider this content suspicious."
        : suspicious === 0
          ? `No model classified this content as suspicious; agreement is ${agreementPercent}%.`
          : `${suspicious} of 3 models consider this content suspicious.`;

  return {
    ...metadata,
    provider: "Gonka",
    trustScore,
    riskLevel: risk,
    assessment,
    warningSignals: signals.warningSignals,
    evidenceGaps: signals.evidenceGaps,
    reasoning: unique(models.flatMap((model) => model.reasoning), 8),
    recommendedAction:
      models.reduce((riskiest, model) =>
        model.trustScore < riskiest.trustScore ? model : riskiest,
      ).recommendedAction ||
      "Verify through an official, independently located contact channel before acting.",
    consensus: {
      completed: models.length,
      total: 3,
      suspicious,
      agreementPercent,
      summary: consensusSummary,
    },
    models,
    failedModels,
  };
}
