"use client";

import {
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Copy,
  ExternalLink,
  FileCheck2,
  Globe2,
  Link2,
  LockKeyhole,
  MessageSquareText,
  RotateCcw,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { useCurrentAccount, useDAppKit } from "@mysten/dapp-kit-react";
import { Transaction } from "@mysten/sui/transactions";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type {
  AnalysisResult,
  AnalyzeError,
  RiskLevel,
} from "../lib/trustlens/types";

const DAppKitClientProvider = dynamic(
  () =>
    import("./sui/client-provider").then(
      (module) => module.DAppKitClientProvider,
    ),
  { ssr: false },
);

const ConnectButton = dynamic(
  () => import("./sui/client-provider").then((module) => module.ConnectButton),
  { ssr: false, loading: () => <button className="wallet-loading" disabled>Loading wallet…</button> },
);

const HISTORY_KEY = "trustlens-sui-proof-history";
const SUI_PACKAGE_ID = process.env.NEXT_PUBLIC_SUI_PACKAGE_ID?.trim();

type SuiProof = {
  objectId: string;
  digest: string;
  owner: string;
  verificationId: string;
  contentHash: string;
  resultHash: string;
  trustScore: number;
  riskLevel: RiskLevel;
  createdAt: string;
};

function hexToBytes(value: string) {
  const hex = value.startsWith("0x") ? value.slice(2) : value;
  if (!hex || hex.length % 2 !== 0 || !/^[0-9a-f]+$/i.test(hex)) {
    throw new Error("The proof hash is not valid hexadecimal data.");
  }
  return Uint8Array.from(
    { length: hex.length / 2 },
    (_, index) => Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16),
  );
}

function shortId(value: string) {
  return value.length > 18 ? `${value.slice(0, 10)}…${value.slice(-6)}` : value;
}

const examples = [
  "Government aid message",
  "Investment offer",
  "Suspicious link",
];

export default function Home() {
  return (
    <DAppKitClientProvider>
      <TrustLensApp />
    </DAppKitClientProvider>
  );
}

function TrustLensApp() {
  const account = useCurrentAccount();
  const dAppKit = useDAppKit();
  const [mode, setMode] = useState<"text" | "url">("text");
  const [content, setContent] = useState("");
  const [view, setView] = useState<"input" | "analyzing" | "result" | "proof">("input");
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [showReasoning, setShowReasoning] = useState(false);
  const [proof, setProof] = useState<SuiProof | null>(null);
  const [proofStatus, setProofStatus] = useState<"idle" | "signing" | "error">("idle");
  const [proofError, setProofError] = useState("");
  const [history, setHistory] = useState<SuiProof[]>([]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(HISTORY_KEY);
      if (saved) setHistory(JSON.parse(saved) as SuiProof[]);
    } catch {
      window.localStorage.removeItem(HISTORY_KEY);
    }
  }, []);

  const loadExample = (example: string) => {
    setMode("text");
    setContent(
      example === "Government aid message"
        ? "Congratulations! You have received RM3,000 government assistance. Click this link immediately to claim your payment: bantuan-rakyat-claim.co"
        : example === "Investment offer"
          ? "Guaranteed 30% monthly returns. Limited spots only — transfer your deposit today to secure your profits."
          : "Your bank account has been suspended. Verify your identity now at my-securebank-login.com to restore access.",
    );
  };

  const resetCheck = () => {
    setView("input");
    setContent("");
    setCopied(false);
    setResult(null);
    setErrorMessage("");
    setShowReasoning(false);
    setProof(null);
    setProofStatus("idle");
    setProofError("");
  };

  const copyProof = async () => {
    if (!result || !proof) return;
    await navigator.clipboard?.writeText(
      `${window.location.origin}/verify/${proof.objectId}`,
    );
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const createSuiProof = async () => {
    if (!result) return;
    setProofError("");

    if (!account) {
      setProofStatus("error");
      setProofError("Connect a Sui wallet before creating an on-chain proof.");
      return;
    }
    if (!SUI_PACKAGE_ID) {
      setProofStatus("error");
      setProofError(
        "The TrustLens Move package has not been published yet. Add NEXT_PUBLIC_SUI_PACKAGE_ID after publishing it to Sui Testnet.",
      );
      return;
    }

    setProofStatus("signing");
    try {
      const riskCode: Record<RiskLevel, number> = {
        LOW: 0,
        MEDIUM: 1,
        HIGH: 2,
        UNVERIFIABLE: 3,
      };
      const transaction = new Transaction();
      transaction.moveCall({
        target: `${SUI_PACKAGE_ID}::verification::create_verification`,
        arguments: [
          transaction.pure.string(result.verificationId),
          transaction.pure.vector("u8", hexToBytes(result.contentHash)),
          transaction.pure.vector("u8", hexToBytes(result.resultHash)),
          transaction.pure.u8(result.trustScore),
          transaction.pure.u8(riskCode[result.riskLevel]),
          transaction.pure.u64(Date.parse(result.createdAt)),
          transaction.pure.vector(
            "string",
            result.models.map((model) => model.requestId),
          ),
        ],
      });

      const execution = await dAppKit.signAndExecuteTransaction({ transaction });
      if (execution.FailedTransaction) {
        throw new Error(
          execution.FailedTransaction.status.error?.message ??
            "The Sui transaction failed.",
        );
      }

      const createdObject = execution.Transaction.effects?.changedObjects.find(
        (object) =>
          object.idOperation === "Created" &&
          object.outputState === "ObjectWrite",
      );
      if (!createdObject) {
        throw new Error(
          "Sui accepted the transaction, but the verification object was not returned.",
        );
      }

      const savedProof: SuiProof = {
        objectId: createdObject.objectId,
        digest: execution.Transaction.digest,
        owner: account.address,
        verificationId: result.verificationId,
        contentHash: result.contentHash,
        resultHash: result.resultHash,
        trustScore: result.trustScore,
        riskLevel: result.riskLevel,
        createdAt: result.createdAt,
      };
      const updatedHistory = [
        savedProof,
        ...history.filter((item) => item.objectId !== savedProof.objectId),
      ].slice(0, 5);
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
      setHistory(updatedHistory);
      setProof(savedProof);
      setProofStatus("idle");
      setView("proof");
    } catch (error) {
      setProofStatus("error");
      setProofError(
        error instanceof Error
          ? error.message
          : "The Sui transaction could not be completed.",
      );
    }
  };

  const analyze = async () => {
    setErrorMessage("");
    setShowReasoning(false);
    setView("analyzing");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, content }),
      });
      const body = (await response.json()) as AnalysisResult | AnalyzeError;
      if (!response.ok || "error" in body) {
        throw new Error("error" in body ? body.error : "Analysis failed.");
      }
      setResult(body);
      setView("result");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "TrustLens could not complete this analysis.",
      );
      setView("input");
    }
  };

  return (
    <main>
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="site-header shell">
        <a className="brand" href="#top" aria-label="TrustLens home">
          <span className="brand-mark"><ShieldCheck size={19} strokeWidth={2.3} /></span>
          <span>TrustLens</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#verifications">Verifications</a>
          <a href="#about">About</a>
        </nav>
        <div className="header-actions">
          <span className="network-pill"><i /> Sui Testnet</span>
          <ConnectButton />
        </div>
      </header>

      <section className="hero shell" id="top">
        <div className="hero-copy">
          <div className="eyebrow"><Sparkles size={14} /> AI-powered verification, secured on Sui</div>
          <h1>See through the noise.<br /><span>Verify what’s real.</span></h1>
          <p className="hero-lede">
            TrustLens cross-checks suspicious messages, links and claims with multiple AI models—then anchors the result on-chain.
          </p>
          <div className="hero-points">
            <span><Check size={15} /> Multi-model consensus</span>
            <span><Check size={15} /> Tamper-resistant proof</span>
            <span><Check size={15} /> Privacy-first by design</span>
          </div>
        </div>

        <div className="verifier-wrap" id="verify">
          <div className={`verifier-card verifier-${view}`}>
            {view === "input" && <>
            <div className="verifier-heading">
              <div>
                <span className="overline">TRUSTLENS CHECK</span>
                <h2>What would you like to verify?</h2>
              </div>
              <span className="secure-badge"><LockKeyhole size={13} /> Private</span>
            </div>

            <div className="mode-switch" role="tablist" aria-label="Verification type">
              <button className={mode === "text" ? "active" : ""} onClick={() => setMode("text")} role="tab" aria-selected={mode === "text"}>
                <MessageSquareText size={16} /> Paste text
              </button>
              <button className={mode === "url" ? "active" : ""} onClick={() => setMode("url")} role="tab" aria-selected={mode === "url"}>
                <Globe2 size={16} /> Check URL
              </button>
            </div>

            <label className="input-label" htmlFor="content-input">
              {mode === "text" ? "MESSAGE, CLAIM OR ARTICLE EXCERPT" : "WEBSITE OR ARTICLE URL"}
            </label>
            {mode === "text" ? (
              <div className="textarea-wrap">
                <textarea
                  id="content-input"
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="Paste something that doesn’t feel quite right…"
                  maxLength={2000}
                />
                <span className="character-count">{content.length} / 2,000</span>
              </div>
            ) : (
              <div className="url-wrap">
                <Globe2 size={18} />
                <input id="content-input" value={content} onChange={(event) => setContent(event.target.value)} placeholder="https://example.com/article" />
              </div>
            )}

            <div className="try-row">
              <span>Try an example</span>
              <div>
                {examples.map((example) => (
                  <button key={example} onClick={() => loadExample(example)}>{example}</button>
                ))}
              </div>
            </div>

            {errorMessage && <div className="analysis-error" role="alert"><AlertTriangle size={16} /><span>{errorMessage}</span></div>}
            <button className="analyze-button" disabled={!content.trim()} onClick={analyze}>
              <ScanSearch size={19} /> Analyze with TrustLens <ArrowRight size={17} />
            </button>
            <p className="privacy-note"><LockKeyhole size={12} /> Your original content is never stored on-chain. Only its cryptographic fingerprint is recorded.</p>
            </>}

            {view === "analyzing" && <div className="analysis-loading" aria-live="polite">
              <div className="scan-orbit"><ScanSearch size={29} /><i /><i /><i /></div>
              <span className="overline">MULTI-MODEL ANALYSIS</span>
              <h2>Cross-checking your content…</h2>
              <p>Independent models are reviewing language, source signals and known scam patterns.</p>
              <div className="progress-track"><span /></div>
              <div className="model-progress">
                <div><span className="model-symbol">M</span><p><strong>MiniMax M2.7</strong><small>Analyzing persuasion patterns</small></p><span className="working-dots"><i /><i /><i /></span></div>
                <div><span className="model-symbol coral-model">K</span><p><strong>Kimi K2.6</strong><small>Checking claim credibility</small></p><Check size={16} /></div>
                <div><span className="model-symbol yellow-model">D</span><p><strong>DeepSeek V4 Flash</strong><small>Scanning for phishing signals</small></p><span className="working-dots"><i /><i /><i /></span></div>
              </div>
              <p className="privacy-note"><LockKeyhole size={12} /> Analysis is routed privately through Gonka</p>
            </div>}

            {view === "result" && result && <div className="result-view" aria-live="polite">
              <div className="result-topline">
                <div><span className="overline">TRUSTLENS RESULT</span><h2>{result.assessment}</h2></div>
                <button className="icon-button" onClick={resetCheck} aria-label="Start a new check"><RotateCcw size={16} /></button>
              </div>
              <div className="score-summary">
                <div className={`score-ring risk-${result.riskLevel.toLowerCase()}`}><div><strong>{result.trustScore}</strong><span>/ 100</span></div></div>
                <div className="score-copy"><span className={`risk-pill risk-${result.riskLevel.toLowerCase()}`}>{result.riskLevel === "LOW" ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />} {result.riskLevel === "UNVERIFIABLE" ? "Unverifiable" : `${result.riskLevel} risk`}</span><h3>{result.consensus.summary}</h3><p>Weighted from {result.consensus.completed} independent Gonka model assessments.</p></div>
              </div>
              <div className="warning-panel">
                <span className="panel-icon"><AlertTriangle size={17} /></span>
                <div>
                  <h4>Observed warning signals</h4>
                  <ul>{result.warningSignals.length ? result.warningSignals.map((signal) => <li key={signal}>{signal}</li>) : <li>No concrete scam indicator was identified.</li>}</ul>
                  {result.evidenceGaps.length > 0 && <><h4 className="evidence-heading">Evidence still needed</h4><ul className="evidence-list">{result.evidenceGaps.map((gap) => <li key={gap}>{gap}</li>)}</ul></>}
                </div>
              </div>
              <div className="consensus-heading"><span>MODEL CONSENSUS</span><strong><CheckCircle2 size={14} /> {result.consensus.agreementPercent}% of completed models agree</strong></div>
              <div className="model-verdicts">
                {result.models.map((model) => <div key={model.model}><span>{model.displayName.charAt(0)}</span><p>{model.displayName}<small>{model.verdict.replaceAll("_", " ")} · {model.confidence}%</small></p>{model.trustScore < 50 ? <AlertTriangle size={15} /> : <CheckCircle2 size={15} />}</div>)}
              </div>
              <div className="recommendation"><BrainCircuit size={17} /><p><strong>Recommended action</strong><span>{result.recommendedAction}</span></p></div>
              {!account && <div className="wallet-prompt"><span>Connect a Sui Testnet wallet to anchor this result.<small>On localhost, allow pop-ups for Slush or choose the development-only Burner Wallet.</small></span><ConnectButton /></div>}
              {account && <button className="analyze-button proof-button" disabled={proofStatus === "signing"} onClick={createSuiProof}><ShieldCheck size={18} /> {proofStatus === "signing" ? "Confirm in your wallet…" : "Anchor proof on Sui Testnet"} <ArrowRight size={16} /></button>}
              {proofError && <div className="analysis-error proof-error" role="alert"><AlertTriangle size={16} /><span>{proofError}</span></div>}
              <button className="reasoning-button" onClick={() => setShowReasoning((shown) => !shown)}>{showReasoning ? "Hide" : "View"} reasoning & Gonka Request IDs <ChevronRight size={14} /></button>
              {showReasoning && <div className="reasoning-panel">
                <h4>Cross-model reasoning</h4>
                <ul>{result.reasoning.map((reason) => <li key={reason}>{reason}</li>)}</ul>
                <h4>Gonka request IDs</h4>
                {result.models.map((model) => <code key={model.requestId}>{model.model}: {model.requestId}</code>)}
                {result.failedModels.map((failure) => <p className="model-failure" key={failure.model}>{failure.displayName}: {failure.message}</p>)}
              </div>}
            </div>}

            {view === "proof" && result && proof && <div className="proof-view" aria-live="polite">
              <div className="success-seal"><CheckCircle2 size={34} /></div>
              <span className="overline">ON-CHAIN PROOF CREATED</span>
              <h2>Your verification is anchored on Sui</h2>
              <p>The privacy-safe fingerprints and assessment metadata are now stored in a user-owned Sui Testnet object. Your original content remains private.</p>
              <div className="proof-card">
                <div><span>VERIFICATION ID</span><strong>{result.verificationId}</strong></div>
                <div><span>TRUST SCORE</span><strong className="proof-risk">{result.trustScore} / 100 · {result.riskLevel}</strong></div>
                <div><span>CONTENT HASH</span><code>{result.contentHash.slice(0, 18)}…{result.contentHash.slice(-8)}</code></div>
                <div><span>STATUS</span><strong><i className="live-dot" /> Confirmed on Testnet</strong></div>
              </div>
              <div className="proof-actions">
                <button className="analyze-button" onClick={copyProof}>{copied ? <Check size={17} /> : <Copy size={17} />}{copied ? "Share link copied" : "Copy share link"}</button>
                <a className="outline-button" href={`https://suivision.xyz/txblock/${proof.digest}?network=testnet`} target="_blank" rel="noreferrer">View transaction <ExternalLink size={15} /></a>
              </div>
              <a className="proof-object-link" href={`/verify/${proof.objectId}`}>Open public verification record <ArrowRight size={13} /></a>
              <button className="reasoning-button" onClick={resetCheck}><RotateCcw size={13} /> Check something else</button>
            </div>}
          </div>
          <div className="card-shadow-label"><span>POWERED BY</span><strong>Gonka</strong><i /> <strong>Sui</strong></div>
        </div>
      </section>

      <section className="signal-strip" aria-label="Platform benefits">
        <div className="shell signal-grid">
          <div><span className="signal-icon coral"><Zap size={18} /></span><p><strong>3 independent models</strong><small>Cross-verified through Gonka</small></p></div>
          <div><span className="signal-icon aqua"><ShieldCheck size={18} /></span><p><strong>One clear trust score</strong><small>Evidence you can understand</small></p></div>
          <div><span className="signal-icon yellow"><FileCheck2 size={18} /></span><p><strong>Proof that can’t be altered</strong><small>Anchored securely on Sui</small></p></div>
        </div>
      </section>

      <section className="how-section shell" id="how-it-works">
        <div className="section-kicker">HOW IT WORKS <span /></div>
        <div className="section-heading">
          <h2>From uncertainty to<br /><em>verifiable clarity.</em></h2>
          <p>A transparent process that combines diverse AI perspectives with decentralized proof.</p>
        </div>
        <div className="steps-grid">
          <article><span className="step-number">01</span><div className="step-icon"><MessageSquareText /></div><h3>Submit anything suspicious</h3><p>Paste a message, claim, article excerpt or URL. Your content stays private.</p><span className="step-link">Text, links & claims <ChevronRight size={14} /></span></article>
          <article><span className="step-number">02</span><div className="step-icon"><CircleDot /></div><h3>AI models cross-check it</h3><p>Multiple independent models inspect the content for evidence, patterns and red flags.</p><span className="step-link">Powered by Gonka <ChevronRight size={14} /></span></article>
          <article><span className="step-number">03</span><div className="step-icon"><FileCheck2 /></div><h3>Get a proof you can share</h3><p>See a clear score and reasoning, then create a tamper-resistant verification record.</p><span className="step-link">Secured on Sui <ChevronRight size={14} /></span></article>
        </div>
      </section>

      <section className="records-section" id="verifications">
        <div className="shell records-inner">
          <div className="records-copy">
            <div className="section-kicker">PUBLIC PROOF <span /></div>
            <h2>Every check tells a<br />verifiable story.</h2>
            <p>TrustLens records the result—not your private content. Anyone can confirm when a verification happened and that it has not been altered.</p>
            <a href="#verify">Run your first check <ArrowRight size={15} /></a>
          </div>
          <div className="record-list">
            <div className="record-head"><span>YOUR RECENT TESTNET VERIFICATIONS</span><span><i /> On-chain</span></div>
            {history.length === 0 && <div className="record-empty"><FileCheck2 size={24} /><strong>No proofs created on this device yet</strong><span>Analyze content, connect your wallet, and anchor the result to see it here.</span></div>}
            {history.map((item) => (
              <a className="record-row" href={`/verify/${item.objectId}`} key={item.objectId}>
                <span className={`record-mark ${item.riskLevel === "LOW" ? "safe" : item.riskLevel === "HIGH" ? "danger" : "caution"}`}>{item.riskLevel === "LOW" ? <ShieldCheck size={17} /> : item.riskLevel === "HIGH" ? <AlertTriangle size={17} /> : <Link2 size={17} />}</span>
                <div><strong>{item.verificationId}</strong><small>{new Date(item.createdAt).toLocaleString()} · {shortId(item.objectId)}</small></div>
                <span className={`record-score ${item.riskLevel === "LOW" ? "safe-text" : item.riskLevel === "HIGH" ? "danger-text" : "caution-text"}`}>{item.trustScore}<small>/100</small></span>
              </a>
            ))}
            <div className="record-foot"><LockKeyhole size={12} /> Original submitted content remains private</div>
          </div>
        </div>
      </section>

      <section className="trust-band" id="about">
        <div className="shell trust-band-inner">
          <p><ShieldCheck size={19} /> BUILT FOR DIGITAL SELF-DEFENCE</p>
          <blockquote>“Don’t just trust the answer.<br /><span>Trust the evidence behind it.</span>”</blockquote>
          <div className="micro-marks"><span>GONKA<br /><small>DECENTRALIZED AI</small></span><i /><span>SUI<br /><small>VERIFIABLE PROOF</small></span></div>
        </div>
      </section>
    </main>
  );
}
