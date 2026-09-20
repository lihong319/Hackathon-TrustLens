export type InputMode = "text" | "url";

export type ModelVerdict =
  | "legitimate"
  | "probably_legitimate"
  | "unverifiable"
  | "suspicious"
  | "likely_scam";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "UNVERIFIABLE";

export type ModelAnalysis = {
  model: string;
  displayName: string;
  role: string;
  requestId: string;
  trustScore: number;
  confidence: number;
  verdict: ModelVerdict;
  summary: string;
  reasoning: string[];
  warningSignals: string[];
  evidenceGaps: string[];
  recommendedAction: string;
};

export type AnalysisResult = {
  verificationId: string;
  contentHash: string;
  resultHash: string;
  createdAt: string;
  provider: "Gonka";
  trustScore: number;
  riskLevel: RiskLevel;
  assessment: string;
  warningSignals: string[];
  evidenceGaps: string[];
  reasoning: string[];
  recommendedAction: string;
  consensus: {
    completed: number;
    total: number;
    suspicious: number;
    agreementPercent: number;
    summary: string;
  };
  models: ModelAnalysis[];
  failedModels: Array<{ model: string; displayName: string; message: string }>;
};

export type AnalyzeError = {
  error: string;
  code: string;
};
